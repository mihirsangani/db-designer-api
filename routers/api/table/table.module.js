const router = require("express").Router()
const tableDB = require("./table.db")
const TableFunction = require("./table.function")
const projectDB = require("../project/project.db")
const LibFunction = require("../../../helpers/LibFunction")
const constant = require("../../../helpers/constant")
const dotenv = require("dotenv").config()

const addTableModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const projectId = req.body.project_id
    const tableXaxis = req.body.table_x_position
    const tableYaxis = req.body.table_y_position
    const tableName = req.body.table_name

    const flagFalse = false

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    if (!projectId || !tableName) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    if ((!tableXaxis && tableXaxis !== 0) || (!tableYaxis && tableYaxis !== 0)) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkTableNameExist = await tableDB.checkTableNameExist(tableName, projectId, flagFalse)
    if (checkTableNameExist.data.length > 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_TABLE_EXIST
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addTableInDb = await tableDB.addTableInDatabase(userId, changeLogId)
    const tableId = addTableInDb.data[0].table_id

    const addTableDataInDb = await tableDB.addTableDataInDatabase(tableId, tableXaxis, tableYaxis, changeLogId, tableName, projectId, flagFalse)
    if (addTableDataInDb.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const getTableData = await tableDB.getTableDataDb(tableId, flagFalse)
    if (getTableData.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    var result = []
    for (i = 0; i < getTableData.data.length; i++) {
        const data = {
            "project_id": getTableData.data[i].project_id,
            "table_id": getTableData.data[i].table_id,
            "table_name": getTableData.data[i].table_name,
            "table_created_by_user_id": getTableData.data[i].table_created_by_user_id,
            "table_position": {
                "x_axis": getTableData.data[i].table_x_position,
                "y_axis": getTableData.data[i].table_y_position
            }
        }
        result.push(data)
    }

    return {
        "status": true,
        "data": result
    }
}

const addTableGroupModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false

    const projectId = req.body.project_id
    const groupName = req.body.group_name
    const groupColorId = req.body.group_color_id

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    if (!projectId || !groupName || !groupColorId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const colorId = await LibFunction.getAllColorIdArray()
    if (!colorId.includes(groupColorId)) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkGroupNameExist = await tableDB.checkGroupNameExistDb(groupName, projectId, flagFalse)
    if (checkGroupNameExist.data.length > 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_GROUP_EXIST
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addTableGroupInDb = await tableDB.addTableGroupInDatabase(changeLogId, userId)
    const tableGroupId = addTableGroupInDb.data[0].table_group_id

    const addTableGroupDataInDb = await tableDB.addTableGroupDataInDatabase(tableGroupId, projectId, groupName, groupColorId, changeLogId, flagFalse)
    if (addTableGroupDataInDb.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const getTableGroupData = await tableDB.getTableGroupDataDb(tableGroupId, flagFalse)
    if (getTableGroupData.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    var result = []
    for (i = 0; i < getTableGroupData.data.length; i++) {
        var data = {
            "project_id": getTableGroupData.data[i].project_id,
            "table_group_id": getTableGroupData.data[i].table_group_id,
            "table_group_name": getTableGroupData.data[i].table_group_name,
            "table_group_created_by_user_id": getTableGroupData.data[i].table_group_created_by_user_id,
            "table_color": {
                "color_id": getTableGroupData.data[i].table_group_color_id,
                "color_name": getTableGroupData.data[i].color_name,
                "color_code": getTableGroupData.data[i].color_value
            }
        }
        result.push(data)
    }

    return {
        "status": true,
        "data": result
    }
}

const addTableGroupAssignmentModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true

    const projectId = req.body.project_id
    const tableGroupId = req.body.table_group_id
    const tableId = req.body.table_id_arr

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    if (!tableGroupId || tableId.length == 0 || !projectId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    var tableIdArr = tableId.map((obj) => {
        return obj.table_id
    })

    const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableIdArr.join(","), projectId, flagFalse)
    if (checkTableExistInProject.data.length != tableIdArr.length) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
        }
    }

    const checkTableGroupInProject = await tableDB.checkTableGroupInProjectDb(tableGroupId, projectId, flagFalse)
    if (checkTableGroupInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_GROUP_NOT_EXIST
        }
    }

    const checkTableInGroup = await tableDB.getTableGroupIdDb(tableIdArr.join(","), projectId, flagFalse)

    var updateFlagTableIdArr = []
    if (checkTableInGroup.data.length > 0) {
        for (i = 0; i < checkTableInGroup.data.length; i++) {
            if (checkTableInGroup.data[i].table_group_id == tableGroupId) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_TABLE_EXIST_IN_GROUP
                }
            } else {
                const temp = {
                    table_group_assignment_id: checkTableInGroup.data[i].table_group_assignment_id,
                    table_id: checkTableInGroup.data[i].table_id
                }
                updateFlagTableIdArr.push(temp)
            }
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    if (updateFlagTableIdArr.length > 0) {
        var condition = ""
        for (i = 0; i < updateFlagTableIdArr.length; i++) {
            if (i < updateFlagTableIdArr.length - 1) {
                condition += `table_group_assignment_id = ${updateFlagTableIdArr[i].table_group_assignment_id} AND table_id = ${updateFlagTableIdArr[i].table_id} OR`
            } else if (i == updateFlagTableIdArr.length - 1) {
                condition += `table_group_assignment_id = ${updateFlagTableIdArr[i].table_group_assignment_id} AND table_id = ${updateFlagTableIdArr[i].table_id}`
            }
        }
        const updateTableGroupAssignmentFlag = await tableDB.updateTableGroupAssignmentFlagInDb(condition, changeLogId, flagFalse, flagTrue)
        if (updateTableGroupAssignmentFlag.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }
    }

    const addTableGroupAssignmentInDB = await tableDB.addTableGroupAssignmentInDatabase(userId, changeLogId)
    const tableGroupAssignmentId = addTableGroupAssignmentInDB.data[0].table_group_assignment_id

    var values = ""
    for (i = 0; i < tableIdArr.length; i++) {
        if (i < tableIdArr.length - 1) {
            values += `(${tableGroupAssignmentId}, ${tableGroupId}, ${tableIdArr[i]}, ${changeLogId}, ${flagFalse}),`
        } else if (i == tableIdArr.length - 1) {
            values += `(${tableGroupAssignmentId}, ${tableGroupId}, ${tableIdArr[i]}, ${changeLogId}, ${flagFalse})`
        }
    }
    const addTableGroupAssignmentDataInDB = await tableDB.addTableGroupAssignmentDataInDatabase(values)
    if (addTableGroupAssignmentDataInDB.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const getTableGroupAssignmentInfo = await tableDB.getTableGroupAssignmentDataDb(tableGroupAssignmentId, flagFalse)
    if (getTableGroupAssignmentInfo.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    var result = []
    var tableArr = []
    for (i = 0; i < getTableGroupAssignmentInfo.data.length; i++) {
        const data = {
            "table_id": getTableGroupAssignmentInfo.data[i].table_id,
            "table_name": getTableGroupAssignmentInfo.data[i].table_name
        }
        tableArr.push(data)
    }

    const fianlData = {
        "table_group_id": getTableGroupAssignmentInfo.data[0].table_group_id,
        "table_group_name": getTableGroupAssignmentInfo.data[0].table_group_name,
        "table_group_assignment_id": getTableGroupAssignmentInfo.data[0].table_group_assignment_id,
        "table_group_assignment_created_by_user_id": getTableGroupAssignmentInfo.data[0].table_group_assignment_added_by_user_id,
        "tables": tableArr
    }
    result.push(fianlData)

    return {
        "status": true,
        "data": result
    }
}

const addTableFieldModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false

    // Get Body
    const projectId = req.body.project_id
    const tableId = req.body.table_id

    const tableFieldName = req.body.table_field_name
    const tableFieldDataTypeId = req.body.table_field_data_type_id
    var tableFieldDataTypeSize = req.body.table_field_data_type_size

    var tableFieldDefaultValue = req.body.table_field_default_value // Default Value Not In Figma

    const tableFieldAutoIncrementFlag = req.body.table_field_auto_increment_flag
    var tableFieldAutoIncrementValue = req.body.table_field_auto_increment_start_value // Auto Increment Value Not In Figma

    const tableFieldPrimaryKeyFlag = req.body.table_field_primary_key_flag
    const tableFieldPrimaryKeyName = req.body.table_field_primary_key_name

    const tableFieldForeignKeyFlag = req.body.table_field_foreign_key_flag
    const tableFieldForeignKeyName = req.body.table_field_foreign_key_name
    const parentTableFieldId = req.body.parent_table_field_id

    const tableFieldNotNullKeyFlag = req.body.table_field_not_null_key_flag
    const tableFieldNotNullKeyName = req.body.table_field_not_null_key_name

    const tableFieldUniqueKeyFlag = req.body.table_field_unique_key_flag
    const tableFieldUniqueKeyName = req.body.table_field_unique_key_name
    const tableFieldUniqueColorId = req.body.table_field_unique_color_id

    // Get Table Field Key Id From Name
    const getPrimaryKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("PRIMARY KEY")
    const tableFieldPrimaryKeyType = getPrimaryKeyId.data[0].table_field_key_type_id

    const getForeignKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("FOREIGN KEY")
    const tableFieldForeignKeyType = getForeignKeyId.data[0].table_field_key_type_id

    const getNotNullKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("NOT NULL")
    const tableFieldNotNullKeyType = getNotNullKeyId.data[0].table_field_key_type_id

    // Get Project Database Id
    const getDatabaseId = await LibFunction.getProjectDatabaseTypeId(projectId, flagFalse)
    const databaseId = getDatabaseId.data[0].project_database_type_id

    // Assigning Static Values
    const defaultValueName = "DEFAULT VALUE"
    const autoIncrementName = "AUTO INCREMENT"
    const uniqueKeyName = "UNIQUE KEY"

    // Check Edit Access
    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    // Invalid Body Validations
    if (!projectId || !tableId || !tableFieldName || !tableFieldDataTypeId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    // Check Table in Database
    const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableId, projectId, flagFalse)
    if (checkTableExistInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
        }
    }

    // Table Name Validations
    const checkTableFieldNameInTable = await tableDB.getTableFieldIdFromTableName(tableFieldName, tableId, flagFalse)
    if (checkTableFieldNameInTable.data.length > 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_FIELD_EXIST_IN_TABLE
        }
    }

    // Check Datatype Id In Database
    const getTableFieldDatabaseIdArray = await LibFunction.getTableFieldDataTypeIdFromDatabaseTypeId(databaseId)
    if (!getTableFieldDatabaseIdArray.includes(tableFieldDataTypeId)) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    // Data Type Size Validations
    if (!tableFieldDataTypeSize) {
        tableFieldDataTypeSize = null
    }

    // Default Value Validations
    if (!tableFieldDefaultValue) {
        tableFieldDefaultValue = null
    }

    // Auto Increment Validations
    if (tableFieldAutoIncrementFlag) {
        if (!tableFieldAutoIncrementValue) {
            tableFieldAutoIncrementValue = 1
        }
    } else {
        tableFieldAutoIncrementValue = null
    }

    // Primary Key Validations
    if (tableFieldPrimaryKeyFlag) {
        // Check Primary Key Name In Database
        if (!tableFieldPrimaryKeyName) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const checkPrimaryKeyNameInTable = await tableDB.checkKeyNameInTableInDb(tableFieldPrimaryKeyName, projectId, flagFalse)
        if (checkPrimaryKeyNameInTable.data.length > 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }
    }

    // Foreign Key Validations
    if (tableFieldForeignKeyFlag) {
        // Check Foreign Key Name In Database
        if (!tableFieldForeignKeyName) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const checkForeignKeyNameInTable = await tableDB.checkKeyNameInTableInDb(tableFieldForeignKeyName, projectId, flagFalse)
        if (checkForeignKeyNameInTable.data.length > 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        // Check Parent Table Id In Database
        const getParentTableId = await tableDB.getTableFieldTableProjectIdInDb(parentTableFieldId, flagFalse)
        if (!getParentTableId.data[0].table_id || !getParentTableId.data[0].project_id) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE
            }
        }

        if (getParentTableId.data[0].table_id == tableId || getParentTableId.data[0].project_id != projectId) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE
            }
        }
    }

    // Not Null Key Validations
    if (tableFieldNotNullKeyFlag) {
        // Check Not Null Key Name In Database
        if (!tableFieldNotNullKeyName) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const checkNotNullKeyNameInTable = await tableDB.checkKeyNameInTableInDb(tableFieldNotNullKeyName, projectId, flagFalse)
        if (checkNotNullKeyNameInTable.data.length > 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }
    }

    // Unique Key Validations
    if (tableFieldUniqueKeyFlag) {
        // Check Unique Key Color And Name In Database
        if (!tableFieldUniqueColorId || !tableFieldUniqueKeyName) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const getAllColorIdArray = await LibFunction.getAllColorIdArray()
        if (!getAllColorIdArray.includes(tableFieldUniqueColorId)) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const checkColorNameInTable = await tableDB.checkColorNameInTableInDb(tableFieldUniqueColorId, tableFieldUniqueKeyName, tableId, flagFalse)
        if (checkColorNameInTable.data.length > 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }
    }

    // Logical Code
    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const addTableFieldInDB = await tableDB.addTableFieldInDatabase(userId, changeLogId, tableId)
    const tableFieldId = addTableFieldInDB.data[0].table_field_id

    const addTableFieldDataInDB = await tableDB.addTableFieldDataInDatabase(tableFieldId, changeLogId, tableFieldName, tableFieldDataTypeId, tableFieldDataTypeSize, flagFalse)
    if (addTableFieldDataInDB.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const addTableFieldOtherDataInDB = await tableDB.addTableFieldOtherDataInDatabase(tableFieldId, tableFieldDefaultValue, tableFieldAutoIncrementFlag, tableFieldAutoIncrementValue, changeLogId, flagFalse)
    if (addTableFieldOtherDataInDB.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    var tableFieldKey = []
    if (tableFieldPrimaryKeyFlag || tableFieldForeignKeyFlag || tableFieldNotNullKeyFlag) {
        var getParentTableFieldData = null
        var data = null

        const addTableFieldKeyAssignmentInDB = await tableDB.addTableFieldKeyAssignmentInDatabase(changeLogId, tableId)
        const tableFieldKeyAssignmentId = addTableFieldKeyAssignmentInDB.data[0].table_field_key_assignment_id

        if (tableFieldPrimaryKeyFlag) {
            const tableFieldKeyName = tableFieldPrimaryKeyName
            const tableFieldKeyTypeId = tableFieldPrimaryKeyType
            const parentTableFieldNull = null

            const addTableFieldKeyAssignmentDataInDB = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldKeyName, tableFieldId, tableFieldKeyTypeId, parentTableFieldNull, flagFalse)
            if (addTableFieldKeyAssignmentDataInDB.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }
        }

        if (tableFieldForeignKeyFlag) {
            const tableFieldKeyName = tableFieldForeignKeyName
            const tableFieldKeyTypeId = tableFieldForeignKeyType

            const addTableFieldKeyAssignmentDataInDB = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldKeyName, tableFieldId, tableFieldKeyTypeId, parentTableFieldId, flagFalse)
            if (addTableFieldKeyAssignmentDataInDB.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }
            getParentTableFieldData = await tableDB.getParentTableFieldDataDb(tableFieldKeyAssignmentId, flagFalse)
        }

        if (tableFieldNotNullKeyFlag) {
            const tableFieldKeyName = tableFieldNotNullKeyName
            const tableFieldKeyTypeId = tableFieldNotNullKeyType
            const parentTableFieldNull = null

            const addTableFieldKeyAssignmentDataInDB = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldKeyName, tableFieldId, tableFieldKeyTypeId, parentTableFieldNull, flagFalse)
            if (addTableFieldKeyAssignmentDataInDB.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }
        }

        const getTableFieldKeyData = await tableDB.getTableFieldKeyDataDb(tableFieldKeyAssignmentId, flagFalse)
        if (getTableFieldKeyData.data.length > 0) {
            for (i = 0; i < getTableFieldKeyData.data.length; i++) {
                if (getTableFieldKeyData.data[i].table_field_key_type_id == tableFieldPrimaryKeyType || getTableFieldKeyData.data[i].table_field_key_type_id == tableFieldNotNullKeyType) {
                    data = {
                        "id": getTableFieldKeyData.data[i].table_field_key_type_id,
                        "name": getTableFieldKeyData.data[i].table_field_key_type_name,
                        "table_field_key_name": getTableFieldKeyData.data[i].table_field_key_name
                    }
                } else if (getTableFieldKeyData.data[i].table_field_key_type_id == tableFieldForeignKeyType) {
                    data = {
                        "id": getTableFieldKeyData.data[i].table_field_key_type_id,
                        "name": getTableFieldKeyData.data[i].table_field_key_type_name,
                        "table_field_key_name": getTableFieldKeyData.data[i].table_field_key_name,
                        "parent_table_field": {
                            "table_id": getParentTableFieldData.data[0].table_id,
                            "table_name": getParentTableFieldData.data[0].table_name,
                            "table_field_id": getParentTableFieldData.data[0].parent_table_field_id,
                            "table_field_name": getParentTableFieldData.data[0].table_field_name
                        }
                    }
                }
                tableFieldKey.push(data)
            }
        }
    }

    if (tableFieldUniqueKeyFlag) {
        const addUniqueKeyAssignmentInDB = await tableDB.addUniqueKeyAssignmentInDatabase(changeLogId, tableId)
        const tableFieldUniqueKeyAssignmentId = addUniqueKeyAssignmentInDB.data[0].unique_key_assignment_id

        const addUniqueKeyAssignmentDataInDB = await tableDB.addUniqueKeyAssignmentDataInDatabase(changeLogId, tableFieldUniqueKeyAssignmentId, tableFieldUniqueKeyName, tableFieldUniqueColorId, flagFalse)
        if (addUniqueKeyAssignmentDataInDB.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }

        const addUniqueKeyOtherDataInDB = await tableDB.addUniqueKeyAssignmentOtherDataInDatabase(tableFieldUniqueKeyAssignmentId, tableFieldId, changeLogId, flagFalse)
        if (addUniqueKeyOtherDataInDB.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }

        const getTableFieldUniqueKeyData = await tableDB.getTableFieldUniqueKeyDataDb(tableFieldUniqueKeyAssignmentId, flagFalse)

        const data = {
            "name": uniqueKeyName,
            "unique_key_assignment_id": getTableFieldUniqueKeyData.data[0].unique_key_assignment_id,
            "unique_key_name": getTableFieldUniqueKeyData.data[0].unique_key_name,
            "unique_key_color": {
                "id": getTableFieldUniqueKeyData.data[0].color_id,
                "name": getTableFieldUniqueKeyData.data[0].color_name
            },
            "unique_key_table_field_id": getTableFieldUniqueKeyData.data[0].table_field_id,
            "unique_key_table_field_name": getTableFieldUniqueKeyData.data[0].table_field_name
        }
        tableFieldKey.push(data)
    }

    // Get Table Field Data
    const getTableFieldData = await tableDB.getTableFieldDataDb(tableFieldId, flagFalse)
    if (getTableFieldData.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    // Default Value Data
    const tableFieldKeyDefaultValueData = {
        "name": defaultValueName,
        "table_field_default_value": getTableFieldData.data[0].table_field_default_value
    }
    tableFieldKey.push(tableFieldKeyDefaultValueData)

    // Auto Increment Data
    if (getTableFieldData.data[0].table_field_auto_increment) {
        const tableFieldKeyAutoIncrementData = {
            "name": autoIncrementName,
            "value": getTableFieldData.data[0].table_field_auto_increment_start_from
        }
        tableFieldKey.push(tableFieldKeyAutoIncrementData)
    }

    const temp = {
        "table_field_id": getTableFieldData.data[0].table_field_id,
        "table_field_created_by_user_id": getTableFieldData.data[0].table_field_created_by_user_id,
        "table_field_name": getTableFieldData.data[0].table_field_name,
        "table_field_data_type": {
            "id": getTableFieldData.data[0].table_field_data_type_id,
            "name": getTableFieldData.data[0].table_field_data_type_name,
            "size": getTableFieldData.data[0].table_field_data_type_size
        }
    }

    // Get Data From Database
    var result = []
    const getTableFieldKeyDataArr = await TableFunction.getTableFieldKeyFormatedArray(tableFieldKey)
    const tableData = await tableDB.getTableDataDb(tableId, flagFalse)

    const fianlData = {
        "project_id": tableData.data[0].project_id,
        "table_id": tableData.data[0].table_id,
        "table_name": tableData.data[0].table_name,
        "table_field_data": temp,
        "table_field_key_data": getTableFieldKeyDataArr
    }
    result.push(fianlData)

    return {
        "status": true,
        "data": result
    }
}

