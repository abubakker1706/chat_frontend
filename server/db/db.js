import mysql from 'mysql2/promise';

export const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Abu@1706',
  database: 'user',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});




