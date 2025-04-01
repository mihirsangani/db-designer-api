console.log("global.controller")
const router = require("express").Router()
const res = require("express/lib/response")
const globalModule = require("./global.module")

const getColorController = async (req, res) => {
    const result = await globalModule.getColorModule(req)
    return res.send(result)
}

const getStatusListController = async (req, res) => {
    const result = await globalModule.getStatusListModule(req)
    return res.send(result)
}

const getProjectAccessRoleListController = async (req, res) => {
    const result = await globalModule.getProjectAccessRoleListModule(req)
    return res.send(result)
}

const inviteUserToOrganizationController = async (req, res) => {
    const result = await globalModule.inviteUserToOrganizationModule(req)
    return res.send(result)
}

const acceptInvitationForOrganizationController = async (req, res) => {
    const result = await globalModule.acceptInvitationForOrganizationModule(req)
    return res.send(result)
}

const changeAvtiveOrganizationController = async (req, res) => {
    const result = await globalModule.changeAvtiveOrganizationModule(req)
    return res.send(result)
}

const getUserOrganizationInvitationInfoController = async (req, res) => {
    const result = await globalModule.getUserOrganizationInvitationInfoModule(req)
    return res.send(result)
}

const getDatabaseListController = async (req, res) => {
    const result = await globalModule.getDatabaseListModule(req)
    return res.send(result)
}

const getDatatypesListController = async (req, res) => {
    const result = await globalModule.getDatatypesListModule(req)
    return res.send(result)
}

module.exports = {
    getColorController: getColorController,
    getStatusListController: getStatusListController,
    getProjectAccessRoleListController: getProjectAccessRoleListController,
    inviteUserToOrganizationController: inviteUserToOrganizationController,
    acceptInvitationForOrganizationController: acceptInvitationForOrganizationController,
    changeAvtiveOrganizationController: changeAvtiveOrganizationController,
    getUserOrganizationInvitationInfoController: getUserOrganizationInvitationInfoController,
    getDatabaseListController: getDatabaseListController,
    getDatatypesListController: getDatatypesListController
}
