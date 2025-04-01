console.log("global.module")
const router = require("express").Router()
const globalDb = require("./global.db")
const userDB = require("../user/user.db")
const organizationDB = require("../organization/organization.db")
const OrganizationFunction = require("../organization/organization.function")
const TableFunction = require("../table/table.function")
const LibFunction = require("../../../helpers/LibFunction")
const constant = require("../../../helpers/constant")

const getColorModule = async () => {
    const getTableId = await globalDb.getColorDB()

    if (getTableId.data.length > 0) {
        var result = []
        for (i = 0; i < getTableId.data.length; i++) {
            var temp = {
                "color_name": getTableId.data[i].color_name,
                "color_code": getTableId.data[i].color_value,
                "color_id": getTableId.data[i].color_id
            }
            result.push(temp)
        }
        return {
            status: true,
            data: result
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_GENERAL
        }
    }
}

const getStatusListModule = async () => {
    const getStatusList = await globalDb.getStatusListDB()

    if (getStatusList.data.length > 0) {
        var result = []
        for (i = 0; i < getStatusList.data.length; i++) {
            const data = {
                "status_id": getStatusList.data[i].status_id,
                "status_name": getStatusList.data[i].status_name,
                "status_description": getStatusList.data[i].status_description
            }
            result.push(data)
        }
        return {
            status: true,
            data: result
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_GENERAL
        }
    }
}

const getProjectAccessRoleListModule = async () => {
    const getProjectAccessRoleList = await globalDb.getProjectAccessRoleListDB()

    if (getProjectAccessRoleList.data.length > 0) {
        var result = []
        for (i = 0; i < getProjectAccessRoleList.data.length; i++) {
            const data = {
                "project_access_role_id": getProjectAccessRoleList.data[i].project_access_role_id,
                "project_access_role_type": getProjectAccessRoleList.data[i].project_access_role_type
            }
            result.push(data)
        }
        return {
            status: true,
            data: result
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_GENERAL
        }
    }
}

const inviteUserToOrganizationModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const newUserEmailAddress = req.body.user_email_address
    const userOrganizationStatusId = req.body.user_organization_status_id

    const flagFalse = false
    const flagTrue = true
    var date = new Date()

    if (!newUserEmailAddress || !userOrganizationStatusId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getStatusIdArr = await LibFunction.getAllStatusIdArray()
    if (!getStatusIdArr.includes(userOrganizationStatusId)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const emailRegexp = /^([a-zA-Z0-9\._]+)@([a-zA-Z)-9])+.([a-z]+)(.[a-z]+)?$/
    if (!emailRegexp.test(newUserEmailAddress)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_EMAIL_ADDRESS
        }
    }

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

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

    const checkOrganizationCreator = await LibFunction.getUserCreatedOrganizationDB(userId, flagFalse)
    if (checkOrganizationCreator.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_NOT_EXISTS
        }
    }
    if (checkOrganizationCreator.data[0].organization_id != organizationId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_OWNER_ACCESS
        }
    }

    // Set Both Null Initially
    var newUserEmail = null
    var newUserId = null

    const checkExistingUser = await userDB.getUserdata(newUserEmailAddress, flagFalse)
    if (checkExistingUser.data.length == 0) {
        newUserEmail = newUserEmailAddress // email
    } else {
        const inviteUserId = checkExistingUser.data[0].user_id
        const checkUserInOrganization = await organizationDB.checkUserInOrganizationDb(inviteUserId, organizationId, flagFalse)
        if (checkUserInOrganization.data.length > 0) {
            return {
                status: false,
                error: constant.requestMessages.ERR_EXISTS_IN_ORGANIZATION
            }
        }
        newUserId = inviteUserId // UserId
    }

    if (newUserId == null && newUserEmail == null) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_INVITATION_TOKEN
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const getUserOrganizationInvitationInfo = await organizationDB.getUserOrganizationInvitationInfoByIdDB(newUserId, newUserEmail, flagFalse)
    if (getUserOrganizationInvitationInfo.data.length > 0) {
        const expireInvitationToken = getUserOrganizationInvitationInfo.data[0].user_organization_invitation_token
        const updateFlag = await organizationDB.updateUserOrganizationInvitationFlagDB(changeLogId, expireInvitationToken, flagTrue, flagFalse)
        if (updateFlag.data.length == 0) {
            return {
                status: false,
                error: constant.requestMessages.ERR_QUERY
            }
        }
    }

    let currentTime = await LibFunction.formateDateLib(date)
    let expireTime = await LibFunction.formateDateLib(await LibFunction.getExpireTimeStamp(flagFalse))

    var accessToken = (await LibFunction.getRandomString(64)) + new Date().getTime()

    const addUserOrganizationInvitation = await userDB.addUserOrganizationInvitationInDB(organizationId, newUserId, newUserEmail, userOrganizationStatusId, changeLogId, flagFalse, currentTime, expireTime, accessToken)
    if (addUserOrganizationInvitation.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    if (newUserId != null && newUserEmail == null) {
        newUserEmail = newUserEmailAddress
    }

    const getOrganizationName = await organizationDB.getOrganizationNameDB(organizationId, flagFalse)
    const organizationName = getOrganizationName.data[0].organization_name.toUpperCase()

    var toEmail = newUserEmail
    var subjectEmail = `${organizationName} | Invitation To Our Organization`
    var outputEmail = `<p>Hello Mate,<br>We hope you are all well !</p>
                    <h3>Click the below button to join our organization</h3>
                    <a href="http://localhost:3000/api/global/accept-invitation-for-organization?token=${accessToken}"
                    style="background-color: blue; border: 0; border-radius: 10px; color: white; padding: 5px 25px;
                    text-align: center; display: inline-block; font-size: 15px; margin: 0; cursor: pointer; text-decoration:none;">
                    JOIN</a><br>
                    <p>Thank you & Have a nice day.</p>`

    const sendMail = await LibFunction.sendMailtoUser(toEmail, subjectEmail, outputEmail)

    return {
        status: true
    }
}

