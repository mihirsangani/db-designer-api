// console.log("user.db")
const crud = require("../../crud")
const express = require("express")
const res = require("express/lib/response")

const registerUserIdDb = async (changeLogId) => {
    var fieldArr = [{ field: "added_by_change_log_id", value: changeLogId }]
    var response = await crud.executeQuery(crud.makeInsertQueryString("public.user", fieldArr, ["user_id"], false))

    return response
}

const addUserdataDb = async (changeLogId, userId, username, email, password, statusId, flag) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "user_id", value: userId },
        { field: "user_first_name", value: username },
        { field: "user_data_emailaddress", value: email },
        { field: "user_data_password", value: password },
        { field: "user_status_id", value: statusId },
        { field: "user_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_data", fieldArr, ["user_id"], false))

    return response
}

const addUserSelectedOrganizationInDB = async (userId, organizationId, changeLogId, currentTimeStamp) => {
    var fieldArr = [
        { field: "user_id", value: userId },
        { field: "organization_id", value: organizationId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "timestamp", value: currentTimeStamp }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_selected_organization", fieldArr, ["user_selected_organization_id"], false))

    return response
}

const addUserOrganizationInvitationInDB = async (organizationId, userId, email, userStatusId, changeLogId, flag, inviteSentTimeStamp, inviteExpireTimeStamp, inviteAccessToken) => {
    var fieldArr = [
        { field: "organization_id", value: organizationId },
        { field: "user_id", value: userId },
        { field: "new_user_email_address", value: email },
        { field: "user_organization_status_id", value: userStatusId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "user_organization_invitation_flag_deleted", value: flag },
        { field: "user_organization_invitation_sent_at", value: inviteSentTimeStamp },
        { field: "user_organization_invitation_expire_at", value: inviteExpireTimeStamp },
        { field: "user_organization_invitation_token", value: inviteAccessToken }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_organization_invitation", fieldArr, ["user_organization_invitation_id"], false))

    return response
}

const getAllUserInformationDB = async (flag) => {
    var sql = `SELECT user_id, user_first_name, user_data_id, user_data_emailaddress, user_status_id, status.status_name
    FROM user_data 
    JOIN status ON status.status_id = user_data.user_status_id
    WHERE user_data.user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const addOtpInUserDataDB = async (email, otp, flag) => {
    var sql = `UPDATE user_data
	SET user_data_verification_otp = '${otp}'
	WHERE user_data_emailaddress = '${email}' AND user_data_flag_deleted = ${flag}
    RETURNING user_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserdata = async (email, flag) => {
    var sql = `SELECT  user_data.user_id, user_data.user_first_name, user_data.user_data_id, user_data.user_data_emailaddress,
    user_data.user_data_verification_otp, user_data.user_status_id, status.status_name
	FROM user_data
    JOIN status ON user_data.user_status_id = status.status_id
    WHERE user_data_emailaddress = '${email}' AND user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserDataUsingIdFromDatabaseDB = async (userId, flag) => {
    var sql = `SELECT user_data_emailaddress, user_data_password, user_status_id, user_first_name
    FROM user_data
    WHERE user_id = ${userId}
    AND user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateUserFlagInDatabaseDB = async (changeLogId, userId, updateFlag, currFlag) => {
    var sql = `UPDATE user_data
    SET user_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE user_id = ${userId}
    AND user_data_flag_deleted = ${currFlag}
    RETURNING user_data_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserInformationByUserID = async (userId, flag) => {
    var sql = `SELECT user_id, user_first_name, user_data_id, user_data_emailaddress, user_status_id, user_data_verification_otp
    FROM user_data
    WHERE user_id IN (${userId})
    AND user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserInfoWithFlagLatestDB = async (email) => {
    var sql = `SELECT user_id, user_first_name, user_data_emailaddress, user_status_id, user_data_flag_deleted, added_by_change_log_id
    FROM user_data
    WHERE user_data_emailaddress = '${email}'
    ORDER BY added_by_change_log_id DESC`
    var response = await crud.executeQuery(sql)

    return response
}

module.exports = {
    getAllUserInformationDB: getAllUserInformationDB,
    addUserdataDb: addUserdataDb,
    addUserSelectedOrganizationInDB: addUserSelectedOrganizationInDB,
    addUserOrganizationInvitationInDB: addUserOrganizationInvitationInDB,
    registerUserIdDb: registerUserIdDb,
    addOtpInUserDataDB: addOtpInUserDataDB,
    getUserdata: getUserdata,
    getUserDataUsingIdFromDatabaseDB: getUserDataUsingIdFromDatabaseDB,
    updateUserFlagInDatabaseDB: updateUserFlagInDatabaseDB,
    getUserInformationByUserID: getUserInformationByUserID,
    getUserInfoWithFlagLatestDB: getUserInfoWithFlagLatestDB
}
