// console.log("user.controller")
const router = require("express").Router()
const res = require("express/lib/response")
const userModule = require("./user.module")

const postUserController = async (req, res) => {
    const result = await userModule.postUserModule(req)
    return res.send(result)
}

const getAllUserInformationController = async (req, res) => {
    const result = await userModule.getAllUserInformationModule(req)
    return res.send(result)
}

const updateUsernameController = async (req, res) => {
    const result = await userModule.updateUsernameModule(req)
    return res.send(result)
}

module.exports = {
    postUserController: postUserController,
    getAllUserInformationController: getAllUserInformationController,
    updateUsernameController: updateUsernameController
}
