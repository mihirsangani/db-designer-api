module.exports.notFound = {
    status: false,
    statusCode: 404,
    error: "Path Not Found"
}

module.exports.requestMessages = {
    ERR_INVALID_BODY: {
        code: 9001,
        message: "Invalid Params Passed."
    },
    ERR_REGISTRATION_PROCESS: {
        code: 9002,
        message: "This User is Already Registered"
    },
    ERR_EMAIL_ADDRESS: {
        code: 9003,
        message: "Invalid Email Address"
    },
    ERR_INVALID_PASSWORD: {
        code: 9004,
        message: "Invalid Password"
    },
    ERR_INVALID_ACCESS_TOKEN: {
        code: 9005,
        message: "Invalid Access Token or Token is Expired"
    },
    ERR_QUERY: {
        code: 9006,
        message: "Improper Query Syntax"
    },
    ERR_USER_NOT_EXISTS: {
        code: 9007,
        message: "User Does Not Exist"
    },
    ERR_NOT_VERIFIED: {
        code: 9008,
        message: "This User is Not Verified or Inactive"
    },
    ERR_INVALID_OTP: {
        code: 9009,
        message: "Invalid OTP"
    },
    ERR_GENERATE_OTP: {
        code: 9010,
        message: "Generate New OTP"
    },
    ERR_EXISTS_IN_ORGANIZATION: {
        code: 9011,
        message: "User Already Exist In Organization"
    },
    ERR_OWNER_ACCESS: {
        code: 9012,
        message: "Only Owner Can Make Changes in Organization"
    },
    ERR_ORGANIZATION_SELECTED: {
        code: 9013,
        message: "Please Select Organization To Make Changes"
    },
    ERR_INVALID_INVITATION_TOKEN: {
        code: 9014,
        message: "Invalid Invitation Token or Token is Expired"
    },
    ERR_INVALID_QUERY_PARAMETER: {
        code: 9015,
        message: "Invalid Query Params"
    },
    ERR_INVALID_ORGANIZATION: {
        code: 9016,
        message: "Invalid User or Organization"
    },
    ERR_INVALID_IPADDRESS: {
        code: 9017,
        message: "Invalid ip-address"
    },
    ERR_ORGANIZATION_NOT_EXISTS: {
        code: 9018,
        message: "Organization Does Not Exist"
    },
    ERR_GENERAL: {
        code: 9019,
        message: "Something Went Wrong"
    },
    ERR_PROJECT_EXISTS: {
        code: 9020,
        message: "Project Already Exist"
    },
    ERR_NOT_EXISTS_IN_ORGANIZATION: {
        code: 9021,
        message: "User Does Not Exist in Organization"
    },
    ERR_USER_HAS_ACCESS_TO_PROJECT: {
        code: 9022,
        message: "User Has Access To Project"
    },
    ERR_USER_HAS_NO_ACCESS_TO_PROJECT: {
        code: 9023,
        message: "User Has No Access To Project"
    },
    ERR_CHANGING_OWNER_ACCESS: {
        code: 9024,
        message: `Can't Change Owner Access`
    },
    ERR_PROJECT_NOT_EXISTS: {
        code: 9025,
        message: "Project Does Not Exist"
    },
    ERR_INACTIVE_ORGANIZATION: {
        code: 9026,
        message: "Organization is Not Active"
    },
    ERR_INVALID_PASSWORD_FORMAT: {
        code: 9027,
        message: "Password Must Be Minimum Eight Characters, At Least One Uppercase Letter, One Lowercase Letter, One Number And One Special Character"
    },
    ERR_PASSWORD_CONFIRM_PASSWORD_MATCH: {
        code: 9028,
        message: "Password and Confirm Password Does Not Match"
    },
    ERR_INVALID_PROJECT: {
        code: 9029,
        message: "User Does Not Have Any Access To This Project"
    },
    ERR_CREATING_ORGANIZATION: {
        code: 9030,
        message: "There was Error Creating Organization"
    },
    ERR_NOT_HAVE_EDIT_ACCESS: {
        code: 9031,
        message: "This User Does not Have Edit Access To This Project"
    },
    ERR_TABLE_NOT_EXIST: {
        code: 9032,
        message: "Table Does Not Exist"
    },
    ERR_TABLE_EXIST: {
        code: 9033,
        message: "Table Already Exist"
    },
    ERR_GROUP_EXIST: {
        code: 9035,
        message: "Group Already Exist"
    },
    ERR_GROUP_NOT_EXIST: {
        code: 9036,
        message: "Group Does Not Exist"
    },
    ERR_TABLE_EXIST_IN_GROUP: {
        code: 9037,
        message: "Table Already Exist In Group"
    },
    ERR_TABLE_DOES_NOT_EXIST_IN_GROUP: {
        code: 9038,
        message: "Table Does Not Exist In Group"
    },
    ERR_TABLE_GROUP_COLOR: {
        code: 9039,
        message: "Table Already Has Same Colour"
    },
    ERR_TABLE_FIELD_EXIST_IN_TABLE: {
        cose: 9040,
        message: "Table Field Already Exist"
    },
    ERR_TABLE_FIELD_NOT_EXIST_IN_TABLE: {
        code: 9041,
        message: "Table Field Does Not Exist"
    },
    ERR_NO_TABLE_FIELD: {
        code: 9042,
        message: "No Table Field Found"
    },
    ERR_NO_CHANGE: {
        code: 9043,
        message: "No Changes Found"
    },
    ERR_NAME: {
        code: 9044,
        message: "Already Have Same Name"
    }
}