const acceptInvitationForOrganizationModule = async (req) => {
    const ipAddress = req.ip
    const currUserId = req.user_data.user_id

    const invitationToken = req.body.invitation_token

    const flagTrue = true
    const flagFalse = false

    var date = new Date()
    let currentTimeStamp = await LibFunction.getCurrentTimeStamp(date)

    const obj = {
        ipAddress: ipAddress,
        userId: currUserId
    }

    if (!invitationToken) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getUserInfo = await userDB.getUserInformationByUserID(currUserId, flagFalse)
    if (getUserInfo.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }

    const currUserEmailAddress = getUserInfo.data[0].user_data_emailaddress
    const getUserOrganizationInvitationInfo = await organizationDB.getUserOrganizationInvitationInfoDB(invitationToken, currentTimeStamp, flagFalse)
    if (getUserOrganizationInvitationInfo.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_INVITATION_TOKEN
        }
    }

    const userId = getUserOrganizationInvitationInfo.data[0].user_id
    const email = getUserOrganizationInvitationInfo.data[0].new_user_email_address
    const organizationId = getUserOrganizationInvitationInfo.data[0].organization_id
    const userOrganizationStatusId = getUserOrganizationInvitationInfo.data[0].user_organization_status_id

    if (userId == null && email != null) {
        if (email != currUserEmailAddress) {
            return {
                status: false,
                error: constant.requestMessages.ERR_INVALID_INVITATION_TOKEN
            }
        }
    } else if (userId != null && email == null) {
        if (userId != currUserId) {
            return {
                status: false,
                error: constant.requestMessages.ERR_INVALID_INVITATION_TOKEN
            }
        }
    }

    const checkUserInOrganization = await organizationDB.checkUserInOrganizationDb(currUserId, organizationId, flagFalse)
    if (checkUserInOrganization.data.length > 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_EXISTS_IN_ORGANIZATION
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addUserOrganization = await organizationDB.registerNewUserToOrganizationDB(changeLogId)
    const userOrganizationId = addUserOrganization.data[0].user_organization_id

    const addUserOrganizationData = await organizationDB.addUserOrganizationDataDb(userOrganizationId, currUserId, changeLogId, organizationId, userOrganizationStatusId, flagFalse)
    if (addUserOrganizationData.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const updateUserOrganizationInvitationFlag = await organizationDB.updateUserOrganizationInvitationFlagDB(changeLogId, invitationToken, flagTrue, flagFalse)
    if (updateUserOrganizationInvitationFlag.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    return {
        status: true
    }
}

const changeAvtiveOrganizationModule = async (req) => {
    const userId = req.user_data.user_id
    const organizationId = req.query.organization_id

    const flagFalse = false

    var date = new Date()
    let currentTimeStamp = await LibFunction.getCurrentTimeStamp(date)

    const obj = {
        ipAddress: req.ip,
        userId: userId
    }

    if (!organizationId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const checkUserAndOrganization = await OrganizationFunction.checkUserAndOrganizationInDb(userId, organizationId, flagFalse)
    if (!checkUserAndOrganization.status) {
        return checkUserAndOrganization
    }

    const checkUserInOrganization = await organizationDB.checkUserInOrganizationDb(userId, organizationId, flagFalse)
    if (checkUserInOrganization.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addUserSelectedOrganization = await userDB.addUserSelectedOrganizationInDB(userId, organizationId, changeLogId, currentTimeStamp)
    if (addUserSelectedOrganization.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    return {
        status: true
    }
}

const getUserOrganizationInvitationInfoModule = async (req) => {
    const invitationToken = req.query.invitation_token

    const flagFalse = false
    var date = new Date()
    let currentTimeStamp = await LibFunction.getCurrentTimeStamp(date)

    if (!invitationToken) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const getUserOrganizationInvitationInfo = await organizationDB.getUserOrganizationInvitationInfoDB(invitationToken, currentTimeStamp, flagFalse)
    if (getUserOrganizationInvitationInfo.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_INVITATION_TOKEN
        }
    }

    var result = []
    const data = {
        "user_id": getUserOrganizationInvitationInfo.data[0].user_id,
        "email_address": getUserOrganizationInvitationInfo.data[0].new_user_email_address,
        "organization_id": getUserOrganizationInvitationInfo.data[0].organization_id,
        "user_organization_status_id": getUserOrganizationInvitationInfo.data[0].user_organization_status_id
    }
    result.push(data)

    return {
        status: true,
        data: result
    }
}

const getDatabaseListModule = async () => {
    const getDatabaseList = await globalDb.getDatabaseListDB()

    if (getDatabaseList.data.length > 0) {
        var result = []
        for (i = 0; i < getDatabaseList.data.length; i++) {
            var data = {
                "database_id": getDatabaseList.data[i].project_database_type_id,
                "database_name": getDatabaseList.data[i].project_database_type_name
            }
            result.push(data)
        }

        return {
            status: true,
            data: result
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }
}

const getDatatypesListModule = async (req) => {
    const userId = req.user_data.user_id
    const projectId = req.query.project_id

    if (!projectId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const flagFalse = false

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    const getProjectDatabaseId = await LibFunction.getProjectDatabaseTypeId(projectId, flagFalse)
    const databaseId = getProjectDatabaseId.data[0].project_database_type_id

    const getProjectDataTypesList = await globalDb.getProjectDataTypesListDB(databaseId)

    var result = []
    for (i = 0; i < getProjectDataTypesList.data.length; i++) {
        const data = {
            "datatype_id": getProjectDataTypesList.data[i].table_field_data_type_id,
            "datatype_name": getProjectDataTypesList.data[i].table_field_data_type_name,
            "datatype_require_length_flag": getProjectDataTypesList.data[i].table_field_datatype_flag_length_accept
        }
        result.push(data)
    }

    return {
        status: true,
        data: result
    }
}

module.exports = {
    getStatusListModule: getStatusListModule,
    getColorModule: getColorModule,
    getProjectAccessRoleListModule: getProjectAccessRoleListModule,
    inviteUserToOrganizationModule: inviteUserToOrganizationModule,
    acceptInvitationForOrganizationModule: acceptInvitationForOrganizationModule,
    changeAvtiveOrganizationModule: changeAvtiveOrganizationModule,
    getUserOrganizationInvitationInfoModule: getUserOrganizationInvitationInfoModule,
    getDatabaseListModule: getDatabaseListModule,
    getDatatypesListModule: getDatatypesListModule
}
