//console.log('auth.module');
const express = require("express")
const router = express.Router()
const userDb = require("../user/user.db")
const authDb = require("./auth.db")
const LibFunction = require("../../../helpers/libfunction")
const constant = require("../../../helpers/constant")
const bcrypt = require("bcrypt")
const saltRounds = 10

const checkLoginModule = async (req) => {
    const email = req.body.email
    const password = req.body.password
    const rememberMeFlag = req.body.remember_me_flag

    if (!email || !password) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const flagFalse = false
    var date = new Date()

    const checkuser = await authDb.getUserDataByEmailaddressDb(email, flagFalse)

    if (checkuser.data.length > 0) {
        const userPassword = checkuser.data[0].user_data_password
        const passwordMatch = await bcrypt.compare(password, userPassword)
        const statusId = checkuser.data[0].status_id

        if (passwordMatch) {
            const getActiveStatusId = await LibFunction.getStatusIdFromStatusName("Active")
            const activeStatusId = getActiveStatusId.data[0].status_id

            if (statusId == activeStatusId) {
                const userId = checkuser.data[0].user_id
                const firstName = checkuser.data[0].user_first_name
                const userEmail = checkuser.data[0].user_data_emailaddress
                const userStatus = checkuser.data[0].status_name

                const accessToken = (await LibFunction.getRandomString(64)) + new Date().getTime()

                const currentTime = await LibFunction.formateDateLib(date)
                const expireTime = await LibFunction.formateDateLib(await LibFunction.getExpireTimeStamp(rememberMeFlag))

                const addAccessTokenData = await authDb.addAccessTokenData(userId, accessToken, currentTime, expireTime, flagFalse)

                if (addAccessTokenData.data.length > 0) {
                    var result = []
                    const data = {
                        "access_token": accessToken,
                        "user": {
                            "user_id": userId,
                            "username": firstName,
                            "email_address": userEmail,
                            "status": {
                                "id": statusId,
                                "name": userStatus
                            }
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
                error: constant.requestMessages.ERR_INVALID_PASSWORD
            }
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_EMAIL_ADDRESS
        }
    }
}

const verifyEmailModule = async (req) => {
    const userId = req.body.user_id
    const enteredOtp = req.body.verify_token
    const flagFalse = false

    if (!userId || !enteredOtp) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const getUserOtpByuserid = await userDb.getUserInformationByUserID(userId, flagFalse)
    if (getUserOtpByuserid.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }

    const otp = getUserOtpByuserid.data[0].user_data_verification_otp
    const email = getUserOtpByuserid.data[0].user_data_emailaddress

    if (enteredOtp != otp) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_OTP
        }
    }

    const getActiveStatusId = await LibFunction.getStatusIdFromStatusName("Active")
    const activeStatusId = getActiveStatusId.data[0].status_id

    const setStatusActive = await authDb.statusActiveDB(email, activeStatusId, flagFalse)
    if (setStatusActive.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    return {
        status: true
    }
}

const passwordResetModule = async (req) => {
    const email = req.body.email
    const flagFalse = false

    if (!email) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_BODY
        }
    }

    const checkuser = await userDb.getUserdata(email, flagFalse)
    if (checkuser.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_EMAIL_ADDRESS
        }
    }

    const otp = LibFunction.generateOTP()
    const addOtpInUserDataDB = await authDb.addOtpInUserDataDB(email, otp, flagFalse)
    if (addOtpInUserDataDB.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    var toEmail = email
    var subjectEmail = "Verification Email"
    var outputEmail = `<h3>OTP for Verification is ${otp}</h3><h1>${otp}</h1>`

    const sendOtp = await LibFunction.sendMailtoUser(toEmail, subjectEmail, outputEmail)

    return {
        status: true
    }
}

const passwordUpdateModule = async (req) => {
    const ipAddress = req.ip

    const email = req.body.email
    const userOtp = req.body.verify_token
    const password = req.body.new_password
    const confirmPassword = req.body.confirm_new_password

    const flagTrue = true
    const flagFalse = false

    if (!email || !userOtp || !password || !confirmPassword) {
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

    const getUserInfo = await userDb.getUserdata(email, flagFalse)
    if (getUserInfo.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_EMAIL_ADDRESS
        }
    }

    const passwordRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!%*#?&]{8,}$/
    if (!passwordRegexp.test(password)) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_PASSWORD_FORMAT
        }
    }

    const otp = getUserInfo.data[0].user_data_verification_otp
    if (userOtp != otp) {
        return {
            status: false,
            error: constant.requestMessages.ERR_INVALID_OTP
        }
    }

    const userId = getUserInfo.data[0].user_id
    const userName = getUserInfo.data[0].user_first_name
    const statusId = getUserInfo.data[0].user_status_id
    const hash = bcrypt.hashSync(password, saltRounds)

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const createchangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createchangeLogId.data[0].change_log_id

    const updateUserDataFlag = await authDb.updateUserDataFlagDb(email, changeLogId, flagTrue, flagFalse)
    if (updateUserDataFlag.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    const updatePassword = await userDb.addUserdataDb(changeLogId, userId, userName, email, hash, statusId, flagFalse)
    if (updatePassword.data.length > 0) {
        return {
            status: true
        }
    } else {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }
}

const logoutModule = async (req) => {
    const ipAddress = req.ip
    const userId = req.user_data.user_id
    const accessToken = req.access_token

    const obj = {
        ipAddress: ipAddress,
        userId: userId
    }

    const date = new Date()
    const flagFalse = false
    const flagTrue = true

    const checkUser = await userDb.getUserInformationByUserID(userId, flagFalse)
    if (checkUser.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }

    const currentTimeStamp = await LibFunction.formateDateLib(date)

    const createchangeLogId = await LibFunction.addChangeLogDetailsLib(obj)
    const changeLogId = createchangeLogId.data[0].change_log_id

    const updateAccessTokenFlag = await authDb.updateAccessTokenFlagDb(accessToken, currentTimeStamp, changeLogId, flagFalse, flagTrue)
    if (updateAccessTokenFlag.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_QUERY
        }
    }

    return {
        status: true
    }
}

module.exports = {
    checkLoginModule: checkLoginModule,
    verifyEmailModule: verifyEmailModule,
    passwordResetModule: passwordResetModule,
    passwordUpdateModule: passwordUpdateModule,
    logoutModule: logoutModule
}
