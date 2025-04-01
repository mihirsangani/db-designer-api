const router = require("express").Router()
const res = require("express/lib/response")
const tableModule = require("./table.module")
const table2Module = require("./table_2.module")

const addTableController = async (req, res) => {
    const result = await tableModule.addTableModule(req)
    return res.send(result)
}

const addTableGroupController = async (req, res) => {
    const result = await tableModule.addTableGroupModule(req)
    return res.send(result)
}

const addTableGroupAssignmentController = async (req, res) => {
    const result = await tableModule.addTableGroupAssignmentModule(req)
    return res.send(result)
}

const addTableFieldController = async (req, res) => {
    const result = await tableModule.addTableFieldModule(req)
    return res.send(result)
}

const getTableFieldDataController = async (req, res) => {
    const result = await tableModule.getTableFieldDataModule(req)
    return res.send(result)
}

const updateTableFieldDataController = async (req, res) => {
    const result = await tableModule.updateTableFieldDataModule(req)
    return res.send(result)
}

const updateTableNameController = async (req, res) => {
    const result = await tableModule.updateTableNameModule(req)
    return res.send(result)
}

const updateTablePositionController = async (req, res) => {
    const result = await tableModule.updateTablePositionModule(req)
    return res.send(result)
}

const updateTableGroupNameController = async (req, res) => {
    const result = await tableModule.updateTableGroupNameModule(req)
    return res.send(result)
}

const updateTableGroupColorController = async (req, res) => {
    const result = await tableModule.updateTableGroupColorModule(req)
    return res.send(result)
}

const removeTableFromGroupController = async (req, res) => {
    const result = await tableModule.removeTableFromGroupModule(req)
    return res.send(result)
}

const getTableInfoController = async (req, res) => {
    const result = await tableModule.getTableInfoModule(req)
    return res.send(result)
}

const getTableGroupInfoController = async (req, res) => {
    const result = await tableModule.getTableGroupInfoModule(req)
    return res.send(result)
}

const deleteTableFieldController = async (req, res) => {
    const result = await table2Module.deleteTableFieldModule(req)
    return res.send(result)
}

module.exports = {
    addTableController: addTableController,
    addTableGroupController: addTableGroupController,
    addTableGroupAssignmentController: addTableGroupAssignmentController,
    addTableFieldController: addTableFieldController,
    getTableFieldDataController: getTableFieldDataController,
    updateTableFieldDataController: updateTableFieldDataController,
    updateTableNameController: updateTableNameController,
    updateTablePositionController: updateTablePositionController,
    updateTableGroupNameController: updateTableGroupNameController,
    updateTableGroupColorController: updateTableGroupColorController,
    removeTableFromGroupController: removeTableFromGroupController,
    getTableInfoController: getTableInfoController,
    getTableGroupInfoController: getTableGroupInfoController,
    deleteTableFieldController: deleteTableFieldController
}
