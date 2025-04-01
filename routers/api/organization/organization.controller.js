const router = require("express").Router()
const res = require("express/lib/response")
const organizationModule = require("./organization.module")

const getUserOrganizationDetailController = async (req, res) => {
    const result = await organizationModule.getUserOrganizationDetailModule(req)
    return res.send(result)
}

const updateOrganizationNameController = async (req, res) => {
    const result = await organizationModule.updateOrganizationNameModule(req)
    return res.send(result)
}

const getOrgnaizationUserInfoController = async (req, res) => {
    const result = await organizationModule.getOrgnaizationUserInfoModule(req)
    return res.send(result)
}
module.exports = {
    getUserOrganizationDetailController: getUserOrganizationDetailController,
    updateOrganizationNameController: updateOrganizationNameController,
    getOrgnaizationUserInfoController: getOrgnaizationUserInfoController
}
