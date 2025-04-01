var mysql = require("mysql")

var client = mysql.createConnection({
    host: "localhost",
    database: "socket_database",
    user: "root",
    password: ""
})

client.connect(function (err) {
    if (err) throw err
    console.log("Connected!")
})

module.exports = client
