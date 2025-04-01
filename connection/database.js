const { Client } = require("pg");
console.log("database");
const client = new Client({
    host: "35.226.213.119",
    port: 5432,
    user: "postgres",
    password: "dfsjk43df786qh",
    database: "db_creator"
});
client.connect();
// client.query('SELECT * FROM status',(err,res)=>{

//     if(!err){

//         console.log(res.rows);
//     }
//     client.end();
// })

module.exports = client;
