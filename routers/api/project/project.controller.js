console.log("project.controller")
const router = require("express").Router()
const dotenv = require("dotenv").config()
const res = require("express/lib/response")
const projectModule = require("./project.module")

const addProjectController = async (req, res) => {
    const result = await projectModule.addProjectModule(req)
    return res.send(result)
}

const addProjectUserAccessController = async (req, res) => {
    const result = await projectModule.addProjectAccessModule(req)
    return res.send(result)
}

const updateProjectUserAccessController = async (req, res) => {
    const result = await projectModule.updateProjectAccessModule(req)
    return res.send(result)
}

const updateProjectNameController = async (req, res) => {
    const result = await projectModule.updateProjectNameModule(req)
    return res.send(result)
}

const projectDetailsController = async (req, res) => {
    const result = await projectModule.projectDetailsModule(req)
    return res.send(result)
}

const getUserProjectDetailsController = async (req, res) => {
    const result = await projectModule.getUserProjectDetailsModule(req)
    return res.send(result)
}

const getOrganizationProjectInfoController = async (req, res) => {
    const result = await projectModule.getOrganizationProjectInfoModule(req)
    return res.send(result)
}

module.exports = {
    addProjectController: addProjectController,
    addProjectUserAccessController: addProjectUserAccessController,
    updateProjectUserAccessController: updateProjectUserAccessController,
    updateProjectNameController: updateProjectNameController,
    projectDetailsController: projectDetailsController,
    getUserProjectDetailsController: getUserProjectDetailsController,
    getOrganizationProjectInfoController: getOrganizationProjectInfoController
}
