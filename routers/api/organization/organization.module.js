// console.log("organization.module")
const router = require("express").Router()
const organizationDB = require("./organization.db")
const OrganizationFunction = require("./organization.function")
const userDB = require("../user/user.db")
const globalDb = require("../global/global.db")
const LibFunction = require("../../../helpers/LibFunction")
const projectDB = require("../project/project.db")
const constant = require("../../../helpers/constant")
const dotenv = require("dotenv").config()
const res = require("express/lib/response")

const createOrganizationModule = async (changeLogId, userId, organizationName, organizationStatusId) => {
    if ((!userId, !changeLogId, !organizationName, !organizationStatusId)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }
    const flagFalse = false

    const registerNewOrganization = await organizationDB.registerNewOrganizationDB(userId, changeLogId)
    const organizationId = registerNewOrganization.data[0].organization_id

    const addOrganizationdata = await organizationDB.addOrganizationdataDb(changeLogId, organizationId, organizationStatusId, organizationName, flagFalse)
    if (addOrganizationdata.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const activeStatusId = await LibFunction.getStatusIdFromStatusName("Active")
    const userOrganizationStatusId = activeStatusId.data[0].status_id

    const registerNewUserToOrganization = await organizationDB.registerNewUserToOrganizationDB(changeLogId)
    const userOrganizationId = registerNewUserToOrganization.data[0].user_organization_id

    const addUserOrganizationdata = await organizationDB.addUserOrganizationDataDb(userOrganizationId, userId, changeLogId, organizationId, userOrganizationStatusId, flagFalse)
    if (addUserOrganizationdata.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const getUserOrganizationdata = await organizationDB.getOganizationInfoDB(organizationId, flagFalse)

    var result = []
    const organizationDetails = {
        "organization_created_by_user_id": userId,
        "user_organization_id": userOrganizationId,
        "organization_id": organizationId,
        "organization_name": getUserOrganizationdata.data[0].organization_name,
        "organization_status": {
            "organization_status_id": getUserOrganizationdata.data[0].organization_status_id,
            "organization_status_name": getUserOrganizationdata.data[0].status_name
        }
    }
    result.push(organizationDetails)

    return result
}

const updateOrganizationNameModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const flagTrue = true
    const flagFalse = false

    const organizationName = req.body.organization_name

    if (!organizationName) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const checkuser = await userDB.getUserInformationByUserID(userId, flagFalse)
    if (checkuser.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }

    const getUserSelectedOrganizationId = await globalDb.getUserSelectedOrganizationIdInDB(userId)
    if (getUserSelectedOrganizationId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_SELECTED
        }
    }

    const organizationId = getUserSelectedOrganizationId.data[0].organization_id
    const checkOrganizationCreator = await LibFunction.checkOrganizationCreatorDB(organizationId, flagFalse)
    if (checkOrganizationCreator.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_NOT_EXISTS
        }
    }

    const organizationCreatedByUserId = checkOrganizationCreator.data[0].organization_created_by_user_id
    if (organizationCreatedByUserId != userId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_OWNER_ACCESS
        }
    }

    const currOrganizationName = checkOrganizationCreator.data[0].organization_name
    if (organizationName.toLowerCase() == currOrganizationName.toLowerCase()) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NAME
        }
    }

    const organizationStatusId = checkOrganizationCreator.data[0].organization_status_id

    const createchangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createchangeLogId.data[0].change_log_id

    const updateOrganizationFlag = await organizationDB.updateOrganizationFlagDB(changeLogId, organizationId, flagTrue, flagFalse)
    if (updateOrganizationFlag.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const addOrganizationdata = await organizationDB.addOrganizationdataDb(changeLogId, organizationId, organizationStatusId, organizationName, flagFalse)
    if (addOrganizationdata.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    return {
        status: true
    }
}

const getUserOrganizationDetailModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const flagFalse = false

    var userdata = await userDB.getUserInformationByUserID(userId, flagFalse)
    if (userdata.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }

    var orgdata = await organizationDB.getUserOrganizationInformationByUserID(userId, flagFalse)

    var userDataArr = userdata.data
    var orgDataArr = orgdata.data

    var orgArrOfUser = []
    for (i = 0; i < orgDataArr.length; i++) {
        var orgObj = {
            "organization_id": orgDataArr[i].organization_id,
            "organization_name": orgDataArr[i].organization_name,
            "organization_created_by_user_id": orgDataArr[i].organization_created_by_user_id,
            "user_organization_id": orgDataArr[i].user_organization_id,
            "user_organization_status_id": orgDataArr[i].user_organization_user_status_id,
            "user_organization_status_name": orgDataArr[i].status_name
        }
        orgArrOfUser.push(orgObj)
    }

    var result = []
    var userInfo = {
        "user_id": userDataArr[0].user_id,
        "user_email_address": userDataArr[0].user_data_emailaddress,
        "username": userDataArr[0].user_first_name,
        "organization": orgArrOfUser
    }
    result.push(userInfo)

    return {
        status: true,
        data: result
    }
}

