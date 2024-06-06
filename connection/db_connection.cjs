require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

try {
    pool = mysql.createPool({
        host: process.env.HOST,
        user: process.env.USER,
        database: process.env.DATABASE,
        password: process.env.PASSWORD,
    });
} catch (err) {
    console.error(err);
}

module.exports =pool;