async function sendEventNotification(email, event) {
    // Tukaj lahko dodaš dejansko logiko pošiljanja e-pošte
    // Za zdaj samo izpišemo v konzolo
    console.log(`(Simulacija) Pošiljanje emaila na ${email} o dogodku "${event.title}"`);
}

module.exports = {
    sendEventNotification
};