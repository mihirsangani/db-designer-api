const userDB = require("../user/user.db")
const organizationDB = require("./organization.db")
const constant = require("../../../helpers/constant")
const dotenv = require("dotenv").config()

const checkUserAndOrganizationInDb = async (userId, organizationId, flag) => {
    const checkUser = await userDB.getUserInformationByUserID(userId, flag)
    if (checkUser.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_USER_NOT_EXISTS
        }
    }

    const checkOrganization = await organizationDB.getOganizationInfoDB(organizationId, flag)
    if (checkOrganization.data.length == 0) {
        return {
            status: false,
            error: constant.requestMessages.ERR_ORGANIZATION_NOT_EXISTS
        }
    }

    return {
        status: true
    }
}

module.exports = {
    checkUserAndOrganizationInDb: checkUserAndOrganizationInDb
}
