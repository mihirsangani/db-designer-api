// console.log("user/index")
const express = require("express")
const router = express.Router()
const globalController = require("./global.controller")
const middleware = require("../../middleware")

router.get("/get-color-details", globalController.getColorController) // Get Table Color Details
router.get("/status", globalController.getStatusListController) // Get User Status List
router.get("/get-project-access-role-list", middleware.checkAccessToken, globalController.getProjectAccessRoleListController) // Get Project Access Role List
router.post("/invite-user-to-organization", middleware.checkAccessToken, globalController.inviteUserToOrganizationController) // Invite User To Organization
router.put("/accept-invitation-for-organization", middleware.checkAccessToken, globalController.acceptInvitationForOrganizationController) // Accept Invitation To Organization
router.get("/get-active-organization", middleware.checkAccessToken, globalController.changeAvtiveOrganizationController) // Add User Selected Organization
router.get("/get-user-organization-invitation-info", globalController.getUserOrganizationInvitationInfoController) // Get User Organization Invitation Information
router.get("/get-database-list", middleware.checkAccessToken, globalController.getDatabaseListController) // Get Project Database Types
router.get("/get-datatypes-list", middleware.checkAccessToken, globalController.getDatatypesListController) // Get Project DataTypes List

module.exports = router
