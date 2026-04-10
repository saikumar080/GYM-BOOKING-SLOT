const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'hopper.proxy.rlwy.net',
  user: 'root',
  password: 'QXOjOPMwNOksADGgSYjfJxbFBaNDgDFx',
  database: 'railway',
  port: 15572,
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
  } else {
    console.log('MySQL Connected!');
  }
});

module.exports = db;