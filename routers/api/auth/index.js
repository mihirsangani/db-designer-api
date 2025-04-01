// console.log("auth/index")
const express = require("express")
const middleware = require("../../middleware")
const router = express.Router()
const authController = require("./auth.controller")

router.post("/", authController.checkLoginController) // Authorization (Login)
router.post("/verify-token", authController.verifyEmailController) // Verify OTP
router.post("/reset-password", authController.passwordResetController) // Reset Password
router.put("/update-password", authController.passwordUpdateController) // Update Password
router.post("/logout", middleware.checkAccessToken, authController.logoutController) // Logout

module.exports = router
