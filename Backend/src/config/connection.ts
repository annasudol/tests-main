import {Sequelize} from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// SQLite database file path
const DB_PATH = path.join(process.cwd(), 'database.sqlite');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DB_PATH,
    logging: false, // Set to console.log to see SQL queries
});

export default sequelize;