const getTableFieldDataModule = async (req) => {
    const userId = req.user_data.user_id
    const projectId = req.query.project_id
    const tableId = req.query.table_id

    const flagFalse = false
    const flagTrue = true

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagTrue)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    if (!projectId || !tableId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableId, projectId, flagFalse)
    if (checkTableExistInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
        }
    }

    // Get Table Field Id Array
    const getTableFieldId = await tableDB.getTableFieldIdDb(tableId, flagFalse)
    var tableFieldIdArr = getTableFieldId.data.map((obj) => {
        return obj.table_field_id
    })

    if (tableFieldIdArr.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_NO_TABLE_FIELD
        }
    }

    // Get Table Data
    const getTableData = await tableDB.getTableDataDb(tableId, flagFalse)

    // Get Table Field Key Id From Name
    const getPrimaryKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("PRIMARY KEY")
    const primaryKeyId = getPrimaryKeyId.data[0].table_field_key_type_id

    const getForeignKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("FOREIGN KEY")
    const foreignKeyId = getForeignKeyId.data[0].table_field_key_type_id

    const getNotNullKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("NOT NULL")
    const notnullKeyId = getNotNullKeyId.data[0].table_field_key_type_id

    // Static Empty Key Data
    const primaryKeyEmptyDataMessage = {
        "name": "PRIMARY KEY",
        "status": false,
        "data": null
    }

    const foreignKeyEmptyDataMessage = {
        "name": "FOREIGN KEY",
        "status": false,
        "data": null
    }

    const notnullKeyEmptyDataMessage = {
        "name": "NOT NULL KEY",
        "status": false,
        "data": null
    }

    const uniqueKeyEmptyDataMessage = {
        "name": "UNIQUE KEY",
        "status": false,
        "data": null
    }

    // Get All Key Data Of Table
    const getPrimaryKeyDataForTable = await tableDB.getKeyDataForTableDb(tableId, primaryKeyId, flagFalse)
    const primaryKeyDataArr = getPrimaryKeyDataForTable.data

    const getForeignKeyDataForTable = await tableDB.getKeyDataForTableDb(tableId, foreignKeyId, flagFalse)
    const foreignKeyDataArr = getForeignKeyDataForTable.data

    if (foreignKeyDataArr.length > 0) {
        var parentFieldIdArr = foreignKeyDataArr.map((obj) => {
            return obj.parent_table_field_id
        })

        const getParentTableFieldData = await tableDB.getTableFieldDataDb(parentFieldIdArr.join(","), flagFalse)
        var parentTableFieldData = getParentTableFieldData.data
    }

    const getNotNullKeyDataForTable = await tableDB.getKeyDataForTableDb(tableId, notnullKeyId, flagFalse)
    const notnullKeyDataArr = getNotNullKeyDataForTable.data

    // Get Unique Key Id
    const getUniqueKeyIdForTable = await tableDB.getUniqueKeyIdForTableDb(tableId, flagFalse)

    if (getUniqueKeyIdForTable.data.length > 0) {
        var uniqueKeyIdArr = getUniqueKeyIdForTable.data.map((obj) => {
            return obj.unique_key_assignment_id
        })

        // Get Unique Key Data
        const getUniqueKeyDataForTable = await tableDB.getUniqueKeyDataForTableDb(uniqueKeyIdArr.join(","), flagFalse)
        var uniqueKeyDataArr = getUniqueKeyDataForTable.data.filter((obj) => obj.unique_key_table_field_count == 1)
    }
    // Get Table Field Data
    var tableFieldData = []
    const getTableFieldData = await tableDB.getTableFieldDataDb(tableFieldIdArr.join(","), flagFalse)
    for (i = 0; i < getTableFieldData.data.length; i++) {
        const tableFieldId = getTableFieldData.data[i].table_field_id
        const tableFieldCreatedByUser = getTableFieldData.data[i].table_field_created_by_user_id
        const tableFieldName = getTableFieldData.data[i].table_field_name
        const tableFieldDataTypeId = getTableFieldData.data[i].table_field_data_type_id
        const tableFieldDataTypeName = getTableFieldData.data[i].table_field_data_type_name
        const tableFieldDataTypeSize = getTableFieldData.data[i].table_field_data_type_size
        const tableFieldDefaultValue = getTableFieldData.data[i].table_field_default_value
        const tableFieldAutoIncrementFlag = getTableFieldData.data[i].table_field_auto_increment
        const tableFieldAutoIncrementValue = getTableFieldData.data[i].table_field_auto_increment_start_from

        var primaryKey = []
        for (j = 0; j < primaryKeyDataArr.length; j++) {
            var primarydata

            if (primaryKeyDataArr) {
                if (primaryKeyDataArr[j].table_field_id == tableFieldId) {
                    primarydata = {
                        "name": "PRIMARY KEY",
                        "status": true,
                        "data": {
                            "table_field_key_assignment_id": primaryKeyDataArr[j].table_field_key_assignment_id,
                            "table_field_key_name": primaryKeyDataArr[j].table_field_key_name
                        }
                    }
                    primaryKey.push(primarydata)
                    j = primaryKeyDataArr.length
                }
            }
        }
        if (primaryKey.length == 0) {
            primaryKey.push(primaryKeyEmptyDataMessage)
        }

        var foreignKey = []
        for (j = 0; j < foreignKeyDataArr.length; j++) {
            var foreigndata

            if (foreignKeyDataArr) {
                if (foreignKeyDataArr[j].table_field_id == tableFieldId) {
                    var parentFieldData = parentTableFieldData.filter((obj) => obj.table_field_id === foreignKeyDataArr[j].parent_table_field_id)

                    foreigndata = {
                        "name": "FOREIGN KEY",
                        "status": true,
                        "data": {
                            "table_field_key_assignment_id": foreignKeyDataArr[j].table_field_key_assignment_id,
                            "table_field_key_name": foreignKeyDataArr[j].table_field_key_name,
                            "parent_table_field": {
                                "field_id": parentFieldData[0].table_field_id,
                                "field_name": parentFieldData[0].table_field_name
                            }
                        }
                    }
                    foreignKey.push(foreigndata)
                    j = foreignKeyDataArr.length
                }
            }
        }
        if (foreignKey.length == 0) {
            foreignKey.push(foreignKeyEmptyDataMessage)
        }

        var notnullKey = []
        for (j = 0; j < notnullKeyDataArr.length; j++) {
            var notnulldata

            if (notnullKeyDataArr) {
                if (notnullKeyDataArr[j].table_field_id == tableFieldId) {
                    notnulldata = {
                        "name": "NOT NULL KEY",
                        "status": true,
                        "data": {
                            "table_field_key_assignment_id": notnullKeyDataArr[j].table_field_key_assignment_id,
                            "table_field_key_name": notnullKeyDataArr[j].table_field_key_name
                        }
                    }
                    notnullKey.push(notnulldata)
                    j = notnullKeyDataArr.length
                }
            }
        }
        if (notnullKey.length == 0) {
            notnullKey.push(notnullKeyEmptyDataMessage)
        }

        var uniqueKey = []
        if (uniqueKeyDataArr) {
            for (j = 0; j < uniqueKeyDataArr.length; j++) {
                var uniquedata

                if (uniqueKeyDataArr[j].table_field_id == tableFieldId) {
                    uniquedata = {
                        "name": "Unique Key",
                        "status": true,
                        "data": {
                            "unique_key_assignment_id": uniqueKeyDataArr[j].unique_key_assignment_id,
                            "unique_key_name": uniqueKeyDataArr[j].unique_key_name,
                            "color_id": uniqueKeyDataArr[j].color_id,
                            "color_name": uniqueKeyDataArr[j].color_name
                        }
                    }
                    uniqueKey.push(uniquedata)
                    j = uniqueKeyDataArr.length
                }
            }
        }
        if (uniqueKey.length == 0) {
            uniqueKey.push(uniqueKeyEmptyDataMessage)
        }

        const tableConstraints = {
            "table_field_default_value": [
                {
                    "default_value": tableFieldDefaultValue
                }
            ],
            "table_field_auto_increment": [
                {
                    "flag": tableFieldAutoIncrementFlag,
                    "start_value": tableFieldAutoIncrementValue
                }
            ],
            "primary_key": primaryKey,
            "foreign_key": foreignKey,
            "not_null_key": notnullKey,
            "unique_key": uniqueKey
        }

        const data = {
            "table_field_id": tableFieldId,
            "table_field_created_by_user_id": tableFieldCreatedByUser,
            "table_field_name": tableFieldName,
            "table_field_data_type": {
                "data_type_id": tableFieldDataTypeId,
                "data_type_name": tableFieldDataTypeName,
                "data_type_size": tableFieldDataTypeSize
            },
            "table_constraints": tableConstraints
        }
        tableFieldData.push(data)
    }

    var result = []
    const fianlData = {
        "project_id": getTableData.data[0].project_id,
        "table_id": getTableData.data[0].table_id,
        "table_name": getTableData.data[0].table_name,
        "table_fields": tableFieldData
    }

    result.push(fianlData)

    return {
        "status": true,
        "data": result
    }
}

const updateTableFieldDataModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true
    const parentTableFieldNull = null
    var changesFlag = flagFalse

    const projectId = req.body.project_id
    const tableId = req.body.table_id
    const tableFieldId = req.body.table_field_id

    const tableFieldName = req.body.table_field_name
    const tableFieldDataTypeId = req.body.table_field_data_type_id
    var tableFieldDataTypeSize = req.body.table_field_data_type_size

    var tableFieldDefaultValue = req.body.table_field_default_value

    const tableFieldAutoIncrementFlag = req.body.table_field_auto_increment_flag
    var tableFieldAutoIncrementValue = req.body.table_field_auto_increment_start_value

    const tableFieldPrimaryKeyFlag = req.body.table_field_primary_key_flag
    const tableFieldPrimaryKeyName = req.body.table_field_primary_key_name

    const tableFieldForeignKeyFlag = req.body.table_field_foreign_key_flag
    const tableFieldForeignKeyName = req.body.table_field_foreign_key_name
    const parentTableFieldId = req.body.parent_table_field_id

    const tableFieldNotNullKeyFlag = req.body.table_field_not_null_key_flag
    const tableFieldNotNullKeyName = req.body.table_field_not_null_key_name

    const tableFieldUniqueKeyFlag = req.body.table_field_unique_key_flag
    const tableFieldUniqueKeyName = req.body.table_field_unique_key_name
    const tableFieldUniqueColorId = req.body.table_field_unique_color_id

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    // Invalid Body Validations
    if (!projectId || !tableId || !tableFieldName || !tableFieldDataTypeId || !tableFieldId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    // Check Table In The Project
    const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableId, projectId, flagFalse)
    if (checkTableExistInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
        }
    }

    // Check Table Field In The Table
    const checkTableFieldIdInTable = await tableDB.checkTableFieldExistInTableInDb(tableFieldId, tableId, flagFalse)
    if (checkTableFieldIdInTable.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE
        }
    }

    // Default Value Validations
    if (!tableFieldDefaultValue) {
        tableFieldDefaultValue = null
    }

    // Auto Increment Validations
    if (tableFieldAutoIncrementFlag) {
        if (!tableFieldAutoIncrementValue) {
            tableFieldAutoIncrementValue = 1
        }
    } else {
        tableFieldAutoIncrementValue = null
    }

    // Get Table Field Key Id From Name
    const getPrimaryKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("PRIMARY KEY")
    const primaryKeyId = getPrimaryKeyId.data[0].table_field_key_type_id

    const getForeignKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("FOREIGN KEY")
    const foreignKeyId = getForeignKeyId.data[0].table_field_key_type_id

    const getNotNullKeyId = await LibFunction.getTableFieldKeyTypeIdFromTableFieldKeyTypeName("NOT NULL")
    const notnullKeyId = getNotNullKeyId.data[0].table_field_key_type_id

    // Primary Key Validations
    if (tableFieldPrimaryKeyFlag) {
        const checkPrimaryKeyNameInTable = await tableDB.checkKeyNameInTableInDb(tableFieldPrimaryKeyName, projectId, flagFalse)
        if (!tableFieldPrimaryKeyName || (checkPrimaryKeyNameInTable.data.length > 0 && checkPrimaryKeyNameInTable.data[0].table_field_id != tableFieldId)) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }
    }

    // Foreign Key Validations
    if (tableFieldForeignKeyFlag) {
        const checkForeignKeyNameInTable = await tableDB.checkKeyNameInTableInDb(tableFieldForeignKeyName, projectId, flagFalse)
        if (!tableFieldForeignKeyName || (checkForeignKeyNameInTable.data.length > 0 && checkForeignKeyNameInTable.data[0].table_field_id != tableFieldId)) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const getParentTableId = await tableDB.getTableFieldTableProjectIdInDb(parentTableFieldId, flagFalse)

        if (getParentTableId.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE
            }
        }

        if (getParentTableId.data[0].table_id == tableId || getParentTableId.data[0].project_id != projectId) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE
            }
        }
    }

    // Not Null Key Validations
    if (tableFieldNotNullKeyFlag) {
        const checkNotNullKeyNameInTable = await tableDB.checkKeyNameInTableInDb(tableFieldNotNullKeyName, projectId, flagFalse)
        if (!tableFieldNotNullKeyName || (checkNotNullKeyNameInTable.data.length > 0 && checkNotNullKeyNameInTable.data[0].table_field_id != tableFieldId)) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }
    }

    // Unique Key Validations
    if (tableFieldUniqueKeyFlag) {
        if (!tableFieldUniqueColorId || !tableFieldUniqueKeyName) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const getAllColorIdArray = await LibFunction.getAllColorIdArray()
        if (!getAllColorIdArray.includes(tableFieldUniqueColorId)) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const checkColorNameInTable = await tableDB.checkColorNameInTableInDb(tableFieldUniqueColorId, tableFieldUniqueKeyName, tableId, flagFalse)
        if (checkColorNameInTable.data.length > 0) {
            var arr = checkColorNameInTable.data.map((obj) => obj.table_field_id)
            if (!arr.includes(tableFieldId)) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_INVALID_BODY
                }
            }
        }
    }

    // Get Database Id And Data Types Id
    const getDatabaseId = await LibFunction.getProjectDatabaseTypeId(projectId, flagFalse)
    const databaseId = getDatabaseId.data[0].project_database_type_id

    const getTableFieldDatabaseIdArray = await LibFunction.getTableFieldDataTypeIdFromDatabaseTypeId(databaseId)
    if (!getTableFieldDatabaseIdArray.includes(tableFieldDataTypeId)) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    if (!tableFieldDataTypeSize) {
        tableFieldDataTypeSize = null
    }

    // Logical Code
    // Update Table Field Data
    const getTableFieldData = await tableDB.getTableFieldDataDb(tableFieldId, flagFalse)

    const fieldName = getTableFieldData.data[0].table_field_name
    const fieldDataTypeId = getTableFieldData.data[0].table_field_data_type_id
    const fieldDataTypeSize = getTableFieldData.data[0].table_field_data_type_size

    const fieldDefaultValue = getTableFieldData.data[0].table_field_default_value
    const fieldAutoIncrement = getTableFieldData.data[0].table_field_auto_increment
    const fieldAutoIncrementStartValue = getTableFieldData.data[0].table_field_auto_increment_start_from

    if (fieldName != tableFieldName || fieldDataTypeId != tableFieldDataTypeId || fieldDataTypeSize != tableFieldDataTypeSize) {
        if (changesFlag == flagFalse) {
            const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
            var changeLogId = createChangeLogId.data[0].change_log_id
            changesFlag = flagTrue
        }

        // Table Field Name Validations
        const checkTableFieldNameInTable = await tableDB.getTableFieldIdFromTableName(tableFieldName, tableId, flagFalse)
        if (checkTableFieldNameInTable.data.length > 0 && checkTableFieldNameInTable.data[0].table_field_id != tableFieldId) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_INVALID_BODY
            }
        }

        const updateTableFieldDataFlag = await tableDB.updateTableFieldDataFlagDb(tableFieldId, changeLogId, flagTrue, flagFalse)
        if (updateTableFieldDataFlag.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }

        const addTableFieldDataInDB = await tableDB.addTableFieldDataInDatabase(tableFieldId, changeLogId, tableFieldName, tableFieldDataTypeId, tableFieldDataTypeSize, flagFalse)
        if (addTableFieldDataInDB.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }
    }

    if (fieldDefaultValue != tableFieldDefaultValue || fieldAutoIncrement != tableFieldAutoIncrementFlag || fieldAutoIncrementStartValue != tableFieldAutoIncrementValue) {
        if (changesFlag == flagFalse) {
            const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
            var changeLogId = createChangeLogId.data[0].change_log_id
            changesFlag = flagTrue
        }

        const updateTableFieldOtherDataFlag = await tableDB.updateTableFieldOtherDataFlagDb(tableFieldId, changeLogId, flagTrue, flagFalse)
        if (updateTableFieldOtherDataFlag.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }

        const addTableFieldOtherDataInDB = await tableDB.addTableFieldOtherDataInDatabase(tableFieldId, tableFieldDefaultValue, tableFieldAutoIncrementFlag, tableFieldAutoIncrementValue, changeLogId, flagFalse)
        if (addTableFieldOtherDataInDB.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }
        if (changesFlag == flagFalse) {
            changesFlag = flagTrue
        }
    }

    // Update Table Field Key Data
    const getTableFieldKeyAssignmentId = await tableDB.getTableFieldKeyAssignmentIdDb(tableFieldId, flagFalse)
    if (getTableFieldKeyAssignmentId.data.length > 0) {
        var tableFieldKeyAssignmentId = getTableFieldKeyAssignmentId.data[0].table_field_key_assignment_id
    } else {
        if (tableFieldPrimaryKeyFlag || tableFieldForeignKeyFlag || tableFieldNotNullKeyFlag) {
            const addTableFieldKeyAssignmentInDB = await tableDB.addTableFieldKeyAssignmentInDatabase(changeLogId, tableId)
            var tableFieldKeyAssignmentId = addTableFieldKeyAssignmentInDB.data[0].table_field_key_assignment_id
        }
    }

    var keyExistArr = getTableFieldKeyAssignmentId.data.map((obj) => obj.table_field_key_type_id)

    if (tableFieldPrimaryKeyFlag || tableFieldForeignKeyFlag || tableFieldNotNullKeyFlag) {
        if (keyExistArr.includes(primaryKeyId)) {
            const getPrimaryKeyAssignmentData = await tableDB.getTableFieldKeyAssignmentData(tableFieldKeyAssignmentId, primaryKeyId, flagFalse)
            const currKeyName = getPrimaryKeyAssignmentData.data[0].table_field_key_name

            if (tableFieldPrimaryKeyFlag) {
                if (tableFieldPrimaryKeyName != currKeyName) {
                    if (changesFlag == flagFalse) {
                        const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                        var changeLogId = createChangeLogId.data[0].change_log_id
                        changesFlag = flagTrue
                    }

                    const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, primaryKeyId, changeLogId, flagTrue, flagFalse)
                    if (updateTableFieldKeyDataFlag.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }

                    const addTableFieldKeyData = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldPrimaryKeyName, tableFieldId, primaryKeyId, parentTableFieldNull, flagFalse)
                    if (addTableFieldKeyData.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }
                }
            } else {
                if (changesFlag == flagFalse) {
                    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                    var changeLogId = createChangeLogId.data[0].change_log_id
                    changesFlag = flagTrue
                }

                const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, primaryKeyId, changeLogId, flagTrue, flagFalse)
                if (updateTableFieldKeyDataFlag.data.length == 0) {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            }
        } else {
            if (tableFieldPrimaryKeyFlag) {
                if (changesFlag == flagFalse) {
                    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                    var changeLogId = createChangeLogId.data[0].change_log_id
                    changesFlag = flagTrue
                }

                const addTableFieldKeyData = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldPrimaryKeyName, tableFieldId, primaryKeyId, parentTableFieldNull, flagFalse)
                if (addTableFieldKeyData.data.length == 0) {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            }
        }

        if (keyExistArr.includes(foreignKeyId)) {
            const getForeignKeyAssignmentData = await tableDB.getTableFieldKeyAssignmentData(tableFieldKeyAssignmentId, foreignKeyId, flagFalse)
            const currKeyName = getForeignKeyAssignmentData.data[0].table_field_key_name
            const parentFieldId = getForeignKeyAssignmentData.data[0].parent_table_field_id

            if (tableFieldForeignKeyFlag) {
                if (tableFieldForeignKeyName != currKeyName || parentTableFieldId != parentFieldId) {
                    if (changesFlag == flagFalse) {
                        const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                        var changeLogId = createChangeLogId.data[0].change_log_id
                        changesFlag = flagTrue
                    }

                    const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, foreignKeyId, changeLogId, flagTrue, flagFalse)
                    if (updateTableFieldKeyDataFlag.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }

                    const addTableFieldKeyData = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldForeignKeyName, tableFieldId, foreignKeyId, parentTableFieldId, flagFalse)
                    if (addTableFieldKeyData.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }
                }
            } else {
                if (changesFlag == flagFalse) {
                    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                    var changeLogId = createChangeLogId.data[0].change_log_id
                    changesFlag = flagTrue
                }

                const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, foreignKeyId, changeLogId, flagTrue, flagFalse)
                if (updateTableFieldKeyDataFlag.data.length == 0) {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            }
        } else {
            if (tableFieldForeignKeyFlag) {
                if (changesFlag == flagFalse) {
                    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                    var changeLogId = createChangeLogId.data[0].change_log_id
                    changesFlag = flagTrue
                }

                const addTableFieldKeyData = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldForeignKeyName, tableFieldId, foreignKeyId, parentTableFieldId, flagFalse)
                if (addTableFieldKeyData.data.length == 0) {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            }
        }

        if (keyExistArr.includes(notnullKeyId)) {
            const getNotNullKeyAssignmentData = await tableDB.getTableFieldKeyAssignmentData(tableFieldKeyAssignmentId, notnullKeyId, flagFalse)
            console.log(getNotNullKeyAssignmentData)
            const currKeyName = getNotNullKeyAssignmentData.data[0].table_field_key_name

            if (tableFieldNotNullKeyFlag) {
                if (tableFieldNotNullKeyName != currKeyName) {
                    if (changesFlag == flagFalse) {
                        const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                        var changeLogId = createChangeLogId.data[0].change_log_id
                        changesFlag = flagTrue
                    }

                    const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, notnullKeyId, changeLogId, flagTrue, flagFalse)
                    if (updateTableFieldKeyDataFlag.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }

                    const addTableFieldKeyData = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldNotNullKeyName, tableFieldId, notnullKeyId, parentTableFieldNull, flagFalse)
                    if (addTableFieldKeyData.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }
                }
            } else {
                if (changesFlag == flagFalse) {
                    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                    var changeLogId = createChangeLogId.data[0].change_log_id
                    changesFlag = flagTrue
                }

                const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, notnullKeyId, changeLogId, flagTrue, flagFalse)
                if (updateTableFieldKeyDataFlag.data.length == 0) {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            }
        } else {
            if (tableFieldNotNullKeyFlag) {
                if (changesFlag == flagFalse) {
                    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                    var changeLogId = createChangeLogId.data[0].change_log_id
                    changesFlag = flagTrue
                }

                const addTableFieldKeyData = await tableDB.addTableFieldKeyAssignmentDataInDatabase(changeLogId, tableFieldKeyAssignmentId, tableFieldNotNullKeyName, tableFieldId, notnullKeyId, parentTableFieldNull, flagFalse)
                if (addTableFieldKeyData.data.length == 0) {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            }
        }
    }

    // Update Unique Key Data
    const getUniqueKeyId = await tableDB.getUniqueKeyIdFromTableFieldId(tableFieldId, flagFalse)
    var uniqueKeyIdArr = getUniqueKeyId.data.map((obj) => obj.unique_key_assignment_id)

    if (uniqueKeyIdArr.length > 0) {
        const uniqueKeyDataArr = await tableDB.getUniqueKeyDataForTableDb(uniqueKeyIdArr.join(","), flagFalse)
        const uniqueKeyAssignmentData = uniqueKeyDataArr.data.filter((obj) => obj.unique_key_table_field_count == 1 && obj.table_field_id == tableFieldId)
        const uniqueKeyAssignmentId = uniqueKeyAssignmentData[0].unique_key_assignment_id
        const currUniqueKeyName = uniqueKeyAssignmentData[0].unique_key_name
        const currUniqueKeyColor = uniqueKeyAssignmentData[0].color_id
        const currTableFieldId = uniqueKeyAssignmentData[0].table_field_id

        if (tableFieldUniqueKeyFlag) {
            if (currTableFieldId == tableFieldId) {
                if (currUniqueKeyName != tableFieldUniqueKeyName || currUniqueKeyColor != tableFieldUniqueColorId) {
                    if (changesFlag == flagFalse) {
                        const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                        var changeLogId = createChangeLogId.data[0].change_log_id
                        changesFlag = flagTrue
                    }

                    const updateUniqueKeyAssignmentDataFlag = await tableDB.updateUniqueKeyAssignmentDataFlagDb(uniqueKeyAssignmentId, changeLogId, flagTrue, flagFalse)
                    if (updateUniqueKeyAssignmentDataFlag.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }

                    const addUniqueKeyData = await tableDB.addUniqueKeyAssignmentDataInDatabase(changeLogId, uniqueKeyAssignmentId, tableFieldUniqueKeyName, tableFieldUniqueColorId, flagFalse)
                    if (addUniqueKeyData.data.length == 0) {
                        return {
                            "status": false,
                            "error": constant.requestMessages.ERR_QUERY
                        }
                    }
                }
            }
        } else {
            if (changesFlag == flagFalse) {
                const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                var changeLogId = createChangeLogId.data[0].change_log_id
                changesFlag = flagTrue
            }

            const updateUniqueKeyAssignmentDataFlag = await tableDB.updateUniqueKeyAssignmentDataFlagDb(uniqueKeyAssignmentId, changeLogId, flagTrue, flagFalse)
            if (updateUniqueKeyAssignmentDataFlag.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }

            const updateUniqueKeyAssignmentOtherDataFlag = await tableDB.updateUniqueKeyAssignmentOtherDataFlagDb(uniqueKeyAssignmentId, changeLogId, flagTrue, flagFalse)
            if (updateUniqueKeyAssignmentOtherDataFlag.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }
        }
    } else {
        if (tableFieldUniqueKeyFlag) {
            if (changesFlag == flagFalse) {
                const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
                var changeLogId = createChangeLogId.data[0].change_log_id
                changesFlag = flagTrue
            }

            const addUniqueKeyAssignmentInDB = await tableDB.addUniqueKeyAssignmentInDatabase(changeLogId, tableId)
            const uniqueKeyAssignmentId = addUniqueKeyAssignmentInDB.data[0].unique_key_assignment_data_id

            const addUniqueKeyData = await tableDB.addUniqueKeyAssignmentDataInDatabase(changeLogId, uniqueKeyAssignmentId, tableFieldUniqueKeyName, tableFieldUniqueColorId, flagFalse)
            if (addUniqueKeyData.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }

            const adduniqueKeyOtherData = await tableDB.addUniqueKeyAssignmentOtherDataInDatabase(uniqueKeyAssignmentId, tableFieldId, changeLogId, flagFalse)
            if (adduniqueKeyOtherData.data.length == 0) {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }
        }
    }

    if (changesFlag) {
        return {
            "status": true
        }
    } else {
        return {
            "status": false,
            "message": constant.requestMessages.ERR_NO_CHANGE
        }
    }
}

const updateTableNameModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true

    const projectId = req.body.project_id
    const tableId = req.body.table_id
    const tableName = req.body.table_name

    if (!projectId || !tableId || !tableName) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableId, projectId, flagFalse)
    if (checkTableExistInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
        }
    }

    const checkTableNameExist = await tableDB.checkTableNameExist(tableName, projectId, flagFalse)
    if (checkTableNameExist.data.length > 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_TABLE_EXIST
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const updateTableDataName = await tableDB.updateTableDataFlagDb(tableId, changeLogId, flagFalse, flagTrue)
    if (updateTableDataName.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const tableXaxis = updateTableDataName.data[0].table_x_position
    const tableYaxis = updateTableDataName.data[0].table_y_position

    const addTableDataInDb = await tableDB.addTableDataInDatabase(tableId, tableXaxis, tableYaxis, changeLogId, tableName, projectId, flagFalse)
    if (addTableDataInDb.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const getTableData = await tableDB.getTableDataDb(tableId, flagFalse)
    if (getTableData.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }
    return {
        "status": true
    }
}

const updateTablePositionModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true

    const projectId = req.body.project_id
    const tableId = req.body.table_id
    const tableXaxis = req.body.table_x_position
    const tableYaxis = req.body.table_y_position

    if (!projectId || !tableId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    if (!tableXaxis && tableXaxis !== 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    if (!tableYaxis && tableYaxis !== 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)

    if (checkUserAccessInProject.status) {
        const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableId, projectId, flagFalse)

        if (checkTableExistInProject.data.length > 0) {
            const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
            const changeLogId = createChangeLogId.data[0].change_log_id

            const updateTableDataAxis = await tableDB.updateTableDataFlagDb(tableId, changeLogId, flagFalse, flagTrue)

            if (updateTableDataAxis.data.length > 0) {
                const currProjectId = updateTableDataAxis.data[0].project_id
                const tableName = updateTableDataAxis.data[0].table_name

                const addTableDataInDatabase = await tableDB.addTableDataInDatabase(tableId, tableXaxis, tableYaxis, changeLogId, tableName, currProjectId, flagFalse)
                const getTableData = await tableDB.getTableDataDb(tableId, flagFalse)

                if (getTableData.data.length > 0) {
                    return {
                        "status": true
                    }
                } else {
                    return {
                        "status": false,
                        "error": constant.requestMessages.ERR_QUERY
                    }
                }
            } else {
                return {
                    "status": false,
                    "error": constant.requestMessages.ERR_QUERY
                }
            }
        } else {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
            }
        }
    } else {
        return checkUserAccessInProject
    }
}

const updateTableGroupNameModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true

    const projectId = req.body.project_id
    const tableGroupId = req.body.table_group_id
    const tableGroupName = req.body.table_group_name

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    if (!projectId || !tableGroupId || !tableGroupName) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkTableGroupInProject = await tableDB.checkTableGroupInProjectDb(tableGroupId, projectId, flagFalse)
    if (checkTableGroupInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_GROUP_NOT_EXIST
        }
    }

    const checkGroupNameExist = await tableDB.checkGroupNameExistDb(tableGroupName, projectId, flagFalse)
    if (checkGroupNameExist.data.length > 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_GROUP_EXIST
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const updateTableGroupDataFlag = await tableDB.updateTableGroupDataFlagDb(tableGroupId, changeLogId, flagFalse, flagTrue)
    if (updateTableGroupDataFlag.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const tableGroupColorId = updateTableGroupDataFlag.data[0].table_group_color_id
    const addTableGroupDataInDb = await tableDB.addTableGroupDataInDatabase(tableGroupId, projectId, tableGroupName, tableGroupColorId, changeLogId, flagFalse)
    if (addTableGroupDataInDb.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }
    return {
        "status": true
    }
}

const updateTableGroupColorModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true

    const projectId = req.body.project_id
    const tableGroupId = req.body.table_group_id
    const tableGroupColorId = req.body.table_group_color_id

    if (!projectId || !tableGroupId || !tableGroupColorId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    const colorId = await LibFunction.getAllColorIdArray()
    if (!colorId.includes(tableGroupColorId)) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkTableGroupInProject = await tableDB.checkTableGroupInProjectDb(tableGroupId, projectId, flagFalse)
    if (checkTableGroupInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_GROUP_NOT_EXIST
        }
    }

    const getTableGroupColor = await tableDB.getTableGroupColorInDb(tableGroupId, flagFalse)
    if (getTableGroupColor.data.length > 0 && getTableGroupColor.data[0].table_group_color_id == tableGroupColorId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_GROUP_COLOR
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const updateTableGroupDataFlag = await tableDB.updateTableGroupDataFlagDb(tableGroupId, changeLogId, flagFalse, flagTrue)
    if (updateTableGroupDataFlag.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const tableGroupName = updateTableGroupDataFlag.data[0].table_group_name
    const addTableGroupDataInDb = await tableDB.addTableGroupDataInDatabase(tableGroupId, projectId, tableGroupName, tableGroupColorId, changeLogId, flagFalse)
    if (addTableGroupDataInDb.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }
    return {
        "status": true
    }
}

const removeTableFromGroupModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const flagFalse = false
    const flagTrue = true

    const projectId = req.query.project_id
    const tableId = req.query.table_id
    const tableGroupId = req.query.table_group_id

    if (!projectId || !tableId || !tableGroupId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagFalse)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    const checkTableExistInProject = await tableDB.checkTableExistInProjectInDb(tableId, projectId, flagFalse)
    if (checkTableExistInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_NOT_EXIST
        }
    }

    const checkTableGroupInProject = await tableDB.checkTableGroupInProjectDb(tableGroupId, projectId, flagFalse)
    if (checkTableGroupInProject.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_GROUP_NOT_EXIST
        }
    }

    const checkTableInGroup = await tableDB.getTableGroupIdDb(tableId, projectId, flagFalse)
    if (checkTableInGroup.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_DOES_NOT_EXIST_IN_GROUP
        }
    } else {
        if (checkTableInGroup.data[0].table_group_id != tableGroupId) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_TABLE_DOES_NOT_EXIST_IN_GROUP
            }
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const tableGroupAssignmentId = checkTableInGroup.data[0].table_group_assignment_id
    const condition = `table_group_assignment_id = ${tableGroupAssignmentId} AND table_id = ${tableId}`

    const updateTableGroupAssignmentFlag = await tableDB.updateTableGroupAssignmentFlagInDb(condition, changeLogId, flagFalse, flagTrue)
    if (updateTableGroupAssignmentFlag.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }
    return {
        "status": true
    }
}

