console.log("organization.db")
const crud = require("../../crud")
const express = require("express")

const registerNewOrganizationDB = async (userId, changeLogId) => {
    var fieldArr = [
        { field: "organization_created_by_user_id", value: userId },
        { field: "added_by_change_log_id", value: changeLogId }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("organization", fieldArr, ["organization_id"], false))

    return response
}

const addOrganizationdataDb = async (changeLogId, organizationId, organizationStatusId, organizationName, flag) => {
    var fieldArr = [
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "organization_id", value: organizationId },
        { field: "organization_status_id", value: organizationStatusId },
        { field: "organization_name", value: organizationName },
        { field: "organization_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("organization_data", fieldArr, ["organization_data_id"], false))

    return response
}

const registerNewUserToOrganizationDB = async (changeLogId) => {
    var fieldArr = [{ field: "added_by_change_log_id", value: changeLogId }]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_organization", fieldArr, ["user_organization_id"], false))

    return response
}

const addUserOrganizationDataDb = async (userOrganizationId, userId, changeLogId, organizationId, userOrganizationStatusId, flag) => {
    var fieldArr = [
        { field: "user_organization_id", value: userOrganizationId },
        { field: "user_id", value: userId },
        { field: "added_by_change_log_id", value: changeLogId },
        { field: "organization_id", value: organizationId },
        { field: "user_organization_user_status_id", value: userOrganizationStatusId },
        { field: "user_organization_data_flag_deleted", value: flag }
    ]
    var response = await crud.executeQuery(crud.makeInsertQueryString("user_organization_data", fieldArr, ["user_organization_data_id"], false))

    return response
}

const getOrganizationCreatedByUserIdDB = async (organizationId, flag) => {
    var sql = `SELECT organization.organization_created_by_user_id
    FROM organization
    JOIN organization_data ON organization.organization_id = organization_data.organization_id
    JOIN user_data ON organization.organization_created_by_user_id = user_data.user_id
    WHERE organization.organization_id = ${organizationId}
    AND organization_data.organization_data_flag_deleted = ${flag}
    AND user_data.user_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getOrganizationNameDB = async (organizationId, flag) => {
    var sql = `SELECT organization_name
    FROM organization_data
    WHERE organization_id = ${organizationId}
    AND organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const checkUserInOrganizationDb = async (userId, organizationId, flag) => {
    var sql = `SELECT user_organization_id FROM user_organization_data WHERE user_id = ${userId} AND organization_id = ${organizationId} AND user_organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getOganizationInfoDB = async (organizationId, flag) => {
    var sql = `SELECT organization_data.organization_status_id, organization_data.organization_name, status.status_name
    FROM organization_data
    JOIN status ON organization_data.organization_status_id = status.status_id
    WHERE organization_data.organization_id = ${organizationId}
    AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getCurrUserOrganizationIdDB = async (userId) => {
    var sql = `SELECT user_organization_data.organization_id, organization.organization_created_by_user_id, status.status_name
    FROM user_organization_data
    JOIN organization ON user_organization_data.organization_id = organization.organization_id
    JOIN organization_data ON organization.organization_id = organization_data.organization_id
    JOIN status ON organization_data.organization_status_id = status.status_id
    WHERE user_organization_data.user_id = ${userId}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateOrganizationFlagDB = async (changeLogId, organizationId, updateFlag, currFlag) => {
    var sql = `UPDATE organization_data
    SET organization_data_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE organization_id = ${organizationId}
    AND organization_data_flag_deleted = ${currFlag}
    RETURNING organization_id`
    var response = await crud.executeQuery(sql)

    return response
}

const activeOrganizationDB = async (userId, organizationId, flagLatest, changeLogId) => {
    var sql = `UPDATE organization_data
    SET organization_data_flag_deleted = '${flagLatest}', flag_deleted_by_change_log_id = ${changeLogId}
    FROM organization_data od
    JOIN organization ON organization.organization_id = od.organization_id
    WHERE organization.organization_created_by_user_id = ${userId}
    AND organization.organization_id = ${organizationId}`
    var response = await crud.executeQuery(sql)

    return response
}

const getAllUserOrganizationInformationDB = async (flag) => {
    var sql = `SELECT user_organization_data.user_id, user_organization_data.organization_id, organization_data.organization_name,
    user_organization_data.user_organization_user_status_id, status.status_name, user_organization_data.user_organization_id
    FROM user_organization_data
    JOIN organization_data ON user_organization_data.organization_id = organization_data.organization_id
    JOIN status ON user_organization_data.user_organization_user_status_id = status.status_id
    WHERE organization_data.organization_data_flag_deleted = ${flag}
    AND user_organization_data.user_organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserOrganizationInformationByUserID = async (userId, flag) => {
    var sql = `SELECT organization_data.organization_id, organization_data.organization_name, organization.organization_created_by_user_id,
    user_organization_data.user_organization_id, user_organization_data.user_organization_user_status_id, status.status_name
    FROM user_organization_data
    JOIN organization_data ON user_organization_data.organization_id = organization_data.organization_id
    JOIN organization ON organization_data.organization_id = organization.organization_id
    JOIN status ON user_organization_data.user_organization_user_status_id = status.status_id
    WHERE user_organization_data.user_id = ${userId}
    AND user_organization_data.user_organization_data_flag_deleted = ${flag}
    AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserOrganizationInvitationInfoByIdDB = async (newUserId, newUserEmail, flag) => {
    var sql = `SELECT user_organization_invitation_token
    FROM user_organization_invitation
    WHERE ( user_id = ${newUserId} OR new_user_email_address = '${newUserEmail}' )
    AND user_organization_invitation_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserOrganizationInvitationInfoDB = async (invitationToken, currentTimeStamp, flag) => {
    var sql = `SELECT user_organization_invitation.user_id, user_organization_invitation.new_user_email_address, user_organization_invitation.organization_id,
    user_organization_invitation.user_organization_status_id
    FROM user_organization_invitation
    JOIN organization_data ON user_organization_invitation.organization_id = organization_data.organization_id
    WHERE user_organization_invitation.user_organization_invitation_token = '${invitationToken}'
    AND user_organization_invitation.user_organization_invitation_sent_at <= '${currentTimeStamp}'
    AND user_organization_invitation.user_organization_invitation_expire_at >= '${currentTimeStamp}'
    AND user_organization_invitation.user_organization_invitation_flag_deleted = ${flag}
    AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const updateUserOrganizationInvitationFlagDB = async (changeLogId, invitationToken, updateFlag, currFlag) => {
    var sql = `UPDATE user_organization_invitation
    SET user_organization_invitation_flag_deleted = ${updateFlag}, flag_deleted_by_change_log_id = ${changeLogId}
    WHERE user_organization_invitation_token = '${invitationToken}'
    AND user_organization_invitation_flag_deleted = ${currFlag}
    RETURNING user_organization_invitation_id`
    var response = await crud.executeQuery(sql)

    return response
}

const getCurrOrganizationUserInfoDB = async (userId, organizationId, flag) => {
    var sql = `SELECT user_organization_data.organization_id, organization_data.organization_name, organization.organization_created_by_user_id,
    user_organization_data.user_id, user_organization_data.user_organization_id, user_organization_data.user_organization_user_status_id, status.status_name
    FROM user_organization_data
    JOIN organization_data ON user_organization_data.organization_id = organization_data.organization_id
    JOIN organization ON organization_data.organization_id = organization.organization_id
    JOIN status ON user_organization_data.user_organization_user_status_id = status.status_id
    WHERE user_organization_data.organization_id = ${organizationId}
    AND user_organization_data.user_id = ${userId}
    AND user_organization_data.user_organization_data_flag_deleted = ${flag}
    AND organization_data.organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

const getUserInOrganization = async (organizationId, flag) => {
    var sql = `SELECT user_organization_data.user_id, user_organization_data.user_organization_user_status_id, status.status_name
    FROM user_organization_data
    JOIN status ON user_organization_data.user_organization_user_status_id = status.status_id
    JOIN organization_data ON user_organization_data.organization_id = organization_data.organization_id
    WHERE user_organization_data.organization_id = ${organizationId}
    AND organization_data.organization_data_flag_deleted = ${flag}
    AND user_organization_data.user_organization_data_flag_deleted = ${flag}`
    var response = await crud.executeQuery(sql)

    return response
}

module.exports = {
    registerNewOrganizationDB: registerNewOrganizationDB,
    addOrganizationdataDb: addOrganizationdataDb,
    registerNewUserToOrganizationDB: registerNewUserToOrganizationDB,
    addUserOrganizationDataDb: addUserOrganizationDataDb,
    getOrganizationCreatedByUserIdDB: getOrganizationCreatedByUserIdDB,
    getOrganizationNameDB: getOrganizationNameDB,
    checkUserInOrganizationDb: checkUserInOrganizationDb,
    getOganizationInfoDB: getOganizationInfoDB,
    getCurrUserOrganizationIdDB: getCurrUserOrganizationIdDB,
    updateOrganizationFlagDB: updateOrganizationFlagDB,
    activeOrganizationDB: activeOrganizationDB,
    getAllUserOrganizationInformationDB: getAllUserOrganizationInformationDB,
    getUserOrganizationInformationByUserID: getUserOrganizationInformationByUserID,
    getUserOrganizationInvitationInfoByIdDB: getUserOrganizationInvitationInfoByIdDB,
    getUserOrganizationInvitationInfoDB: getUserOrganizationInvitationInfoDB,
    updateUserOrganizationInvitationFlagDB: updateUserOrganizationInvitationFlagDB,
    getCurrOrganizationUserInfoDB: getCurrOrganizationUserInfoDB,
    getUserInOrganization: getUserInOrganization
}
