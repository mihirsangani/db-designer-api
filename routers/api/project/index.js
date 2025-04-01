// console.log("project/index")
const express = require("express")
const router = express.Router()
const projectController = require("./project.controller")
const middleware = require("../../middleware")

router.get("/get-user-project-data", middleware.checkAccessToken, projectController.getUserProjectDetailsController) // Get User Project Detail
router.post("/add-new-project", middleware.checkAccessToken, projectController.addProjectController) // Add New Project
router.post("/add-project-user-access", middleware.checkAccessToken, projectController.addProjectUserAccessController) // Add Project User Access
router.put("/update-project-user-access", middleware.checkAccessToken, projectController.updateProjectUserAccessController) // Update Project User Access
router.put("/update-project-name", middleware.checkAccessToken, projectController.updateProjectNameController) // Update Project Name
router.get("/get-organization-project-details", middleware.checkAccessToken, projectController.getOrganizationProjectInfoController) // Get Organization Project Details

// router.get('/get-project-details', middleware.checkAccessToken, projectController.projectDetailsController);

module.exports = router
