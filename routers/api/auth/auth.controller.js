// console.log("auth.controller");
const express = require("express")
const router = express.Router()
const res = require("express/lib/response")
const authModule = require("./auth.module")

const checkLoginController = async (req, res) => {
    const result = await authModule.checkLoginModule(req)
    if (result.status) {
        res.setHeader("Set-Cookie", `db-ssid=${result.data.access_token}; Domain=${process.env.COOKIE_DOMAIN};Secure;Path=/;HttpOnly;SameSite=None;`)
        return res.json(result)
    } else {
    return res.send(result)
    }
}

const verifyEmailController = async (req, res) => {
    const result = await authModule.verifyEmailModule(req)
    return res.send(result)
}

const passwordResetController = async (req, res) => {
    const result = await authModule.passwordResetModule(req)
    return res.send(result)
}

const passwordUpdateController = async (req, res) => {
    const result = await authModule.passwordUpdateModule(req)
    return res.send(result)
}

const logoutController = async (req, res) => {
    const result = await authModule.logoutModule(req)
    return res.send(result)
}

module.exports = {
    checkLoginController: checkLoginController,
    verifyEmailController: verifyEmailController,
    passwordResetController: passwordResetController,
    passwordUpdateController: passwordUpdateController,
    logoutController: logoutController
}
