// console.log("auth.db");
const express = require("express")
const router = express.Router()
const crud = require("./../../crud")

const addUserLogInLogDB = async (changeLogId, ipAddress, firstName, currentTimeStamp) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "user_login_log_ip_address", value: ipAddress },
        { field: "user_login_log_username", value: firstName },
        { field: "user_login_log_timestamp", value: currentTimeStamp }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_login_log", fieldArr, ["user_login_log_id"], false))

    return response
}

const addAccessTokenData = async (user_id, accessToken, currentTimeStamp, expiryTimeString, flag) => {
    var fieldArr = [
        { field: "user_id", value: user_id },
        { field: "user_access_token", value: accessToken },
        { field: "user_access_token_created_at", value: currentTimeStamp },
        { field: "user_access_token_expire_at", value: expiryTimeString },
        { field: "user_access_token_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_access_token", fieldArr, ["user_access_token_id"], false))

    return response
}

const getUserDataByEmailaddressDb = async (email, flag) => {
    var sql = `SELECT user_data.user_data_password, user_data.user_id, user_data.user_first_name, user_data.user_data_emailaddress, status.status_id, status.status_name
	FROM user_data
	JOIN status ON user_data.user_status_id = status.status_id
    WHERE user_data.user_data_emailaddress = '${email}'
    AND user_data.user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserRoleByUserIdDb = async (userId, flag) => {
    var sql = `SELECT project_user_role.project_id, project_access_role.project_access_role_type
	FROM project_user_role
	JOIN project_access_role ON	project_user_role.project_access_role_id = project_access_role.project_access_role_id
	WHERE project_user_role.user_id = ${userId}
    AND project_user_role_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserInfoDB = async (email, flag) => {
    var sql = `SELECT user_id, user_first_name, user_status_id, user_data_verification_otp
    FROM user_data
    WHERE user_data_emailaddress = '${email}'
    AND user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const statusActiveDB = async (email, statusId, flag) => {
    var sql = `UPDATE user_data
    SET user_status_id = ${statusId}, user_data_verification_otp = null
    WHERE user_data_emailaddress = '${email}'
    AND user_data_flag_deleted = ${flag}
    RETURNING user_status_id`
    var response = await crud.executeQuery(sql)

    return response
}

const addOtpInUserDataDB = async (email, otp, flag) => {
    var sql = `UPDATE user_data
    SET user_data_verification_otp = '${otp}'
    WHERE user_data_emailaddress = '${email}'
    AND user_data_flag_deleted = ${flag}
    RETURNING user_id`
    var response = await crud.executeQuery(sql)

    return response
}

const updateUserDataFlagDb = async (email, changeLogId, updateFlag, currFlag) => {
    var sql = `UPDATE user_data
	SET user_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}, user_data_verification_otp = null
	WHERE user_data_emailaddress = '${email}'
    AND user_data_flag_deleted = ${currFlag}
    RETURNING user_id`
    var response = await crud.executeQuery(sql)

    return response
}

const updateAccessTokenFlagDb = async (accessToken, currentTimeStamp, changeLogId, currFlag, updateFlag) => {
    var sql = `UPDATE user_access_token
    SET user_access_token_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE user_access_token = '${accessToken}'
    AND user_access_token_expire_at >= '${currentTimeStamp}'
    AND user_access_token_flag_deleted = ${currFlag}
    RETURNING user_id`
    var response = await crud.executeQuery(sql)

    return response
}

module.exports = {
    getUserDataByEmailaddressDb: getUserDataByEmailaddressDb,
    getUserRoleByUserIdDb: getUserRoleByUserIdDb,
    getUserInfoDB: getUserInfoDB,
    statusActiveDB: statusActiveDB,
    addOtpInUserDataDB: addOtpInUserDataDB,
    updateUserDataFlagDb: updateUserDataFlagDb,
    addUserLogInLogDB: addUserLogInLogDB,
    addAccessTokenData: addAccessTokenData,
    updateAccessTokenFlagDb: updateAccessTokenFlagDb
}
