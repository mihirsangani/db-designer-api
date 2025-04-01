// console.log("user.module")
const router = require("express").Router()
const userDB = require("./user.db")
const organizationDB = require("../organization/organization.db")
const LibFunction = require("../../../helpers/LibFunction")
const organizationModule = require("../organization/organization.module")
const authDb = require("../auth/auth.db")
const constant = require("../../../helpers/constant")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv").config()
const saltRounds = 10
const myPlaintextPassword = "s0//P4$$w0rD"

const postUserModule = async (req) => {
    const ipAddress = req.ip

    const userName = req.body.username
    const emailAddress = req.body.email_address
    const password = req.body.password
    const confirmPassword = req.body.confirm_password

    const organizationName = req.body.organization_name
    const organizationCreateFlag = req.body.organization_create_flag // (Depends on invitation token obtained or not) Hidden Flag For Check User Want Create New Organization Or Wants To Be Add In Any Organization
    const invitationToken = req.body.invitation_token // Always Take From Query If There

    const flagFalse = false

    const registeredStatusId = await LibFunction.getStatusIdFromStatusName("Registered")
    const statusId = registeredStatusId.data[0].status_id

    if (!userName || !emailAddress || !password || !confirmPassword) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    if (password != confirmPassword) {
        return {
            status: false,
            error: constant.requestMessages.ERR_PASSWORD_CONFIRM_PASSWORD_MATCH
        }
    }

    if (organizationCreateFlag) {
        if (!organizationName) {
            return {
                status: false,
                error: constant.requestMessages.ERR_INVALID_BODY
            }
        }
    }

    if ((invitationToken && organizationCreateFlag) || organizationCreateFlag == undefined || organizationCreateFlag === "" || (!invitationToken && !organizationCreateFlag)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    var date = new Date()
    let currentTimeStamp = await LibFunction.getCurrentTimeStamp(date)

    if (invitationToken && organizationCreateFlag == false) {
        const getUserOrganizationInvitationInfo = await organizationDB.getUserOrganizationInvitationInfoDB(invitationToken, currentTimeStamp, flagFalse)

        if (getUserOrganizationInvitationInfo.data.length > 0) {
            if (getUserOrganizationInvitationInfo.data[0].new_user_email_address == null && getUserOrganizationInvitationInfo.data[0].user_id != null) {
                return {
                    status: false,
                    error: constant.requestMessages.ERR_REGISTRATION_PROCESS
                }
            } else if (getUserOrganizationInvitationInfo.data[0].new_user_email_address != null && getUserOrganizationInvitationInfo.data[0].user_id == null) {
                if (getUserOrganizationInvitationInfo.data[0].new_user_email_address != emailAddress) {
                    return {
                        status: false,
                        error: constant.requestMessages.ERR_EMAIL_ADDRESS
                    }
                }
            }
        } else {
            return {
                status: false,
                error: constant.requestMessages.ERR_INVALID_INVITATION_TOKEN
            }
        }
    }

    const emailRegexp = /^([a-zA-Z0-9\._]+)@([a-zA-Z)-9])+.([a-z]+)(.[a-z]+)?$/
    if (!emailRegexp.test(emailAddress)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_EMAIL_ADDRESS
        }
    }

    const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!passwordRegexp.test(password)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_PASSWORD_FORMAT
        }
    }

    const obj = {
        ipAddress: ipAddress
    }

    const checkEmailInDatabase = await LibFunction.checkEmailInDatabaseDb(emailAddress, flagFalse)
    if (checkEmailInDatabase.data.length > 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_REGISTRATION_PROCESS
        }
    }

    const createchangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createchangeLogId.data[0].change_log_id

    const registerUserId = await userDB.registerUserIdDb(changeLogId)
    const userId = registerUserId.data[0].user_id

    const hash = bcrypt.hashSync(password, saltRounds)
    const addUserdata = await userDB.addUserdataDb(changeLogId, userId, userName, emailAddress, hash, statusId, flagFalse)
    if (addUserdata.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const getActiveStatusId = await LibFunction.getStatusIdFromStatusName("Active")
    const activeStatusId = getActiveStatusId.data[0].status_id

    const getUserdata = await userDB.getUserdata(emailAddress, flagFalse)
    if (organizationCreateFlag && organizationName && !invitationToken) {
        const createOrganization = await organizationModule.createOrganizationModule(changeLogId, getUserdata.data[0].user_id, organizationName, activeStatusId)

        if (createOrganization) {
            var result = []
            const finalData = {
                "user_id": getUserdata.data[0].user_id,
                "username": getUserdata.data[0].user_first_name,
                "email_address": getUserdata.data[0].user_data_emailaddress,
                "status": {
                    "id": getUserdata.data[0].user_status_id,
                    "name": getUserdata.data[0].status_name
                },
                "organization": createOrganization
            }
            result.push(finalData)

            const otp = LibFunction.generateOTP()
            const addOtpInUserDataDB = await userDB.addOtpInUserDataDB(emailAddress, otp, flagFalse)
            if (addOtpInUserDataDB.data.length == 0) {
                return {
                    status: false,
                    error: constant.requestMessages.ERR_QUERY
                }
            }

            var toEmail = emailAddress
            var subjectEmail = "Verification Email"
            var outputEmail = `<h3>OTP for Verification is ${otp}</h3><h1>${otp}</h1>`
            const sendMail = await LibFunction.sendMailtoUser(toEmail, subjectEmail, outputEmail)

            return {
                status: true,
                data: result
            }
        } else {
            return {
                status: false,
                error: constant.requestMessages.ERR_CREATING_ORGANIZATION
            }
        }
    } else if (invitationToken && !organizationCreateFlag) {
        if (getUserdata.data.length > 0) {
            const updateUserStatusId = await authDb.statusActiveDB(emailAddress, activeStatusId, flagFalse)
            const statusId = updateUserStatusId.data[0].user_status_id

            if (statusId == activeStatusId) {
                const userId = getUserdata.data[0].user_id
                const firstName = getUserdata.data[0].user_first_name
                const userEmail = getUserdata.data[0].user_data_emailaddress

                let currentTime = await LibFunction.formateDateLib(date)
                let expireTime = await LibFunction.formateDateLib(await LibFunction.getExpireTimeStamp(flagFalse))

                var accessToken = (await LibFunction.getRandomString(64)) + new Date().getTime()

                const addAccessTokenData = await authDb.addAccessTokenData(userId, accessToken, currentTime, expireTime, flagFalse)

                if (addAccessTokenData.data.length > 0) {
                    var result = []
                    const data = {
                        "access_token": accessToken,
                        "invitation_token": invitationToken,
                        "user": {
                            "user_id": userId,
                            "username": firstName,
                            "email_address": userEmail
                        }
                    }
                    result.push(data)

                    return {
                        status: true,
                        data: result
                    }
                } else {
                    return {
                        status: false,
                        error: constant.requestMessages.ERR_QUERY
                    }
                }
            } else {
                return {
                    status: false,
                    error: constant.requestMessages.ERR_NOT_VERIFIED
                }
            }
        } else {
            return {
                status: false,
                error: constant.requestMessages.ERR_USER_NOT_EXISTS
            }
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_GENERAL
        }
    }
}

