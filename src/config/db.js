const mysql = require('mysql2');
const { promisify } = require('util');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: 'epytodo',
  connectionLimit: 10,
});

pool.query = promisify(pool.query);

module.exports = pool;