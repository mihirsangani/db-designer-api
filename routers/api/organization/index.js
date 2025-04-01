// console.log("organization/index")
const express = require("express")
const router = express.Router()
const organizationcontroller = require("./organization.controller")
const middleware = require("../../middleware")
const organizationController = require("./organization.controller")

router.get("/get-user-organization-detail", middleware.checkAccessToken, organizationController.getUserOrganizationDetailController) // GET User Organization Detail
router.put("/update-organization-name", middleware.checkAccessToken, organizationController.updateOrganizationNameController) // Update Organization Name
router.get("/get-organization-user-info", middleware.checkAccessToken, organizationController.getOrgnaizationUserInfoController) // Get User's Information From Current Organization
module.exports = router
