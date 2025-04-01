const database = require("../connection/database")

const getAllUserData = async () => {
    var flag = 0
    var sql = `SELECT username FROM user_socket_info WHERE flag_deleted = ${flag}`
    database.query(sql, async (err, result) => {
        if (err) throw err
        console.log("data:::::::::::::", result)
        return {
            status: true,
            data: result
        }
    })
}

const addUserInfo = async (user, socketId) => {
    var flag = 0
    var sql = `INSERT INTO user_socket_info (username, socket_id, flag_deleted)
    VALUES ('${user}', '${socketId}', ${flag})`
    database.query(sql, async (err, result) => {
        if (err) throw err
        return result.insertId
    })
}

const getUserNameInfo = async (username) => {
    var flag = 0
    var sql = `SELECT * FROM user_socket_info WHERE username = '${username}' AND flag_deleted = ${flag}`
    database.query(sql, async (err, result) => {
        if (err) throw err
        console.log("username exist::::::::::::::", result)
        Object.keys(result).forEach((key) => {
            var row = result[key]
            return row
        })
    })
}

module.exports = {
    getAllUserData: getAllUserData,
    addUserInfo: addUserInfo,
    getUserNameInfo: getUserNameInfo
}
