const express = require("express")
const http = require("http")
const app = express()
const server2 = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server2, {
    cors: {
        origin: "http://localhost"
    }
})
const path = require("path")
const cookieParser = require("cookie-parser")
const sessions = require("express-session")
var bodyParser = require("body-parser")
const socketConnection = require("./socket.io/socket.io") // Socket JS File
const apiRouter = require("./routers")

// Body Parser Converts Data Into JSON Format
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Start Session/Cookie
app.use(cookieParser())
// const oneDay = 1000 * 60 * 60 * 24
app.use(
    sessions({
        secret: "SecretKey12345",
        resave: false,
        saveUninitialized: false
    })
)

// Array Of Cors (Domains)
const cors = require("cors")
app.use(
    cors({
        origin: ["https://aceanalytics.stoplight.io"],
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
        credentials: true
    })
)

// view engine setup
// app.set("views", path.join(__dirname, "views"))
// app.set("view engine", "ejs")

// Connect Socket
socketConnection(io)

// Router
app.use("/", apiRouter)

// Server Listening To Port Number
app.listen(3000, function () {
    console.log("Server started at 3000")
})

module.exports = app