const getOrgnaizationUserInfoModule = async (req) => {
    const userId = req.user_data.user_id

    const flagFalse = false

    const getUserSelectedOrganizationId = await globalDb.getUserSelectedOrganizationIdInDB(userId)
    if (getUserSelectedOrganizationId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_SELECTED
        }
    }

    const organizationId = getUserSelectedOrganizationId.data[0].organization_id
    const checkUserAndOrganization = await OrganizationFunction.checkUserAndOrganizationInDb(userId, organizationId, flagFalse)
    if (!checkUserAndOrganization.status) {
        return checkUserAndOrganization
    }

    const getUserOrganizationInfo = await organizationDB.getCurrOrganizationUserInfoDB(userId, organizationId, flagFalse)
    if (getUserOrganizationInfo.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }
    const organizationName = getUserOrganizationInfo.data[0].organization_name
    const organizationCreatedByUserId = getUserOrganizationInfo.data[0].organization_created_by_user_id

    const getUserInOrganization = await organizationDB.getUserInOrganization(organizationId, flagFalse)
    const userInOrganization = getUserInOrganization.data
    if (userInOrganization.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    var userIdArr = userInOrganization.map((obj) => {
        return obj.user_id
    })

    const getUserOrganizationProjectDetails = await projectDB.getUserOrganizationProjectDetailsDB(userIdArr.join(","), organizationId, flagFalse)
    const userOrganizationProjectDetails = getUserOrganizationProjectDetails.data

    const getUserInfo = await userDB.getUserInformationByUserID(userIdArr.join(","), flagFalse)
    const userInfo = getUserInfo.data

    var userData = []
    for (i = 0; i < userInOrganization.length; i++) {
        const currUserId = userInOrganization[i].user_id
        var projectData = []
        for (j = 0; j < userOrganizationProjectDetails.length; j++) {
            if (currUserId == userOrganizationProjectDetails[j].user_id) {
                const data = {
                    "project_created_by_user_id": userOrganizationProjectDetails[j].project_created_by_user_id,
                    "project_id": userOrganizationProjectDetails[j].project_id,
                    "project_name": userOrganizationProjectDetails[j].project_name,
                    "project_role_id": userOrganizationProjectDetails[j].project_access_role_id,
                    "project_role_type": userOrganizationProjectDetails[j].project_access_role_type
                }
                projectData.push(data)
            }
        }

        for (j = 0; j < userInfo.length; j++) {
            if (currUserId == userInfo[j].user_id) {
                const data = {
                    "user_id": userInfo[j].user_id,
                    "user_email_address": userInfo[j].user_data_emailaddress,
                    "username": userInfo[j].user_first_name,
                    "user_organization_status_id": userInfo[j].user_organization_user_status_id,
                    "user_organization_status_name": userInfo[j].status_name,
                    "project": projectData
                }
                userData.push(data)
                j = userInfo.length
            }
        }
    }

    var result = []
    const fianalData = {
        "current_login_user_id": userId,
        "organization_created_by_user_id": organizationCreatedByUserId,
        "organization_id": organizationId,
        "organization_name": organizationName,
        "user": userData
    }
    result.push(fianalData)

    return {
        status: true,
        data: result
    }
}

module.exports = {
    createOrganizationModule: createOrganizationModule,
    updateOrganizationNameModule: updateOrganizationNameModule,
    getUserOrganizationDetailModule: getUserOrganizationDetailModule,
    getOrgnaizationUserInfoModule: getOrgnaizationUserInfoModule
}
