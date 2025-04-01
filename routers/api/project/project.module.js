const router = require("express").Router()
const projectDB = require("../project/project.db")
const userDB = require("../user/user.db")
const organizationDB = require("../organization/organization.db")
const OrganizationFunction = require("../organization/organization.function")
const LibFunction = require("../../../helpers/LibFunction")
const globalDb = require("../global/global.db")
const constant = require("../../../helpers/constant")

const addProjectModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const projectName = req.body.project_name
    const projectStatusId = req.body.project_status_id
    var projectDatabaseTypeId = req.body.project_database_type_id

    const flagFalse = false

    const roleId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Owner")
    const accessTypeId = roleId.data[0].project_access_role_id

    if (!projectName) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    var projectStatusIds = await LibFunction.getAllStatusIdArray()
    if (!projectStatusIds.includes(projectStatusId)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    if (projectDatabaseTypeId) {
        var projectDatabseTypeIds = await LibFunction.getAllProjectDatabaseTypeIdArray()

        if (!projectDatabseTypeIds.includes(projectDatabaseTypeId)) {
            return {
                status: false,
                error: constant.requestMessages.ERR_INVALID_BODY
            }
        }
    } else {
        const getDefaultDatabaseId = await LibFunction.getProjectDatabaseTypeIdFromDatabaseName("Default")
        projectDatabaseTypeId = getDefaultDatabaseId.data[0].project_database_type_id
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

    const checkUserInOrganizationDb = await organizationDB.checkUserInOrganizationDb(userId, organizationId, flagFalse)
    if (checkUserInOrganizationDb.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const getOrganizationCreatedByUserId = await organizationDB.getOrganizationCreatedByUserIdDB(organizationId, flagFalse)
    if (getOrganizationCreatedByUserId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_ORGANIZATION
        }
    }

    const organizationCreatedByUserId = getOrganizationCreatedByUserId.data[0].organization_created_by_user_id

    const checkProjectNameInDatabase = await projectDB.checkProjectNameInDatabaseDB(projectName, organizationId, flagFalse)
    if (checkProjectNameInDatabase.data.length > 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_PROJECT_EXISTS
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addProject = await projectDB.addProjectInDatabase(userId, changeLogId)
    const projectId = addProject.data[0].project_id

    const addProjectData = await projectDB.addProjectDataDB(projectId, organizationId, changeLogId, projectName, projectStatusId, projectDatabaseTypeId, flagFalse)
    if (addProjectData.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const addUserAccessDataForOwner = await projectDB.addUserAccessDataDB(projectId, organizationCreatedByUserId, accessTypeId, changeLogId, flagFalse)
    if (addUserAccessDataForOwner.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    if (userId != organizationCreatedByUserId) {
        const getRoleId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Admin")
        const accessTypeId = getRoleId.data[0].project_access_role_id

        const addUserAccessDataForUser = await projectDB.addUserAccessDataDB(projectId, userId, accessTypeId, changeLogId, flagFalse)
        if (addUserAccessDataForUser.data.length == 0) {
            return {
                status: false,
                error: constant.requestMessages.ERR_QUERY
            }
        }
    }

    const getProjectCreatedDetails = await projectDB.getProjectCreatedDetailsInDB(projectId, userId, flagFalse)
    if (getProjectCreatedDetails.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    var result = []
    const data = {
        "organization_id": getProjectCreatedDetails.data[0].organization_id,
        "project_id": getProjectCreatedDetails.data[0].project_id,
        "project_created_by_user_id": getProjectCreatedDetails.data[0].project_created_by_user_id,
        "project_name": getProjectCreatedDetails.data[0].project_name,
        "project_status": {
            "id": getProjectCreatedDetails.data[0].project_status_id,
            "name": getProjectCreatedDetails.data[0].project_status_name
        },
        "project_access_role": {
            "id": getProjectCreatedDetails.data[0].project_access_role_id,
            "name": getProjectCreatedDetails.data[0].project_access_role_type
        },
        "project_database": {
            "id": getProjectCreatedDetails.data[0].project_database_type_id,
            "name": getProjectCreatedDetails.data[0].project_database_type_name
        }
    }
    result.push(data)

    return {
        status: true,
        data: result
    }
}

const addProjectAccessModule = async (req) => {
    const ipAddress = req.ip
    const currUserId = req.user_data.user_id // Current Logged In User who add user in project_user_access

    const projectId = req.body.project_id
    const userID = req.body.user_id
    const accessTypeId = req.body.project_access_role_id

    const flagFalse = false

    const obj = {
        ipAddress: ipAddress,
        userId: currUserId
    }

    if (!projectId || !userID || !accessTypeId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getProjectAccessTypeId = await LibFunction.getAllProjectAccessRoleIdArray()
    if (!getProjectAccessTypeId.includes(accessTypeId)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkProjectId = await projectDB.getProjectDataInfoDb(projectId, flagFalse)
    if (checkProjectId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_PROJECT_NOT_EXISTS
        }
    }

    const getUserSelectedOrganizationId = await globalDb.getUserSelectedOrganizationIdInDB(currUserId)
    if (getUserSelectedOrganizationId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_SELECTED
        }
    }

    const organizationId = getUserSelectedOrganizationId.data[0].organization_id
    const checkUserAndOrganization = await OrganizationFunction.checkUserAndOrganizationInDb(currUserId, organizationId, flagFalse)
    if (!checkUserAndOrganization.status) {
        return checkUserAndOrganization
    }

    const checkOrganizationInDatabaseForCurrUser = await LibFunction.checkOrganizationInDatabaseDB(currUserId, organizationId, flagFalse)
    if (checkOrganizationInDatabaseForCurrUser.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const checkOrganizationInDatabaseForUserToAdd = await LibFunction.checkOrganizationInDatabaseDB(userID, organizationId, flagFalse)
    if (checkOrganizationInDatabaseForUserToAdd.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const checkCurrUserAccessInProject = await projectDB.checkUserProjectAccessInDatabaseDB(currUserId, projectId, flagFalse)
    if (checkCurrUserAccessInProject.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_HAS_NO_ACCESS_TO_PROJECT
        }
    } else {
        if (!getProjectAccessTypeId.includes(checkCurrUserAccessInProject.data[0].project_access_role_id)) {
            return {
                status: false,
                error: constant.requestMessages.ERR_USER_HAS_NO_ACCESS_TO_PROJECT
            }
        }
    }

    const checkAccessInDatabase = await projectDB.checkUserProjectAccessInDatabaseDB(userID, projectId, flagFalse)
    if (checkAccessInDatabase.data.length > 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_HAS_ACCESS_TO_PROJECT
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addUserAccessData = await projectDB.addUserAccessDataDB(projectId, userID, accessTypeId, changeLogId, flagFalse)

    if (addUserAccessData.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }
    return {
        status: true
    }
}

const updateProjectAccessModule = async (req) => {
    const ipAddress = req.ip
    const currUserId = req.user_data.user_id // Current Logged In User who add user in project_user_access

    const projectId = req.body.project_id
    const userID = req.body.user_id
    const accessTypeId = req.body.project_access_role_id

    const flagTrue = true
    const flagFalse = false

    const obj = {
        ipAddress: ipAddress,
        userId: currUserId
    }

    if (!projectId || !userID || !accessTypeId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getProjectAccessTypeId = await LibFunction.getAllProjectAccessRoleIdArray()
    if (!getProjectAccessTypeId.includes(accessTypeId)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkProjectId = await projectDB.getProjectDataInfoDb(projectId, flagFalse)
    if (checkProjectId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_PROJECT_NOT_EXISTS
        }
    }

    const getUserSelectedOrganizationId = await globalDb.getUserSelectedOrganizationIdInDB(currUserId)
    if (getUserSelectedOrganizationId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_SELECTED
        }
    }

    const organizationId = getUserSelectedOrganizationId.data[0].organization_id
    const checkUserAndOrganization = await OrganizationFunction.checkUserAndOrganizationInDb(currUserId, organizationId, flagFalse)
    if (!checkUserAndOrganization.status) {
        return checkUserAndOrganization
    }

    const checkOrganizationInDatabaseForCurrUser = await LibFunction.checkOrganizationInDatabaseDB(currUserId, organizationId, flagFalse)
    if (checkOrganizationInDatabaseForCurrUser.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const checkOrganizationInDatabaseForUserToAdd = await LibFunction.checkOrganizationInDatabaseDB(userID, organizationId, flagFalse)
    if (checkOrganizationInDatabaseForUserToAdd.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const checkCurrUserAccessInProject = await projectDB.checkUserProjectAccessInDatabaseDB(currUserId, projectId, flagFalse)
    if (checkCurrUserAccessInProject.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_HAS_NO_ACCESS_TO_PROJECT
        }
    }
    const currUserProjectAccessRoleId = checkCurrUserAccessInProject.data[0].project_access_role_id
    const adminProjectRoleId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Admin")
    const ownerProjectRoleId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Owner")

    if (currUserProjectAccessRoleId == adminProjectRoleId.data[0].project_access_role_id || currUserProjectAccessRoleId == ownerProjectRoleId.data[0].project_access_role_id) {
        const checkOrganizationCreator = await LibFunction.checkOrganizationCreatorDB(organizationId, flagFalse)
        const organizationCreatorUserId = checkOrganizationCreator.data[0].organization_created_by_user_id
        if (organizationCreatorUserId == userID) {
            return {
                status: false,
                error: constant.requestMessages.ERR_CHANGING_OWNER_ACCESS
            }
        }

        const checkAccessInDatabase = await projectDB.checkUserProjectAccessInDatabaseDB(userID, projectId, flagFalse)
        if (checkAccessInDatabase.data.length == 0) {
            return {
                status: false,
                error: constant.requestMessages.ERR_USER_NOT_EXISTS
            }
        } else {
            if (checkAccessInDatabase.data[0].project_access_role_id == accessTypeId) {
                return {
                    status: false,
                    error: constant.requestMessages.ERR_USER_HAS_ACCESS_TO_PROJECT
                }
            }
        }

        const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
        const changeLogId = createChangeLogId.data[0].change_log_id

        const updateUserAccessDataFlag = await projectDB.updateUserAccessDataFlagDB(projectId, userID, flagFalse, changeLogId, flagTrue)
        if (updateUserAccessDataFlag.data.length == 0) {
            return {
                status: false,
                error: constant.requestMessages.ERR_QUERY
            }
        }

        const updateUserAccessData = await projectDB.addUserAccessDataDB(projectId, userID, accessTypeId, changeLogId, flagFalse)

        if (updateUserAccessData.data.length == 0) {
            return {
                status: false,
                error: constant.requestMessages.ERR_QUERY
            }
        }
        return {
            status: true
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_HAS_NO_ACCESS_TO_PROJECT
        }
    }
}

const updateProjectNameModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const projectId = req.body.project_id
    const newProjectName = req.body.project_name

    const flagTrue = true
    const flagFalse = false

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    if (!projectId || !newProjectName) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getProjectInfo = await projectDB.getProjectDataInfoDb(projectId, flagFalse)
    if (getProjectInfo.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_PROJECT_NOT_EXISTS
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
    const checkUserAndOrganization = await OrganizationFunction.checkUserAndOrganizationInDb(userId, organizationId, flagFalse)
    if (!checkUserAndOrganization.status) {
        return checkUserAndOrganization
    }

    const checkUserInOrganization = await LibFunction.checkOrganizationInDatabaseDB(userId, organizationId, flagFalse)
    if (checkUserInOrganization.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_ORGANIZATION
        }
    }

    const getOrganizationCreatedByUserId = await LibFunction.checkOrganizationCreatorDB(organizationId, flagFalse)
    if (getOrganizationCreatedByUserId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_NOT_EXISTS
        }
    }

    if (getProjectInfo.data[0].organization_id != organizationId) {
        return {
            status: false,
            error: constant.requestMessages.ERR_PROJECT_NOT_EXISTS
        }
    }

    const currProjectName = getProjectInfo.data[0].project_name
    if (newProjectName.toLowerCase() == currProjectName.toLowerCase()) {
        return {
            status: false,
            error: constant.requestMessages.ERR_NAME
        }
    }

    const projectStatusId = getProjectInfo.data[0].project_status_id
    const projectDatabseTypeId = getProjectInfo.data[0].project_database_type_id

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const updateProjectDataFlag = await projectDB.updateProjectDataFlagDB(organizationId, projectId, changeLogId, flagFalse, flagTrue)
    if (updateProjectDataFlag.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const addProjectData = await projectDB.addProjectDataDB(projectId, organizationId, changeLogId, newProjectName, projectStatusId, projectDatabseTypeId, flagFalse)
    if (addProjectData.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }
    return {
        status: true
    }
}

const getUserProjectDetailsModule = async (req) => {
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
    const checkUserInOrganization = await LibFunction.checkOrganizationInDatabaseDB(userId, organizationId, flagFalse)
    if (checkUserInOrganization.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_ORGANIZATION
        }
    }

    const organizationName = checkUserInOrganization.data[0].organization_name
    const getProjectDetailsFromOrganizationId = await projectDB.getUserOrganizationProjectDetailsDB(userId, organizationId, flagFalse)
    if (getProjectDetailsFromOrganizationId.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_HAS_NO_ACCESS_TO_PROJECT
        }
    }

    var result = []
    var projectArr = []
    for (i = 0; i < getProjectDetailsFromOrganizationId.data.length; i++) {
        const data = {
            "project_created_by_user_id": getProjectDetailsFromOrganizationId.data[i].project_created_by_user_id,
            "project_id": getProjectDetailsFromOrganizationId.data[i].project_id,
            "project_name": getProjectDetailsFromOrganizationId.data[i].project_name,
            "project_database_type_id": getProjectDetailsFromOrganizationId.data[i].project_database_type_id,
            "project_database_type_name": getProjectDetailsFromOrganizationId.data[i].project_database_type_name,
            "project_status_id": getProjectDetailsFromOrganizationId.data[i].project_status_id,
            "project_status_name": getProjectDetailsFromOrganizationId.data[i].status_name,
            "user_project_access_role_id": getProjectDetailsFromOrganizationId.data[i].project_access_role_id,
            "user_project_access_role_type": getProjectDetailsFromOrganizationId.data[i].project_access_role_type
        }
        projectArr.push(data)
    }

    const finalData = {
        "user_id": userId,
        "organization_id": organizationId,
        "organization_name": organizationName,
        "project": projectArr
    }
    result.push(finalData)

    return {
        status: true,
        data: result
    }
}

const getOrganizationProjectInfoModule = async (req) => {
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

    const checkUserInOrganization = await LibFunction.checkOrganizationInDatabaseDB(userId, organizationId, flagFalse)
    if (checkUserInOrganization.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_ORGANIZATION
        }
    }

    const getOrganizationName = await organizationDB.getOrganizationNameDB(organizationId, flagFalse)
    const organizationName = getOrganizationName.data[0].organization_name

    const getOrganizationCreatedByUserId = await organizationDB.getOrganizationCreatedByUserIdDB(organizationId, flagFalse)
    const organizationCreatedByUserId = getOrganizationCreatedByUserId.data[0].organization_created_by_user_id

    const getProjectIdFromOrg = await projectDB.getProjectIdFromOrgIdDb(organizationId, flagFalse)
    const orgProjectData = getProjectIdFromOrg.data
    const projectIdArr = orgProjectData.map((obj) => {
        return obj.project_id
    })

    var projectInfo = []
    if (orgProjectData.length > 0) {
        const getUserIdFromProject = await projectDB.getUserIdFromProjectIdDb(projectIdArr.join(","), flagFalse)
        const userRoleData = getUserIdFromProject.data

        for (i = 0; i < orgProjectData.length; i++) {
            var userProjectArr = []
            for (j = 0; j < userRoleData.length; j++) {
                if (orgProjectData[i].project_id == userRoleData[j].project_id) {
                    const userData = {
                        "user_id": userRoleData[j].user_id,
                        "project_access_role_id": userRoleData[j].project_access_role_id,
                        "project_access_role_type": userRoleData[j].project_access_role_type
                    }
                    userProjectArr.push(userData)
                }
            }

            const projectData = {
                "project_id": orgProjectData[i].project_id,
                "project_name": orgProjectData[i].project_name,
                "project_created_by_user_id": orgProjectData[i].project_created_by_user_id,
                "project_status_id": orgProjectData[i].project_status_id,
                "project_status_name": orgProjectData[i].project_status_name,
                "project_database_type": {
                    "id": orgProjectData[i].project_database_type_id,
                    "name": orgProjectData[i].project_database_type_name
                },
                "project_access_users": userProjectArr
            }
            projectInfo.push(projectData)
        }
    }

    var result = []
    const finalData = {
        "user_id": userId,
        "organization_id": organizationId,
        "organization_name": organizationName,
        "organization_created_by_user_id": organizationCreatedByUserId,
        "project": projectInfo
    }
    result.push(finalData)

    return {
        status: true,
        data: result
    }
}

module.exports = {
    addProjectModule: addProjectModule,
    addProjectAccessModule: addProjectAccessModule,
    updateProjectAccessModule: updateProjectAccessModule,
    updateProjectNameModule: updateProjectNameModule,
    getUserProjectDetailsModule: getUserProjectDetailsModule,
    getOrganizationProjectInfoModule: getOrganizationProjectInfoModule
}
