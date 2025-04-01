console.log("project.db")
const crud = require("../../crud")
const express = require("express")

const addProjectInDatabase = async (userId, changeLogId) => {
    var fieldArr = [
        { field: "project_created_by_user_id", value: userId },
        { field: "added_by_change_log_id", value: changeLogId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("project", fieldArr, ["project_id"], false))

    return response
}

const addProjectDataDB = async (projectId, organizationId, changeLogId, projectName, projectStatusId, projectDatabseTypeId, flag) => {
    var fieldArr = [
        { field: "project_id", value: projectId },
        { field: "organization_id", value: organizationId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "project_name", value: projectName },
        { field: "project_status_id", value: projectStatusId },
        { field: "project_database_type_id", value: projectDatabseTypeId },
        { field: "project_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("project_data", fieldArr, ["project_data_id"], false))

    return response
}

const addUserAccessDataDB = async (projectId, userId, accessTypeId, changeLogId, flag) => {
    var fieldArr = [
        { field: "project_id", value: projectId },
        { field: "user_id", value: userId },
        { field: "project_access_role_id", value: accessTypeId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "project_user_role_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("project_user_role", fieldArr, ["project_user_role_id"], false))

    return response
}

const checkProjectNameInDatabaseDB = async (projectName, organizationId, flag) => {
    var sql = `SELECT project_name
    FROM project_data
    WHERE project_name = '${projectName}'
    AND organization_id = ${organizationId}
    AND project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkUserProjectAccessInDatabaseDB = async (userID, projectId, flag) => {
    var sql = `SELECT project_access_role_id FROM project_user_role WHERE user_id = ${userID} AND project_id = ${projectId} AND project_user_role_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateUserAccessDataFlagDB = async (projectId, userID, currFlag, changeLogId, updateFlag) => {
    var sql = `UPDATE project_user_role
    SET project_user_role_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE project_id = ${projectId}
    AND user_id = ${userID}
    AND project_user_role_flag_deleted = ${currFlag}
    RETURNING project_user_role_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserOrganizationProjectDetailsDB = async (userId, organizationId, flag) => {
    var sql = `SELECT project.project_created_by_user_id, project_data.project_id, project_data.project_name, project_data.project_database_type_id,
    project_database_type.project_database_type_name, project_data.project_status_id, status.status_name, project_user_role.project_access_role_id,
    project_access_role.project_access_role_type, project_user_role.user_id
    FROM project_data
    JOIN project ON project_data.project_id = project.project_id
    JOIN project_user_role ON project_data.project_id = project_user_role.project_id
    JOIN status ON project_data.project_status_id = status.status_id
    JOIN project_database_type ON project_data.project_database_type_id =  project_database_type.project_database_type_id
    JOIN project_access_role ON project_user_role.project_access_role_id = project_access_role.project_access_role_id
    WHERE project_data.organization_id = ${organizationId}
    AND project_data.project_data_flag_deleted = ${flag}
    AND project_user_role.user_id IN (${userId})
    AND project_user_role.project_user_role_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectUserAccessDetailsDB = async (projectId, flag) => {
    var sql = `SELECT project_user_role.user_id, project_user_role.project_access_role_id, project_access_role.project_access_role_type
    FROM project_user_role
    JOIN project_access_role ON project_user_role.project_access_role_id = project_access_role.project_access_role_id
    WHERE project_user_role.project_id = ${projectId}
    AND project_user_role.project_user_role_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectInOrganizationDB = async (projectId, flag) => {
    var sql = `SELECT organization_id, project_status_id, project_database_type_id
    FROM project_data
    WHERE project_id = ${projectId}
    AND project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateProjectDataFlagDB = async (organizationId, projectId, changeLogId, currFlag, updateFlag) => {
    var sql = `UPDATE project_data
    SET project_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE organization_id = ${organizationId}
    AND project_id = ${projectId}
    AND project_data_flag_deleted = ${currFlag}
    RETURNING project_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectCreatedDetailsInDB = async (projectId, userId, flag) => {
    var sql = `SELECT project.project_created_by_user_id, project_data.project_id, project_data.organization_id,
    project_data.project_name, project_data.project_status_id, status.status_name,
    project_user_role.project_access_role_id, project_access_role.project_access_role_type,
    project_data.project_database_type_id, project_database_type.project_database_type_name
    FROM project_data
    JOIN project ON project_data.project_id = project.project_id
    JOIN status ON project_data.project_status_id = status.status_id
    JOIN project_database_type ON project_data.project_database_type_id = project_database_type.project_database_type_id
    LEFT JOIN project_user_role ON project_data.project_id = project_user_role.project_id
    JOIN project_access_role ON project_user_role.project_access_role_id = project_access_role.project_access_role_id
    WHERE project_data.project_id = ${projectId}
    AND project_user_role.user_id = ${userId}
    AND project_data.project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getOrganizationProjectInfo = async (organizationId, flag) => {
    var sql = `SELECT project.project_created_by_user_id, project_data.project_id, project_data.project_name,
    project_data.project_status_id, status.status_name,
    project_data.project_database_type_id, project_database_type.project_database_type_name,
    project_user_role.user_id, project_user_role.project_access_role_id, project_access_role.project_access_role_type
    FROM project_data
    JOIN project ON project_data.project_id = project.project_id
    JOIN status ON project_data.project_status_id = status.status_id
    JOIN project_database_type ON project_data.project_database_type_id = project_database_type.project_database_type_id
    JOIN project_user_role ON project_data.project_id = project_user_role.project_id
    JOIN project_access_role ON project_user_role.project_access_role_id = project_access_role.project_access_role_id
    WHERE project_data.organization_id = ${organizationId}
    AND project_data.project_data_flag_deleted = ${flag}
    AND project_user_role.project_user_role_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkProjectInOrganizationDb = async (organizationId, projectId, flag) => {
    var sql = `SELECT project_data_id FROM project_data WHERE project_id = ${projectId} AND organization_id = ${organizationId} AND project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectDataInfoDb = async (projectId, flag) => {
    var sql = `SELECT project_data.project_name, project_data.project_id, project_data.organization_id, project.project_created_by_user_id,
    project_data.project_status_id, project_data.project_database_type_id
    FROM project_data
    JOIN project ON project_data.project_id = project.project_id
    WHERE project_data.project_id = ${projectId}
    AND project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectIdFromOrgIdDb = async (organizationId, flag) => {
    var sql = `SELECT project_data.project_id, project.project_created_by_user_id, project_data.project_name, project_data.project_status_id, status.status_name,
    project_data.project_database_type_id, project_database_type.project_database_type_name
    FROM project_data
    JOIN project ON project_data.project_id = project.project_id
    JOIN status ON project_data.project_status_id = status.status_id
    JOIN project_database_type ON project_data.project_database_type_id = project_database_type.project_database_type_id
    WHERE project_data.organization_id = ${organizationId}
    AND project_data.project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserIdFromProjectIdDb = async (projectId, flag) => {
    var sql = `SELECT project_user_role.project_id, project_user_role.user_id, project_user_role.project_access_role_id, project_access_role.project_access_role_type
    FROM project_user_role
    JOIN project_access_role ON project_user_role.project_access_role_id = project_access_role.project_access_role_id
    WHERE project_user_role.project_id IN (${projectId})
    AND project_user_role.project_user_role_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

module.exports = {
    checkProjectNameInDatabaseDB: checkProjectNameInDatabaseDB,
    addProjectInDatabase: addProjectInDatabase,
    addProjectDataDB: addProjectDataDB,
    checkUserProjectAccessInDatabaseDB: checkUserProjectAccessInDatabaseDB,
    addUserAccessDataDB: addUserAccessDataDB,
    updateUserAccessDataFlagDB: updateUserAccessDataFlagDB,
    getUserOrganizationProjectDetailsDB: getUserOrganizationProjectDetailsDB,
    getProjectUserAccessDetailsDB: getProjectUserAccessDetailsDB,
    getProjectInOrganizationDB: getProjectInOrganizationDB,
    updateProjectDataFlagDB: updateProjectDataFlagDB,
    getProjectCreatedDetailsInDB: getProjectCreatedDetailsInDB,
    getOrganizationProjectInfo: getOrganizationProjectInfo,
    checkProjectInOrganizationDb: checkProjectInOrganizationDb,
    getProjectDataInfoDb: getProjectDataInfoDb,
    getProjectIdFromOrgIdDb: getProjectIdFromOrgIdDb,
    getUserIdFromProjectIdDb: getUserIdFromProjectIdDb
}
