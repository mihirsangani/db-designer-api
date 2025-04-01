const socketConnection = function (io) {
    // Connect Socket
    io.on("connection", (socket) => {
        var socketId = socket.id
        console.log("Socket Connected...!!")
        socket.emit("connected socket", "test")
    })
}

module.exports = socketConnection
