const { writeFile } = require("fs")
const database = require("../connection/database")

const socketConnection = function (io) {
    // Connect Socket
    io.on("connection", (socket) => {
        var socketId = socket.id
        socket.emit("connected test", "connected test")
        // // Update Socket Id To Database
        // socket.on("firstcall", (userId) => {
        //     var sql = `UPDATE user_socket_info SET socket_id = '${socketId}' WHERE user_socket_info_id = ${userId}`
        //     database.query(sql, (err) => {
        //         if (err) throw err
        //     })
        // })

        // // Send User Active Data
        // var sql = `SELECT username, socket_id FROM user_socket_info WHERE flag_deleted = 0`
        // database.query(sql, (err, result) => {
        //     if (err) throw err

        //     var obj = {
        //         userId: socketId,
        //         data: result
        //     }
        //     io.emit("user data", obj)
        // })

        // socket.on("chat message", (sendMsgData) => {
        //     // Send Private Message
        //     if (sendMsgData.msgType == "PRIVATE") {
        //         var sql = `SELECT username FROM user_socket_info WHERE user_socket_info_id = ${sendMsgData.fromUserId} AND flag_deleted = 0`
        //         console.log(sql)

        //         database.query(sql, (err, result) => {
        //             if (err) throw err
        //             var sendMsg = {
        //                 from: result[0].username,
        //                 message: sendMsgData.message
        //             }

        //             io.to(sendMsgData.toSocketId).emit("chat message", sendMsg)
        //         })
        //     }

        //     // Send BroadCast Message
        //     else if (sendMsgData.msgType == "PUBLIC") {
        //         var sql = `SELECT username FROM user_socket_info WHERE user_socket_info_id = ${sendMsgData.fromUserId} AND flag_deleted = 0`
        //         console.log(sql)

        //         database.query(sql, (err, result) => {
        //             if (err) throw err
        //             var sendMsg = {
        //                 from: result[0].username,
        //                 message: sendMsgData.message
        //             }

        //             socket.broadcast.emit("chat message", sendMsg)
        //         })
        //     }
        // })
    })
}

module.exports = socketConnection
