const crud = require("./crud")
const LibFunction = require("../helpers/libFunction")

const checkAccessToken = async (req, res, next) => {
    var authTokenHeader = req.cookies["db-ssid"] || req.headers["Authorization"] || req.headers["authorization"]
    if (authTokenHeader) authTokenHeader = authTokenHeader.replace("Bearer ", "")
    var accessToken = authTokenHeader

    if (accessToken === undefined) {
        return res.status(401).send({
            status: false,
            error: {
                code: -999,
                message: "Error invalid authentication found."
            }
        })
    }
    var date = new Date()
    let currentTimeStamp = await LibFunction.formateDateLib(date)
    const sql = `SELECT user_id FROM user_access_token WHERE user_access_token = '${accessToken}' AND user_access_token_expire_at >= '${currentTimeStamp}' AND user_access_token_flag_deleted = false`

    const getUserIdByATokenDB = await crud.executeQuery(sql)
    console.log("Printing the output of getUserIdByATokenDB : ")
    console.log(getUserIdByATokenDB)

    if (getUserIdByATokenDB.data.length < 1) {
        return res.status(401).send({
            status: false,
            error: {
                code: -999,
                message: "Error invalid authentication found."
            }
        })
    }
    req.user_data = getUserIdByATokenDB.data[0]
    req.access_token = accessToken
    next()
}

module.exports = {
    checkAccessToken: checkAccessToken
}
