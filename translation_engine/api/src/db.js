const mariadb = require("mariadb");

const db_connection  = mariadb.createPool({
    host: 'untertitle-db',
    user: 'ut',
    password: 'ut',
    database: 'untertitle_db',
    port: 3306,
    connectionLimit : 5
});

module.exports = {
  getConnection() {
    return new Promise(function (res, rej) {
        db_connection.getConnection()
        .then(function (conn) {
          res(conn);
        })
        .catch(function (error) {
          rej(error);
        });
    });
  }
};