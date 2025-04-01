// console.log("table/index")
const express = require("express")
const router = express.Router()
const tableController = require("./table.controller")
const middleware = require("../../middleware")

router.post("/add-table", middleware.checkAccessToken, tableController.addTableController) // Add New Table Data
router.post("/add-table-group", middleware.checkAccessToken, tableController.addTableGroupController) // Add Table Group
router.post("/add-table-into-group", middleware.checkAccessToken, tableController.addTableGroupAssignmentController) // Add Table Group Assignment
router.post("/add-table-field", middleware.checkAccessToken, tableController.addTableFieldController) // Add Table Field Data
router.put("/update-table-name", middleware.checkAccessToken, tableController.updateTableNameController) // Update Table Name
router.put("/update-table-position", middleware.checkAccessToken, tableController.updateTablePositionController) // Update Table Position
router.put("/update-table-group-name", middleware.checkAccessToken, tableController.updateTableGroupNameController) // Update Table Group Name
router.put("/update-table-group-color", middleware.checkAccessToken, tableController.updateTableGroupColorController) // Update Table Group Color
router.get("/get-table-info", middleware.checkAccessToken, tableController.getTableInfoController) // Get Table Information
router.get("/get-table-group-info", middleware.checkAccessToken, tableController.getTableGroupInfoController) // Get Table Group Information
router.get("/get-table-field-data", middleware.checkAccessToken, tableController.getTableFieldDataController) // Get Table Field Data
router.put("/update-table-field-data", middleware.checkAccessToken, tableController.updateTableFieldDataController) // Update Table Field Data
router.delete("/remove-table-from-group", middleware.checkAccessToken, tableController.removeTableFromGroupController) // Remove Table From Group
router.delete("/delete-table-field", middleware.checkAccessToken, tableController.deleteTableFieldController) // Delete Table Field

module.exports = router
