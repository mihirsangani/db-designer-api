const express = require("express")
const router = express.Router()
const app = express()

const database = require("../connection/database")

/* GET home page. */
router.get("/", (req, res) => {
    res.render("login", { title: "Chat Apllication" })
})

router.post("/home", async function (req, res) {
    var user = req.body.username
    if (!user) {
        res.render("login")
    } else {
        var sql = `SELECT * FROM user_socket_info WHERE username = '${user}' AND flag_deleted = 0`
        database.query(sql, async (err, result) => {
            if (err) throw err
            if (result.length > 0) {
                res.render("login")
            } else {
                var sql = `INSERT INTO user_socket_info (username, flag_deleted) VALUES ('${user}', 0)`
                database.query(sql, (err, result) => {
                    if (err) throw err
                    res.render("home", { username: user, userInfoId: result.insertId })
                })
            }
        })
    }
})

router.post("/logout", async function (req, res) {
    var userId = req.body.userid
    if (userId) {
        var sql = `UPDATE user_socket_info SET flag_deleted = 1 WHERE user_socket_info_id = ${userId}`
        database.query(sql, (err) => {
            if (err) throw err
            req.session.destroy()
            res.redirect("/")
        })
    }
})

module.exports = router
