require('dotenv').config();
const sequelize = require('../config/database');

describe('Database config', () => {
    it('should load environment variables', () => {
        expect(process.env.DB_NAME).toBeDefined();
        expect(process.env.DB_USER).toBeDefined();
    });

    it('should have valid sequelize config', () => {
        expect(sequelize).toBeDefined();
        expect(typeof sequelize.authenticate).toBe('function');
    });
});