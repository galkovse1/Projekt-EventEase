import { Sequelize, Dialect } from 'sequelize';

import env from '../config/env';

export const sequelize = new Sequelize(env.dbDataBaseName, env.dbUserName, env.dbPassword, {
  host: env.dbHost,
  dialect: env.dbDialect as Dialect,
  port: env.dbPort,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
