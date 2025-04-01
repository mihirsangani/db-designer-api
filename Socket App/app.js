const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const session = require("express-session")
var bodyParser = require("body-parser")
var app = express()

const http = require("http")
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {
    cors: {
        origin: "http://localhost"
    }
})
const socketConnection = require("./socket.io/socket.io")

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(
    session({
        secret: "SecretKey12345",
        resave: false,
        saveUninitialized: false
    })
)

const indexRouter = require("./routes")

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

socketConnection(io)
app.use("/", indexRouter)


server.listen(3003, () => {
    console.log("listening on *:3003")
})

module.exports = app
