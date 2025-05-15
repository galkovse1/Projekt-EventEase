import dotenv from 'dotenv';
dotenv.config();

const env = {
  dbHost: process.env.DB_SQL_HOST,
  dbUserName: process.env.DB_SQL_USERNAME as string,
  dbPort: Number(process.env.DB_SQL_PORT),
  dbPassword: process.env.DB_SQL_PASSWORD,
  dbDataBaseName: process.env.DB_SQL_DATABASENAME as string,
  dbDialect: process.env.DB_SQL_DIALECT,
  dbAppPort: Number(process.env.PORT_PROD),
  clientAppUrl: process.env.CLIENT_DOMAIN_URL, // ✅ tukaj popravljeno
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudPublicKey: process.env.CLOUDINARY_PUBLIC_KEY,
  cloudSecretKey: process.env.CLOUDINARY_SECRET_KEY,
};

if (process.env.NODE_ENV === 'testing') {
  env.dbDataBaseName = process.env.DB_SQL_DATABASENAME_TESTS as string;
  env.dbAppPort = Number(process.env.PORT_TESTS);
}

export default env;
