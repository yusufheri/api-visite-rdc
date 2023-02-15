import mysql from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    connectionLimit : 100, //important
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    debug: false
});

export default pool;