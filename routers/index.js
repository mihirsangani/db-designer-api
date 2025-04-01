const express = require("express")
const router = express.Router()

router.use("/api/user", require("./api/user"))
router.use("/api/auth", require("./api/auth"))
router.use("/api/organization", require("./api/organization"))
router.use("/api/global", require("./api/global"))
router.use("/api/project", require("./api/project"))
router.use("/api/table", require("./api/table"))

module.exports = router
