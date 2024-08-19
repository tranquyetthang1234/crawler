const mysql = require('mysql');

class Database {
  constructor() {
    if (!Database.instance) {
      
      this.pool = mysql.createPool({
        connectionLimit: 10,
        host: 'localhost',
        user: 'username',
        password: 'password',
        database: 'database_name',
      });

      Database.instance = this;
    }

    return Database.instance;
  }

  query(sql, args) {
    return new Promise((resolve, reject) => {
      this.pool.query(sql, args, (err, rows) => {
        if (err) {
          return reject(err);
        }

        resolve(rows);
      });
    });
  }

  // method 
}

module.exports = new Database();