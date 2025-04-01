console.log("global.db")
const crud = require("../../crud")
const express = require("express")

const getStatusListDB = async () => {
    var sql = `SELECT status_id, status_name, status_description FROM status`
    var response = await crud.executeQuery(sql)

    return response
}

const getColorDB = async () => {
    var sql = `SELECT * FROM color_list`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserSelectedOrganizationIdInDB = async (userId) => {
    var sql = `SELECT organization_id
    FROM user_selected_organization
    WHERE user_id = ${userId}
    ORDER BY timestamp DESC`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectAccessRoleListDB = async () => {
    var sql = `SELECT project_access_role_id, project_access_role_type FROM project_access_role`
    var response = await crud.executeQuery(sql)

    return response
}

const getDatabaseListDB = async () => {
    var sql = `SELECT * FROM project_database_type`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectDataTypesListDB = async (databaseId) => {
    var sql = `SELECT table_field_data_type_id, table_field_data_type_name, table_field_datatype_flag_length_accept
    FROM table_field_data_type
    WHERE project_database_type_id = ${databaseId}`
    var response = await crud.executeQuery(sql)

    return response
}

module.exports = {
    getStatusListDB: getStatusListDB,
    getColorDB: getColorDB,
    getUserSelectedOrganizationIdInDB: getUserSelectedOrganizationIdInDB,
    getProjectAccessRoleListDB: getProjectAccessRoleListDB,
    getDatabaseListDB: getDatabaseListDB,
    getProjectDataTypesListDB: getProjectDataTypesListDB
}
