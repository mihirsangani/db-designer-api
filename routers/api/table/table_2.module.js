const router = require("express").Router()
const tableDB = require("./table.db")
const TableFunction = require("./table.function")
const projectDB = require("../project/project.db")
const LibFunction = require("../../../helpers/LibFunction")
const constant = require("../../../helpers/constant")
const dotenv = require("dotenv").config()

const deleteTableFieldModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const projectId = req.query.project_id
    const tableId = req.query.table_id
    const tableFieldId = req.query.table_field_id

    const flagFalse = false
    const flagTrue = true

    if (!projectId || !tableId || !tableFieldId) {
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

    const checkTableFieldIdInTable = await tableDB.checkTableFieldExistInTableInDb(tableFieldId, tableId, flagFalse)
    if (checkTableFieldIdInTable.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE
        }
    }

    const createChangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createChangeLogId.data[0].change_log_id

    const updateTableFieldDataFlag = await tableDB.updateTableFieldDataFlagDb(tableFieldId, changeLogId, flagTrue, flagFalse)
    if (updateTableFieldDataFlag.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const updateTableFieldOtherDataFlag = await tableDB.updateTableFieldOtherDataFlagDb(tableFieldId, changeLogId, updateFlag, currFlag)
    if (updateTableFieldOtherDataFlag.data.length == 0) {
        return {
            "status": false,
            "error": constant.requestMessages.ERR_QUERY
        }
    }

    const getTableFieldKeyAssignmentId = await tableDB.getTableFieldKeyAssignmentIdDb(tableFieldId, flagFalse)
    if (getTableFieldKeyAssignmentId.data.length > 0) {
        const tableFieldKeyAssignmentId = getTableFieldKeyAssignmentId.data[0].table_field_key_assignment_id
        const keyId = getTableFieldKeyAssignmentId.data.map((obj) => {
            return obj.table_field_key_type_id
        })

        const updateTableFieldKeyDataFlag = await tableDB.updateTableFieldKeyDataFlagDb(tableFieldKeyAssignmentId, keyId.join(","), changeLogId, flagTrue, flagFalse)
        if (updateTableFieldKeyDataFlag.data.length == 0) {
            return {
                "status": false,
                "error": constant.requestMessages.ERR_QUERY
            }
        }
    }

    const getUniqueKeyId = await tableDB.getUniqueKeyIdFromTableFieldId(tableFieldId, flagFalse)
    if (getUniqueKeyId.data.length > 0) {
        const uniqueIdArr = getUniqueKeyId.data.map((obj) => {
            return obj.unique_key_assignment_id
        })

        const getUniqueKeyDataForTable = await tableDB.getUniqueKeyDataForTableDb(uniqueIdArr.join(","), flagFalse)
        const uniqueKeyDataArr = getUniqueKeyDataForTable.data.filter((obj) => {
            obj.unique_key_table_field_count == 1
        })

        if (uniqueKeyDataArr.length > 0) {
            const uniqueKeyAssignmentId = uniqueKeyDataArr[0].unique_key_assignment_id
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
    }

    return {
        "status": true
    }
}

module.exports = {
    deleteTableFieldModule: deleteTableFieldModule
}
