// console.log("table.db")
const crud = require("../../crud")
const express = require("express")

const addTableInDatabase = async (userId, changeLogId) => {
    var fieldArr = [
        { field: "table_created_by_user_id", value: userId },
        { field: "added_by_change_log_id", value: changeLogId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("public.table", fieldArr, ["table_id"], false))

    return response
}

const addTableDataInDatabase = async (tableId, tableXaxis, tableYaxis, changeLogId, tableName, projectId, flag) => {
    var fieldArr = [
        { field: "table_id", value: tableId },
        { field: "table_x_position", value: tableXaxis },
        { field: "table_y_position", value: tableYaxis },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_name", value: tableName },
        { field: "project_id", value: projectId },
        { field: "table_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_data", fieldArr, ["table_data_id"], false))

    return response
}

const addTableGroupInDatabase = async (changeLogId, userId) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_group_created_by_user_id", value: userId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_group", fieldArr, ["table_group_id"], false))

    return response
}

const addTableGroupDataInDatabase = async (tableGroupId, projectId, groupName, groupColorId, changeLogId, flag) => {
    var fieldArr = [
        { field: "table_group_id", value: tableGroupId },
        { field: "project_id", value: projectId },
        { field: "table_group_name", value: groupName },
        { field: "table_group_color_id", value: groupColorId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_group_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_group_data", fieldArr, ["table_group_id"], false))

    return response
}

const addTableGroupAssignmentInDatabase = async (userId, changeLogId) => {
    var fieldArr = [
        { field: "table_group_assignment_added_by_user_id", value: userId },
        { field: "added_by_change_log_id", value: changeLogId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_group_assignment", fieldArr, ["table_group_assignment_id"], false))

    return response
}

const addTableGroupAssignmentDataInDatabase = async (values) => {
    var sql = `INSERT INTO table_group_assignment_data (table_group_assignment_id, table_group_id, table_id, added_by_change_log_id, table_group_assignment_data_flag_deleted)
    VALUES ${values} RETURNING table_group_assignment_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const addTableFieldInDatabase = async (userId, changeLogId, tableId) => {
    var fieldArr = [
        { field: "table_field_created_by_user_id", value: userId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_id", value: tableId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_field", fieldArr, ["table_field_id"], false))

    return response
}

const addTableFieldDataInDatabase = async (tableFieldId, changeLogId, tableFieldName, tableFieldDataTypeId, tableFieldDataTypeSize, flag) => {
    var fieldArr = [
        { field: "table_field_id", value: tableFieldId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_field_name", value: tableFieldName },
        { field: "table_field_data_type_id", value: tableFieldDataTypeId },
        { field: "table_field_data_type_size", value: tableFieldDataTypeSize },
        { field: "table_field_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_field_data", fieldArr, ["table_field_data_id"], false))

    return response
}

const addTableFieldOtherDataInDatabase = async (tableFieldId, tableFieldDefaultValue, tableFieldAutoIncrementFlag, tableFieldAutoIncrementValue, changeLogId, flag) => {
    var fieldArr = [
        { field: "table_field_id", value: tableFieldId },
        { field: "table_field_default_value", value: tableFieldDefaultValue },
        { field: "table_field_auto_increment", value: tableFieldAutoIncrementFlag },
        { field: "table_field_auto_increment_start_from", value: tableFieldAutoIncrementValue },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_field_other_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_field_other_data", fieldArr, ["table_field_other_data_id"], false))

    return response
}

const addTableFieldKeyAssignmentInDatabase = async (changeLogId, tableId) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_id", value: tableId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_field_key_assignment", fieldArr, ["table_field_key_assignment_id"], false))

    return response
}

const addTableFieldKeyAssignmentDataInDatabase = async (changeLogId, tableFieldKeyAssignmentId, tableFieldKeyName, tableFieldId, tableFieldKeyTypeId, parentTableFieldId, flag) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_field_key_assignment_id", value: tableFieldKeyAssignmentId },
        { field: "table_field_key_name", value: tableFieldKeyName },
        { field: "table_field_id", value: tableFieldId },
        { field: "table_field_key_type_id", value: tableFieldKeyTypeId },
        { field: "parent_table_field_id", value: parentTableFieldId },
        { field: "table_field_key_assignment_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("table_field_key_assignment_data", fieldArr, ["table_field_key_assignment_data_id"], false))

    return response
}

const addUniqueKeyAssignmentInDatabase = async (changeLogId, tableId) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "table_id", value: tableId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("unique_key_assignment", fieldArr, ["unique_key_assignment_id"], false))

    return response
}

const addUniqueKeyAssignmentDataInDatabase = async (changeLogId, uniqueKeyAssignmentId, uniqueKeyName, colorId, flag) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "unique_key_assignment_id", value: uniqueKeyAssignmentId },
        { field: "unique_key_name", value: uniqueKeyName },
        { field: "color_id", value: colorId },
        { field: "unique_key_assignment_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("unique_key_assignment_data", fieldArr, ["unique_key_assignment_data_id"], false))

    return response
}

const addUniqueKeyAssignmentOtherDataInDatabase = async (uniqueKeyAssignmentId, tableFieldId, changeLogId, flag) => {
    var fieldArr = [
        { field: "unique_key_assignment_id", value: uniqueKeyAssignmentId },
        { field: "table_field_id", value: tableFieldId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "unique_key_assignment_other_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("unique_key_assignment_other_data", fieldArr, ["unique_key_assignment_other_data_id"], false))

    return response
}

const checkTableExistInProjectInDb = async (tableId, projectId, flag) => {
    var sql = `SELECT table_data_id FROM table_data WHERE table_id IN (${tableId}) AND project_id = ${projectId} AND table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkTableNameExist = async (tableName, projectId, flag) => {
    var sql = `SELECT table_data_id FROM table_data WHERE table_name = '${tableName}' AND project_id = ${projectId} AND table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableDataDb = async (tableId, flag) => {
    var sql = `SELECT table_data.project_id, table_data.table_id, "table".table_created_by_user_id, table_data.table_name,
    table_data.table_x_position, table_data.table_y_position
    FROM table_data
    JOIN "table" ON table_data.table_id = "table".table_id
    WHERE table_data.table_id = ${tableId}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkGroupNameExistDb = async (groupName, projectId, flag) => {
    var sql = `SELECT table_group_data_id FROM table_group_data WHERE project_id = ${projectId} AND table_group_name = '${groupName}' AND table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableGroupDataDb = async (tableGroupId, flag) => {
    var sql = `SELECT table_group_data.table_group_id, table_group_data.project_id, table_group_data.table_group_name,
    table_group_data.table_group_color_id, color_list.color_name, color_list.color_value,
    table_group.table_group_created_by_user_id
    FROM table_group_data
    JOIN color_list ON table_group_data.table_group_color_id = color_list.color_id
    JOIN table_group ON table_group_data.table_group_id = table_group.table_group_id
    WHERE table_group_data.table_group_id = ${tableGroupId}
    AND table_group_data.table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkTableGroupInProjectDb = async (tableGroupId, projectId, flag) => {
    var sql = `SELECT table_group_data_id, table_group_name
    FROM table_group_data
    WHERE table_group_id = ${tableGroupId}
    AND project_id = ${projectId}
    AND table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableGroupIdDb = async (tableId, projectId, flag) => {
    var sql = `SELECT table_group_assignment_data.table_id, table_group_assignment_data.table_group_id, table_group_assignment_data.table_group_assignment_id
    FROM table_group_assignment_data
    JOIN table_group_data ON table_group_assignment_data.table_group_id = table_group_data.table_group_id
    WHERE table_group_assignment_data.table_id IN (${tableId})
    AND table_group_data.project_id = ${projectId}
    AND table_group_assignment_data.table_group_assignment_data_flag_deleted = ${flag}
    AND table_group_data.table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateTableGroupAssignmentFlagInDb = async (condition, changeLogId, currFlag, updateFlag) => {
    var sql = `UPDATE table_group_assignment_data
    SET table_group_assignment_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE (${condition})
    AND table_group_assignment_data_flag_deleted = ${currFlag}
    RETURNING table_group_assignment_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableGroupAssignmentDataDb = async (tableGroupAssignmentId, flag) => {
    var sql = `SELECT table_group_assignment_data.table_group_assignment_id, table_group_assignment.table_group_assignment_added_by_user_id,
    table_group_assignment_data.table_group_id, table_group_data.table_group_name, table_group_assignment_data.table_id, table_data.table_name
    FROM table_group_assignment_data
    JOIN table_group_assignment ON table_group_assignment_data.table_group_assignment_id = table_group_assignment.table_group_assignment_id
    JOIN table_group_data ON table_group_assignment_data.table_group_id = table_group_data.table_group_id
    JOIN table_data ON table_group_assignment_data.table_id = table_data.table_id
    WHERE table_group_assignment_data.table_group_assignment_id = ${tableGroupAssignmentId}
    AND table_group_assignment_data.table_group_assignment_data_flag_deleted = ${flag}
    AND table_group_data.table_group_flag_deleted = ${flag}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateTableDataFlagDb = async (tableId, changeLogId, currFlag, updateFlag) => {
    var sql = `UPDATE table_data
    SET table_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE table_id = ${tableId}
    AND table_data_flag_deleted = ${currFlag}
    RETURNING table_name, project_id, table_x_position, table_y_position`
    var response = await crud.executeQuery(sql)

    return response
}

const updateTableGroupDataFlagDb = async (tableGroupId, changeLogId, currFlag, updateFlag) => {
    var sql = `UPDATE table_group_data
    SET table_group_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE table_group_id = ${tableGroupId}
    AND table_group_flag_deleted = ${currFlag}
    RETURNING table_group_name, table_group_color_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableGroupColorInDb = async (tableGroupId, flag) => {
    var sql = `SELECT table_group_data.table_group_color_id, color_list.color_name, color_list.color_value
    FROM table_group_data
    JOIN color_list ON table_group_data.table_group_color_id = color_list.color_id
    WHERE table_group_data.table_group_id = ${tableGroupId}
    AND table_group_data.table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableDataInfoDb = async (projectId, flag) => {
    var sql = `SELECT table_data.table_id, table_data.project_id, table_data.table_name, table_data.table_x_position, table_data.table_y_position, "table".table_created_by_user_id
    FROM table_data
    JOIN "table" ON table_data.table_id = "table".table_id
    WHERE project_id = ${projectId}
    AND table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableGroupDataInfoDb = async (projectId, flag) => {
    var sql = `SELECT table_group_data.table_group_id, table_group.table_group_created_by_user_id, table_group_data.table_group_name, table_group_data.table_group_color_id, color_list.color_name
    FROM table_group_data
    JOIN table_group ON table_group_data.table_group_id = table_group.table_group_id
    JOIN color_list ON table_group_data.table_group_color_id = color_list.color_id
    WHERE table_group_data.project_id = ${projectId}
    AND table_group_data.table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableGroupAssignmentDataInfoDb = async (tableGroupId, flag) => {
    var sql = `SELECT table_group_assignment_data.table_id, table_group_assignment_data.table_group_id, table_data.table_name
    FROM table_group_assignment_data
    JOIN table_data ON table_group_assignment_data.table_id = table_data.table_id
    WHERE table_group_assignment_data.table_group_id IN (${tableGroupId})
    AND table_group_assignment_data.table_group_assignment_data_flag_deleted = ${flag}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkColorNameInTableInDb = async (colorId, uniqeKeyName, tableId, flag) => {
    var sql = `SELECT unique_key_assignment.unique_key_assignment_id, unique_key_assignment_other_data.table_field_id
    FROM unique_key_assignment
    JOIN unique_key_assignment_data ON unique_key_assignment.unique_key_assignment_id = unique_key_assignment_data.unique_key_assignment_id
    JOIN unique_key_assignment_other_data ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment_other_data.unique_key_assignment_id
    WHERE unique_key_assignment.table_id = ${tableId}
    AND (unique_key_assignment_data.color_id = ${colorId} OR unique_key_assignment_data.unique_key_name = '${uniqeKeyName}')
    AND unique_key_assignment_data_flag_deleted = ${flag}
    AND unique_key_assignment_other_data.unique_key_assignment_other_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkKeyNameInTableInDb = async (tableFieldKeyName, projectId, flag) => {
    var sql = `SELECT table_field_key_assignment.table_field_key_assignment_id, table_field_key_assignment_data.table_field_id
    FROM table_field_key_assignment_data
    JOIN table_field_key_assignment ON table_field_key_assignment_data.table_field_key_assignment_id = table_field_key_assignment.table_field_key_assignment_id
    JOIN table_data ON table_field_key_assignment.table_id = table_data.table_id
    WHERE table_data.project_id = ${projectId}
    AND table_data.table_data_flag_deleted = ${flag}
    AND table_field_key_assignment_data.table_field_key_name = '${tableFieldKeyName}'
    AND table_field_key_assignment_data.table_field_key_assignment_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldDataDb = async (tableFieldId, flag) => {
    var sql = `SELECT table_field.table_field_id, table_field.table_field_created_by_user_id, table_field.table_id, table_data.table_name,
    table_field_data.table_field_name, table_field_data.table_field_data_type_id, table_field_data_type.table_field_data_type_name, table_field_data.table_field_data_type_size,
    table_field_other_data.table_field_default_value, table_field_other_data.table_field_auto_increment, table_field_auto_increment_start_from
    FROM table_field_data
    JOIN table_field_data_type ON table_field_data.table_field_data_type_id = table_field_data_type.table_field_data_type_id
    JOIN table_field ON table_field_data.table_field_id = table_field.table_field_id
    JOIN table_field_other_data ON table_field_data.table_field_id = table_field_other_data.table_field_id
    JOIN table_data ON table_field.table_id = table_data.table_id
    WHERE table_field_data.table_field_id IN (${tableFieldId})
    AND table_field_data.table_field_data_flag_deleted = ${flag}
    AND table_field_other_data.table_field_other_data_flag_deleted = ${flag}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldIdFromTableName = async (tableFieldName, tableId, flag) => {
    var sql = `SELECT table_field_data.table_field_id
    FROM table_field_data
    JOIN table_field ON table_field_data.table_field_id = table_field.table_field_id
    WHERE table_field_data.table_field_name = '${tableFieldName}'
    AND table_field.table_id = ${tableId}
    AND table_field_data.table_field_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldTableProjectIdInDb = async (tableFieldId, flag) => {
    var sql = `SELECT table_data.project_id, "table".table_id
    FROM table_field_data
    JOIN table_field ON table_field_data.table_field_id = table_field.table_field_id
    JOIN "table" ON table_field.table_id = "table".table_id
    JOIN table_data ON "table".table_id = table_data.table_id
    WHERE table_field_data.table_field_id = ${tableFieldId}
    AND table_field_data.table_field_data_flag_deleted = ${flag}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldKeyDataDb = async (tableFieldKeyAssignmentId, flag) => {
    var sql = `SELECT table_field_key_assignment.table_field_key_assignment_id, table_field_key_assignment_data.table_field_key_name,
    table_field_key_assignment_data.table_field_id, table_field_key_assignment_data.parent_table_field_id, table_field_key_assignment_data.table_field_key_type_id, table_field_key_type.table_field_key_type_name
    FROM table_field_key_assignment_data
    JOIN table_field_key_type ON table_field_key_assignment_data.table_field_key_type_id = table_field_key_type.table_field_key_type_id
    JOIN table_field_key_assignment ON table_field_key_assignment_data.table_field_key_assignment_id = table_field_key_assignment.table_field_key_assignment_id
    WHERE table_field_key_assignment_data.table_field_key_assignment_id IN (${tableFieldKeyAssignmentId})
    AND table_field_key_assignment_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getParentTableFieldDataDb = async (tableFieldKeyAssignmentId, flag) => {
    var sql = `SELECT table_field_key_assignment_data.parent_table_field_id, table_field_data.table_field_name, table_data.table_name, table_data.table_id
    FROM table_field_key_assignment_data
    JOIN table_field_key_assignment ON table_field_key_assignment_data.table_field_key_assignment_id = table_field_key_assignment.table_field_key_assignment_id
    JOIN table_field_data ON table_field_key_assignment_data.parent_table_field_id = table_field_data.table_field_id
    JOIN table_field ON table_field_data.table_field_id = table_field.table_field_id
    JOIN table_data ON table_field.table_id = table_data.table_id
    WHERE table_field_key_assignment_data.table_field_key_assignment_id = ${tableFieldKeyAssignmentId}
    AND table_field_key_assignment_data.table_field_key_assignment_data_flag_deleted = ${flag}
    AND table_field_data.table_field_data_flag_deleted = ${flag}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldUniqueKeyDataDb = async (uniqueKeyId, flag) => {
    var sql = `SELECT unique_key_assignment.unique_key_assignment_id, unique_key_assignment.table_id, unique_key_assignment_data.unique_key_name,
    unique_key_assignment_data.color_id, color_list.color_name, unique_key_assignment_other_data.table_field_id, table_field_data.table_field_name
    FROM unique_key_assignment_data
    JOIN color_list ON unique_key_assignment_data.color_id = color_list.color_id
    JOIN unique_key_assignment_other_data ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment_other_data.unique_key_assignment_id
    JOIN table_field_data ON unique_key_assignment_other_data.table_field_id = table_field_data.table_field_id
    JOIN unique_key_assignment ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment.unique_key_assignment_id
    WHERE unique_key_assignment_data.unique_key_assignment_id IN (${uniqueKeyId})
    AND unique_key_assignment_data.unique_key_assignment_data_flag_deleted = ${flag}
    AND table_field_data.table_field_data_flag_deleted = ${flag}
    AND unique_key_assignment_other_data.unique_key_assignment_other_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkTableFieldExistInTableInDb = async (tableFieldId, tableId, flag) => {
    var sql = `SELECT table_field.table_field_created_by_user_id
    FROM table_field
    JOIN table_field_data ON table_field.table_field_id = table_field_data.table_field_id
    WHERE table_field.table_id = ${tableId}
    AND table_field_data.table_field_id = ${tableFieldId}
    AND table_field_data.table_field_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUniqueKeyIdFromTableFieldId = async (tableFieldId, flag) => {
    var sql = `SELECT unique_key_assignment_data.unique_key_assignment_id
    FROM unique_key_assignment_data
    JOIN unique_key_assignment_other_data ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment_other_data.unique_key_assignment_id
    WHERE unique_key_assignment_other_data.table_field_id IN (${tableFieldId})
    AND unique_key_assignment_other_data.unique_key_assignment_other_data_flag_deleted = ${flag}
    AND unique_key_assignment_data.unique_key_assignment_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldIdDb = async (tableId, flag) => {
    var sql = `SELECT table_field_data.table_field_id
    FROM table_field
    JOIN table_field_data ON table_field.table_field_id = table_field_data.table_field_id
    WHERE table_field.table_id = ${tableId}
    AND table_field_data.table_field_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldKeyAssignmentIdDb = async (tableFieldId, flag) => {
    var sql = `SELECT table_field_key_assignment_id, table_field_key_type_id
    FROM table_field_key_assignment_data
    WHERE table_field_id = ${tableFieldId}
    AND table_field_key_assignment_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateTableFieldDataFlagDb = async (tableFieldId, changeLogId, updateFlag, currFlag) => {
    var sql = `UPDATE table_field_data
    SET table_field_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE table_field_id = ${tableFieldId}
    AND table_field_data_flag_deleted = ${currFlag}
    RETURNING table_field_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const updateTableFieldOtherDataFlagDb = async (tableFieldId, changeLogId, updateFlag, currFlag) => {
    var sql = `UPDATE table_field_other_data
    SET table_field_other_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE table_field_id = ${tableFieldId}
    AND table_field_other_data_flag_deleted = ${currFlag}
    RETURNING table_field_other_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const updateTableFieldKeyDataFlagDb = async (tableFieldKeyAssignmentId, keyId, changeLogId, updateFlag, currFlag) => {
    var sql = `UPDATE table_field_key_assignment_data
    SET table_field_key_assignment_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE table_field_key_assignment_id = ${tableFieldKeyAssignmentId}
    AND table_field_key_type_id IN (${keyId})
    AND table_field_key_assignment_data_flag_deleted = ${currFlag}
    RETURNING table_field_key_assignment_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const updateUniqueKeyAssignmentDataFlagDb = async (uniqueKeyId, changeLogId, updateFlag, currFlag) => {
    var sql = `UPDATE unique_key_assignment_data
    SET unique_key_assignment_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE unique_key_assignment_id = ${uniqueKeyId}
    AND unique_key_assignment_data_flag_deleted = ${currFlag}
    RETURNING unique_key_assignment_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const updateUniqueKeyAssignmentOtherDataFlagDb = async (uniqueKeyId, changeLogId, updateFlag, currFlag) => {
    var sql = `UPDATE unique_key_assignment_other_data
    SET unique_key_assignment_other_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE unique_key_assignment_id = ${uniqueKeyId}
    AND unique_key_assignment_other_data_flag_deleted = ${currFlag}
    RETUENING unique_key_assignment_other_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getKeyDataForTableDb = async (tableId, keyId, flag) => {
    var sql = `SELECT table_field_key_assignment.table_field_key_assignment_id, table_field_key_assignment_data.table_field_key_name, table_field_key_assignment_data.table_field_id,
    table_field_data.table_field_name, table_field_key_type.table_field_key_type_name, table_field_key_assignment_data.parent_table_field_id
    FROM table_field_key_assignment_data
    JOIN table_field_key_assignment ON table_field_key_assignment_data.table_field_key_assignment_id = table_field_key_assignment.table_field_key_assignment_id
    JOIN table_field_data ON table_field_key_assignment_data.table_field_id = table_field_data.table_field_id
    JOIN table_field_key_type ON table_field_key_assignment_data.table_field_key_type_id = table_field_key_type.table_field_key_type_id
    WHERE table_field_key_assignment_data.table_field_key_type_id = ${keyId}
    AND table_field_key_assignment.table_id = ${tableId}
    AND table_field_key_assignment_data.table_field_key_assignment_data_flag_deleted = ${flag}
    AND table_field_data.table_field_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUniqueKeyIdForTableDb = async (tableId, flag) => {
    var sql = `SELECT unique_key_assignment_data.unique_key_assignment_id
    FROM unique_key_assignment_data
    JOIN unique_key_assignment ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment.unique_key_assignment_id
    WHERE unique_key_assignment.table_id = ${tableId}
    AND unique_key_assignment_data.unique_key_assignment_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUniqueKeyDataForTableDb = async (uniqueKeyId, flag) => {
    var sql = `SELECT unique_key_assignment.unique_key_assignment_id, unique_key_assignment_data.unique_key_name, unique_key_assignment_data.color_id,
    color_list.color_name, unique_key_assignment_other_data.table_field_id, table_field_data.table_field_name, cnt.count as unique_key_table_field_count
    FROM unique_key_assignment_data
    JOIN unique_key_assignment ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment.unique_key_assignment_id
    JOIN color_list ON unique_key_assignment_data.color_id = color_list.color_id
    JOIN unique_key_assignment_other_data ON unique_key_assignment_data.unique_key_assignment_id = unique_key_assignment_other_data.unique_key_assignment_id
    JOIN table_field_data ON unique_key_assignment_other_data.table_field_id = table_field_data.table_field_id
    LEFT JOIN (SELECT unique_key_assignment_id, COUNT(*) FROM unique_key_assignment_other_data
          WHERE unique_key_assignment_id IN (${uniqueKeyId}) GROUP BY unique_key_assignment_id) AS cnt
    ON cnt.unique_key_assignment_id = unique_key_assignment_data.unique_key_assignment_id
    WHERE unique_key_assignment_data.unique_key_assignment_id IN (${uniqueKeyId})
    AND unique_key_assignment_data.unique_key_assignment_data_flag_deleted = ${flag}
    AND unique_key_assignment_other_data.unique_key_assignment_other_data_flag_deleted = ${flag}
    AND table_field_data.table_field_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableFieldKeyAssignmentData = async (tableFieldKeyAssignmentId, tableFieldKeyTypeId, flag) => {
    var sql = `SELECT table_field_key_assignment_id, table_field_key_name, table_field_id, table_field_key_type_id, parent_table_field_id
    FROM table_field_key_assignment_data
    WHERE table_field_key_assignment_id = ${tableFieldKeyAssignmentId}
    AND table_field_key_type_id = ${tableFieldKeyTypeId}
    AND table_field_key_assignment_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

module.exports = {
    addTableInDatabase: addTableInDatabase,
    addTableDataInDatabase: addTableDataInDatabase,
    addTableGroupInDatabase: addTableGroupInDatabase,
    addTableGroupDataInDatabase: addTableGroupDataInDatabase,
    addTableGroupAssignmentInDatabase: addTableGroupAssignmentInDatabase,
    addTableGroupAssignmentDataInDatabase: addTableGroupAssignmentDataInDatabase,
    addTableFieldInDatabase: addTableFieldInDatabase,
    addTableFieldDataInDatabase: addTableFieldDataInDatabase,
    addTableFieldOtherDataInDatabase: addTableFieldOtherDataInDatabase,
    addTableFieldKeyAssignmentInDatabase: addTableFieldKeyAssignmentInDatabase,
    addTableFieldKeyAssignmentDataInDatabase: addTableFieldKeyAssignmentDataInDatabase,
    addUniqueKeyAssignmentInDatabase: addUniqueKeyAssignmentInDatabase,
    addUniqueKeyAssignmentDataInDatabase: addUniqueKeyAssignmentDataInDatabase,
    addUniqueKeyAssignmentOtherDataInDatabase: addUniqueKeyAssignmentOtherDataInDatabase,
    checkTableExistInProjectInDb: checkTableExistInProjectInDb,
    checkTableNameExist: checkTableNameExist,
    getTableDataDb: getTableDataDb,
    checkGroupNameExistDb: checkGroupNameExistDb,
    getTableGroupDataDb: getTableGroupDataDb,
    checkTableGroupInProjectDb: checkTableGroupInProjectDb,
    getTableGroupIdDb: getTableGroupIdDb,
    updateTableGroupAssignmentFlagInDb: updateTableGroupAssignmentFlagInDb,
    getTableGroupAssignmentDataDb: getTableGroupAssignmentDataDb,
    updateTableDataFlagDb: updateTableDataFlagDb,
    updateTableGroupDataFlagDb: updateTableGroupDataFlagDb,
    getTableGroupColorInDb: getTableGroupColorInDb,
    getTableDataInfoDb: getTableDataInfoDb,
    getTableGroupDataInfoDb: getTableGroupDataInfoDb,
    getTableGroupAssignmentDataInfoDb: getTableGroupAssignmentDataInfoDb,
    checkColorNameInTableInDb: checkColorNameInTableInDb,
    checkKeyNameInTableInDb: checkKeyNameInTableInDb,
    getTableFieldDataDb: getTableFieldDataDb,
    getTableFieldIdFromTableName: getTableFieldIdFromTableName,
    getTableFieldTableProjectIdInDb: getTableFieldTableProjectIdInDb,
    getTableFieldKeyDataDb: getTableFieldKeyDataDb,
    getParentTableFieldDataDb: getParentTableFieldDataDb,
    getTableFieldUniqueKeyDataDb: getTableFieldUniqueKeyDataDb,
    checkTableFieldExistInTableInDb: checkTableFieldExistInTableInDb,
    getUniqueKeyIdFromTableFieldId: getUniqueKeyIdFromTableFieldId,
    getTableFieldIdDb: getTableFieldIdDb,
    getTableFieldKeyAssignmentIdDb: getTableFieldKeyAssignmentIdDb,
    updateTableFieldDataFlagDb: updateTableFieldDataFlagDb,
    updateTableFieldOtherDataFlagDb: updateTableFieldOtherDataFlagDb,
    updateTableFieldKeyDataFlagDb: updateTableFieldKeyDataFlagDb,
    updateUniqueKeyAssignmentDataFlagDb: updateUniqueKeyAssignmentDataFlagDb,
    updateUniqueKeyAssignmentOtherDataFlagDb: updateUniqueKeyAssignmentOtherDataFlagDb,
    getKeyDataForTableDb: getKeyDataForTableDb,
    getUniqueKeyIdForTableDb: getUniqueKeyIdForTableDb,
    getUniqueKeyDataForTableDb: getUniqueKeyDataForTableDb,
    getTableFieldKeyAssignmentData: getTableFieldKeyAssignmentData
}
