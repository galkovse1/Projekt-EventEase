const { auth } = require('express-oauth2-jwt-bearer');

// Custom middleware, ki nikoli ne vrže 401 na /visible
function optionalAuth(req, res, next) {
  // Če ni Authorization headerja, nadaljuj kot neprijavljen
  if (!req.headers.authorization) return next();

  // Če je Authorization header, poskusi preveriti JWT
  const inner = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    credentialsRequired: false,
  });

  inner(req, res, function(err) {
    // Če je napaka pri preverjanju JWT, ignoriraj in nadaljuj kot neprijavljen
    if (err) {
      req.auth = undefined;
      return next();
    }
    next();
  });
}

module.exports = optionalAuth; 