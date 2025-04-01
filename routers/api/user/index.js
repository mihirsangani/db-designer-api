// console.log("user/index")
const express = require("express")
const router = express.Router()
const userController = require("./user.controller")
const middleware = require("../../middleware")

router.post("/", userController.postUserController) // Create New User And New Organization
router.get("/get-info", middleware.checkAccessToken, userController.getAllUserInformationController) // Get All User Information
router.put("/update-username", middleware.checkAccessToken, userController.updateUsernameController) // Update Username

module.exports = router
