const crud = require("./../routers/crud")
const nodemailer = require("nodemailer")
const constant = require("./constant")
const { google } = require("googleapis")
const dotenv = require("dotenv").config()
const fs = require("fs")

const formateDateLib = async (date) => {
    var d = new Date(date),
        month = d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1,
        day = d.getDate() < 10 ? "0" + d.getDate() : d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours(),
        minute = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes(),
        second = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds()

    var str = [year, month, day].join("-")
    var formatedDate = `${str} ${hour}:${minute}:${second}`
    return formatedDate
}

const getCurrentTimeStamp = async (date) => {
    let currentTimeStamp = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    return currentTimeStamp
}

const getExpireTimeStamp = async (flag) => {
    if (flag) {
        var expireTimeStamp = new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 15)
    } else {
        var expireTimeStamp = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }

    return expireTimeStamp
}

const getRandomString = async (len) => {
    if (len == undefined) return ""
    var result = ""
    var characters = "ABCDEFGHIJKfLMNOPQrerfhRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    var charactersLength = characters.length
    for (var i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
        // if (i == (len - 1)) {
        //     result += new Date().getTime()
        // }
    }
    return result
}

const addChangeLogDetailsLib = async (obj) => {
    const getTime = new Date()
    var fieldArr = [
        { field: "user_id", value: obj.userId },
        { field: "change_log_timestamp", value: await formateDateLib(getTime) },
        { field: "change_log_ip_address", value: obj.ipAddress }
    ]

    if (obj.companyId) fieldArr.push({ field: "company_id", value: obj.companyId })
    const changeLogDetails = await crud.executeQuery(crud.makeInsertQueryString("change_log", fieldArr, ["change_log_id"], false))

    if (!changeLogDetails.status) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }
    return changeLogDetails
}

const sendMailtoUser = async (toEmail, subjectEmail, outputEmail) => {
    sendMail(toEmail, subjectEmail, outputEmail)
        .then((result) => {
            return { status: true, message: `Email has been sent...` }
        })
        .catch((err) => {
            return { status: false, error: err.message }
        })

    async function sendMail(toEmail, subjectEmail, outputEmail) {
        try {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    pass: process.env.APP_PASSWORD
                }
            })

            const mailOptions = {
                from: `no-reply <${process.env.EMAIL}>`,
                to: toEmail,
                subject: subjectEmail,
                html: outputEmail
            }

            transporter.sendMail(mailOptions)
        } catch (error) {
            console.log("Error : ", error.message)
        }
    }
}

const generateOTP = () => {
    let otp = ""
    for (let i = 0; i < 8; i++) {
        const randomValue = Math.round(Math.random() * 9)
        otp = otp + randomValue
    }
    return otp
}

// Update Flag Query
const updateFlag = async (tableName, flagTableFieldName, updateFlag, changeLogTableFieldName, changeLogId, conditionTableFieldName, tableFieldValue, conditionFlagTableFieldName, currFlag, returnTableFieldName) => {
    var sql = `UPDATE '${tableName}'
    SET '${flagTableFieldName}' = ${updateFlag}, '${changeLogTableFieldName}' = ${changeLogId}
    WHERE '${conditionTableFieldName}' = ${tableFieldValue}
    AND '${conditionFlagTableFieldName}' = ${currFlag}
    RETURNING '${returnTableFieldName}'`
    var response = await crud.executeQuery(sql)

    return response
}