const getAllUserInformationModule = async (req) => {
    const userID = req.user_data.user_id // Get Call Made By User's ID
    const flagFalse = false

    var userdata = await userDB.getAllUserInformationDB(flagFalse)
    var orgdata = await organizationDB.getAllUserOrganizationInformationDB(flagFalse)

    if (userdata.data.length == 0) {
        return {
            status: true,
            data: []
        }
    }

    var userDataArr = userdata.data
    var orgDataArr = orgdata.data

    var result = []
    for (var i = 0; i < userDataArr.length; i++) {
        var arrOrg = []

        for (var j = 0; j < orgDataArr.length; j++) {
            if (userDataArr[i].user_id == orgDataArr[j].user_id) {
                var obj = {
                    "organization_id": orgDataArr[j].organization_id,
                    "organization_name": orgDataArr[j].organization_name,
                    "user_organization_id": orgDataArr[j].user_organization_id,
                    "user_organization_status_id": orgDataArr[j].user_organization_user_status_id,
                    "user_organization_status_name": orgDataArr[j].status_name
                }
                arrOrg.push(obj)
            }
        }
        var data = {
            "user_id": userDataArr[i].user_id,
            "username": userDataArr[i].user_first_name,
            "email_address": userDataArr[i].user_data_emailaddress,
            "status": {
                "id": userDataArr[i].user_status_id,
                "name": userDataArr[i].status_name
            },
            "organization": arrOrg
        }
        result.push(data)
    }

    return {
        status: true,
        data: result
    }
}

const updateUsernameModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id

    const newUserName = req.body.first_name

    const flagFalse = false
    const flagTrue = true

    if (!newUserName) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    var obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const getUserDataUsingIdFromDatabase = await userDB.getUserDataUsingIdFromDatabaseDB(userId, flagFalse)

    if (getUserDataUsingIdFromDatabase.data.length > 0) {
        const email = getUserDataUsingIdFromDatabase.data[0].user_data_emailaddress
        const password = getUserDataUsingIdFromDatabase.data[0].user_data_password
        const statusId = getUserDataUsingIdFromDatabase.data[0].user_status_id
        const username = getUserDataUsingIdFromDatabase.data[0].user_first_name

        if (username.toLowerCase() == newUserName.toLowerCase()) {
            return {
                status: false,
                error: constant.requestMessages.ERR_NAME
            }
        }

        const createchangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
        const changeLogId = createchangeLogId.data[0].change_log_id

        const updateUserFlagInDatabase = await userDB.updateUserFlagInDatabaseDB(changeLogId, userId, flagTrue, flagFalse)

        if (updateUserFlagInDatabase.data.length > 0) {
            const addUpdatedDataInDatabase = await userDB.addUserdataDb(changeLogId, userId, newUserName, email, password, statusId, flagFalse)

            if (addUpdatedDataInDatabase.data.length > 0) {
                return {
                    status: true
                }
            } else {
                return {
                    status: false,
                    error: constant.requestMessages.ERR_QUERY
                }
            }
        } else {
            return {
                status: false,
                error: constant.requestMessages.ERR_QUERY
            }
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }
}

module.exports = {
    postUserModule: postUserModule,
    getAllUserInformationModule: getAllUserInformationModule,
    updateUsernameModule: updateUsernameModule
}
