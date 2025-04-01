const OrganizationFunction = require("../organization/organization.function")
const projectDB = require("../project/project.db")
const globalDB = require("../global/global.db")
const LibFunction = require("../../../helpers/LibFunction")
const constant = require("../../../helpers/constant")
const dotenv = require("dotenv").config()

const checkUserAccessInProjectTableFunction = async (userId, projectId, flag, viewDataFlag) => {
    if (!projectId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getUserSelectedOrganizationId = await globalDB.getUserSelectedOrganizationIdInDB(userId)
    if (getUserSelectedOrganizationId.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_ORGANIZATION_SELECTED
        }
    }

    const organizationId = getUserSelectedOrganizationId.data[0].organization_id
    const checkUserAndOrganization = await OrganizationFunction.checkUserAndOrganizationInDb(userId, organizationId, flag)
    if (!checkUserAndOrganization.status) {
        return checkUserAndOrganization
    }

    const checkUserInOrganizationDb = await LibFunction.checkOrganizationInDatabaseDB(userId, organizationId, flag)
    if (checkUserInOrganizationDb.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_NOT_EXISTS_IN_ORGANIZATION
        }
    }

    const checkProjectInOrganization = await projectDB.checkProjectInOrganizationDb(organizationId, projectId, flag)
    if (checkProjectInOrganization.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_PROJECT_NOT_EXISTS
        }
    }

    const getUserProjectAccessRole = await projectDB.checkUserProjectAccessInDatabaseDB(userId, projectId, flag)
    if (getUserProjectAccessRole.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_USER_HAS_NO_ACCESS_TO_PROJECT
        }
    }

    if (viewDataFlag) {
        return {
            "status": true,
            "data": {
                "organization_id": organizationId,
                "project_access_role": getUserProjectAccessRole.data[0].project_access_role_id
            }
        }
    } else {
        const geteditAccessId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Edit")
        const editAccessId = geteditAccessId.data[0].project_access_role_id

        const getadminAccessId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Admin")
        const adminAccessId = getadminAccessId.data[0].project_access_role_id

        const getownerAccessId = await LibFunction.getProjectAccessRoleIdFromProjectAccessRoleName("Owner")
        const ownerAccessId = getownerAccessId.data[0].project_access_role_id

        if (getUserProjectAccessRole.data[0].project_access_role_id == editAccessId || getUserProjectAccessRole.data[0].project_access_role_id == adminAccessId || getUserProjectAccessRole.data[0].project_access_role_id == ownerAccessId) {
            return {
                "status": true,
                "data": {
                    "organization_id": organizationId,
                    "project_access_role": getUserProjectAccessRole.data[0].project_access_role_id
                }
            }
        } else {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_NOT_HAVE_EDIT_ACCESS
            }
        }
    }
}

const getTableFieldKeyFormatedArray = async (tableFieldKeyData) => {
    var primaryKeyData = {
        "name": "PRIMARY KEY",
        "status": false,
        "data": null
    }
    var foreignKeyData = {
        "name": "FOREIGN KEY",
        "status": false,
        "data": null
    }
    var notNullKeyData = {
        "name": "NOT NULL KEY",
        "status": false,
        "data": null
    }
    var uniqueKeyData = {
        "name": "UNIQUE KEY",
        "status": false,
        "data": null
    }
    var defaultValueData = {
        "name": "DEFAULT VALUE",
        "status": false,
        "data": null
    }
    var autoIncrementData = {
        "name": "AUTO INCREMENT",
        "status": false,
        "data": null
    }

    const arr = tableFieldKeyData.map((obj) => {
        if (obj.name == "PRIMARY KEY") {
            primaryKeyData = {
                "name": obj.name,
                "status": true,
                "data": {
                    "key_type_id": obj.id,
                    "table_field_key_name": obj.table_field_key_name
                }
            }
        } else if (obj.name == "FOREIGN KEY") {
            foreignKeyData = {
                "name": obj.name,
                "status": true,
                "data": {
                    "key_type_id": obj.id,
                    "table_field_key_name": obj.table_field_key_name,
                    "parent_table_field": obj.parent_table_field
                }
            }
        } else if (obj.name == "NOT NULL") {
            notNullKeyData = {
                "name": obj.name,
                "status": true,
                "data": {
                    "key_type_id": obj.id,
                    "table_field_key_name": obj.table_field_key_name
                }
            }
        } else if (obj.name == "UNIQUE KEY") {
            uniqueKeyData = {
                "name": obj.name,
                "status": true,
                "data": {
                    "unique_key_assignment_id": obj.unique_key_assignment_id,
                    "unique_key_name": obj.unique_key_name,
                    "unique_key_color": obj.unique_key_color,
                    "unique_key_table_field_id": obj.unique_key_table_field_id,
                    "unique_key_table_field_name": obj.unique_key_table_field_name
                }
            }
        } else if (obj.name == "DEFAULT VALUE") {
            if (obj.table_field_default_value) {
                defaultValueData = {
                    "name": obj.name,
                    "status": true,
                    "data": {
                        "table_field_default_value": obj.table_field_default_value
                    }
                }
            }
        } else if (obj.name == "AUTO INCREMENT") {
            autoIncrementData = {
                "name": obj.name,
                "status": true,
                "data": {
                    "auto_increment_status": obj.auto_increment_status,
                    "value": obj.value
                }
            }
        }
        return obj
    })

    const tableFieldKeyDataArr = [primaryKeyData, foreignKeyData, notNullKeyData, uniqueKeyData, defaultValueData, autoIncrementData]
    return tableFieldKeyDataArr
}

module.exports = {
    checkUserAccessInProjectTableFunction: checkUserAccessInProjectTableFunction,
    getTableFieldKeyFormatedArray: getTableFieldKeyFormatedArray
}