const getTableInfoModule = async (req) => {
    const userId = req.user_data.user_id
    const projectId = req.query.project_id

    const flagFalse = false
    const flagTrue = true

    if (!projectId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagTrue)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    var result = []
    var table = []
    const getTableDataInfo = await tableDB.getTableDataInfoDb(projectId, flagFalse)
    if (getTableDataInfo.data.length > 0) {
        for (i = 0; i < getTableDataInfo.data.length; i++) {
            const data = {
                "table_id": getTableDataInfo.data[i].table_id,
                "table_created_by_user_id": getTableDataInfo.data[i].table_created_by_user_id,
                "table_name": getTableDataInfo.data[i].table_name,
                "table_position": {
                    "x_axis": getTableDataInfo.data[i].table_x_position,
                    "y_axis": getTableDataInfo.data[i].table_y_position
                }
            }
            table.push(data)
        }
    }

    const getProjectInfo = await projectDB.getProjectDataInfoDb(projectId, flagFalse)
    if (getProjectInfo.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const fianlData = {
        "organization_id": getProjectInfo.data[0].organization_id,
        "project_id": getProjectInfo.data[0].project_id,
        "project_created_by_user_id": getProjectInfo.data[0].project_created_by_user_id,
        "project_name": getProjectInfo.data[0].project_name,
        "table": table
    }
    result.push(fianlData)

    return {
        "status": true,
        "data": result
    }
}

const getTableGroupInfoModule = async (req) => {
    const userId = req.user_data.user_id
    const projectId = req.query.project_id

    const flagFalse = false
    const flagTrue = true

    if (!projectId) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_INVALID_QUERY_PARAMETER
        }
    }

    const checkUserAccessInProject = await TableFunction.checkUserAccessInProjectTableFunction(userId, projectId, flagFalse, flagTrue)
    if (!checkUserAccessInProject.status) {
        return checkUserAccessInProject
    }

    const getTableGroupDataInfo = await tableDB.getTableGroupDataInfoDb(projectId, flagFalse)

    var result = []
    var tableGroup = []
    if (getTableGroupDataInfo.data.length > 0) {
        var tableGroupIdArr = getTableGroupDataInfo.data.map((obj) => {
            return obj.table_group_id
        })

        const getTableGroupAssignmentDataInfo = await tableDB.getTableGroupAssignmentDataInfoDb(tableGroupIdArr.join(","), flagFalse)
        for (i = 0; i < getTableGroupDataInfo.data.length; i++) {
            var tableInGroup = []

            if (getTableGroupAssignmentDataInfo.data.length > 0) {
                for (j = 0; j < getTableGroupAssignmentDataInfo.data.length; j++) {
                    if (getTableGroupAssignmentDataInfo.data[j].table_group_id == getTableGroupDataInfo.data[i].table_group_id) {
                        const data = {
                            "table_id": getTableGroupAssignmentDataInfo.data[j].table_id,
                            "table_name": getTableGroupAssignmentDataInfo.data[j].table_name
                        }
                        tableInGroup.push(data)
                    }
                }
            }

            const data = {
                "table_group_id": getTableGroupDataInfo.data[i].table_group_id,
                "table_group_created_by_user_id": getTableGroupDataInfo.data[i].table_group_created_by_user_id,
                "table_group_name": getTableGroupDataInfo.data[i].table_group_name,
                "table_group_color": {
                    "color_id": getTableGroupDataInfo.data[i].color_id,
                    "color_name": getTableGroupDataInfo.data[i].color_name
                },
                "table_data": tableInGroup
            }
            tableGroup.push(data)
        }
    }

    const fianlData = {
        "project_id": projectId,
        "table_group": tableGroup
    }
    result.push(fianlData)

    return {
        "status": true,
        "data": result
    }
}

module.exports = {
    addTableModule: addTableModule,
    addTableGroupModule: addTableGroupModule,
    addTableGroupAssignmentModule: addTableGroupAssignmentModule,
    addTableFieldModule: addTableFieldModule,
    getTableFieldDataModule: getTableFieldDataModule,
    updateTableFieldDataModule: updateTableFieldDataModule,
    updateTableNameModule: updateTableNameModule,
    updateTablePositionModule: updateTablePositionModule,
    updateTableGroupNameModule: updateTableGroupNameModule,
    updateTableGroupColorModule: updateTableGroupColorModule,
    removeTableFromGroupModule: removeTableFromGroupModule,
    getTableInfoModule: getTableInfoModule,
    getTableGroupInfoModule: getTableGroupInfoModule
}