const getProjectDatabaseTypeId = async (projectId, flag) => {
    var sql = `SELECT project_database_type_id FROM project_data WHERE project_id = ${projectId} AND project_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getDataTypeLengthFlag = async (databaseId, dataTypeId) => {
    var sql = `SELECT table_field_datatype_flag_length_accept FROM table_field_data_type WHERE table_field_data_type_id = ${dataTypeId} AND project_database_type_id = ${databaseId}`
    var response = await crud.executeQuery(sql)

    return response
}

const getStatusIdFromStatusName = async (statusName) => {
    var sql = `SELECT status_id FROM status WHERE status_name = '${statusName}'`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllStatusIdArray = async () => {
    var sql = `SELECT status_id FROM status`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.status_id
    })

    return idArray
}

const getColorIdFromColorName = async (colorName) => {
    var sql = `SELECT color_id FROM color_list WHERE color_name = '${colorName}'`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllColorIdArray = async () => {
    var sql = `SELECT color_id FROM color_list`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.color_id
    })

    return idArray
}

const getProjectDatabaseTypeIdFromDatabaseName = async (databaseName) => {
    var sql = `SELECT project_database_type_id FROM project_database_type WHERE project_database_type_name = '${databaseName}'`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllProjectDatabaseTypeIdArray = async () => {
    var sql = `SELECT project_database_type_id FROM project_database_type`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.project_database_type_id
    })

    return idArray
}

const getProjectAccessRoleIdFromProjectAccessRoleName = async (roleName) => {
    var sql = `SELECT project_access_role_id FROM project_access_role WHERE project_access_role_type = '${roleName}'`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllProjectAccessRoleIdArray = async () => {
    var sql = `SELECT project_access_role_id FROM project_access_role`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.project_access_role_id
    })

    return idArray
}

const getTableFieldDataTypeIdFromDatabaseTypeId = async (databaseId) => {
    var sql = `SELECT table_field_data_type_id FROM table_field_data_type WHERE project_database_type_id = ${databaseId}`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.table_field_data_type_id
    })

    return idArray
}

const getTableFieldDataTypeIdFromTableFieldDataName = async (dataTypeName, databaseId) => {
    var sql = `SELECT table_field_data_type_id FROM table_field_data_type WHERE table_field_data_type_name = '${dataTypeName}' AND project_database_type_id = ${databaseId}`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllTableFieldDataTypeIdArray = async () => {
    var sql = `SELECT table_field_data_type_id FROM table_field_data_type`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.table_field_data_type_id
    })

    return idArray
}

const getTableFieldKeyTypeIdFromTableFieldKeyTypeName = async (tableFieldKeyTypeName) => {
    var sql = `SELECT table_field_key_type_id FROM table_field_key_type WHERE table_field_key_type_name = '${tableFieldKeyTypeName}'`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllTableFieldKeyTypeIdArray = async () => {
    var sql = `SELECT table_field_key_type_id FROM table_field_key_type`
    var response = await crud.executeQuery(sql)
    var idArray = response.data.map((obj) => {
        return obj.table_field_key_type_id
    })

    return idArray
}

const checkEmailInDatabaseDb = async (email, flag) => {
    var sql = `SELECT user_id, user_first_name, user_status_id FROM user_data WHERE user_data_emailaddress = '${email}' AND user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkOrganizationInDatabaseDB = async (userId, organizationId, flag) => {
    var sql = `SELECT user_organization_data.user_organization_data_id, organization_data.organization_name
    FROM user_organization_data
    JOIN organization_data ON user_organization_data.organization_id = organization_data.organization_id
    WHERE user_organization_data.user_id = ${userId}
    AND user_organization_data.organization_id = ${organizationId}
    AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkOrganizationCreatorDB = async (organizationId, flag) => {
    var sql = `SELECT organization.organization_created_by_user_id, organization_data.organization_name, organization_data.organization_status_id, status.status_name
    FROM organization_data
    JOIN organization ON organization_data.organization_id = organization.organization_id
    JOIN status ON organization_data.organization_status_id = status.status_id
    WHERE organization_data.organization_id = ${organizationId}
    AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserCreatedOrganizationDB = async (userId, flag) => {
    var sql = `SELECT organization.organization_id
        FROM organization
        JOIN organization_data ON organization.organization_id = organization_data.organization_id
        WHERE organization_created_by_user_id = ${userId}
        AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getTableNameInProjectDb = async (projectId, flag) => {
    var sql = `SELECT table_data.table_name
    FROM table_data
    WHERE table_data.project_id = ${projectId}
    AND table_data.table_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)
    var nameArr = response.data.map((obj) => {
        return obj.table_name
    })

    return nameArr
}

const getGroupNameInProjectDb = async (projectId, flag) => {
    var sql = `SELECT table_group_data.table_group_name
    FROM table_group_data
    WHERE table_group_data.project_id = ${projectId}
    AND table_group_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)
    var nameArr = response.data.map((obj) => {
        return obj.table_group_name
    })

    return nameArr
}

module.exports = {
    formateDateLib: formateDateLib,
    getCurrentTimeStamp: getCurrentTimeStamp,
    getExpireTimeStamp: getExpireTimeStamp,
    getRandomString: getRandomString,
    addChangeLogDetailsLib: addChangeLogDetailsLib,
    generateOTP: generateOTP,
    getProjectDatabaseTypeId: getProjectDatabaseTypeId,
    getDataTypeLengthFlag: getDataTypeLengthFlag,
    getStatusIdFromStatusName: getStatusIdFromStatusName,
    getAllStatusIdArray: getAllStatusIdArray,
    getColorIdFromColorName: getColorIdFromColorName,
    getAllColorIdArray: getAllColorIdArray,
    getProjectDatabaseTypeIdFromDatabaseName: getProjectDatabaseTypeIdFromDatabaseName,
    getAllProjectDatabaseTypeIdArray: getAllProjectDatabaseTypeIdArray,
    getProjectAccessRoleIdFromProjectAccessRoleName: getProjectAccessRoleIdFromProjectAccessRoleName,
    getAllProjectAccessRoleIdArray: getAllProjectAccessRoleIdArray,
    getTableFieldDataTypeIdFromDatabaseTypeId: getTableFieldDataTypeIdFromDatabaseTypeId,
    getTableFieldDataTypeIdFromTableFieldDataName: getTableFieldDataTypeIdFromTableFieldDataName,
    getAllTableFieldDataTypeIdArray: getAllTableFieldDataTypeIdArray,
    getTableFieldKeyTypeIdFromTableFieldKeyTypeName: getTableFieldKeyTypeIdFromTableFieldKeyTypeName,
    getAllTableFieldKeyTypeIdArray: getAllTableFieldKeyTypeIdArray,
    sendMailtoUser: sendMailtoUser,
    checkEmailInDatabaseDb: checkEmailInDatabaseDb,
    checkOrganizationInDatabaseDB: checkOrganizationInDatabaseDB,
    checkOrganizationCreatorDB: checkOrganizationCreatorDB,
    getUserCreatedOrganizationDB: getUserCreatedOrganizationDB,
    getTableNameInProjectDb: getTableNameInProjectDb,
    getGroupNameInProjectDb: getGroupNameInProjectDb
}
