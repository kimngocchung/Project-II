const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "1234",
    database: "qlylichhen",
});

connection.connect(function(error) {
    if (error) {
        throw error;
    } else {
        console.log("Connected to the database successfully!");
    }
});

module.exports = connection;
