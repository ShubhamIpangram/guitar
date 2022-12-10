
let isEmpty = value =>
    value === undefined || value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);

let emailValidator = (params) => {
    let mailFormat = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (mailFormat.test(params) == false) {
        return false
    }
    return true
};

const signInValidation = (data) => {
    var errors = {}

    if (isEmpty(data.email)) {
        errors.email = 'email is required';
    } else {
        emailValidator(data.email) ? "" : errors.email = 'check email format';
    }
    isEmpty(data.password) ? errors.password = "password is required" : "";

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

const signUpValidation = (data) => {
    var errors = {}

    if (isEmpty(data.email)) {
        errors.email = 'email is required';
    } else {
        emailValidator(data.email) ? "" : errors.email = 'check email format';
    }
    isEmpty(data.mobile_no) ? errors.mobile_no = "mobile_no is required" : "";
    isEmpty(data.password) ? errors.password = "password is required" : "";

    return {
        errors,
        isValid: isEmpty(errors)
    }
}

const addCategoryValidation = (data) => {
    var errors = {}
    if (isEmpty(data.title)) {
        errors.title = 'title is required';
    }
    isEmpty(data.categoryType) ? errors.categoryType = "categoryType is required" : "";
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

const addlevelValidation = (data) => {
    var errors = {}
    isEmpty(data.categoryId) ? errors.categoryId = "categoryId is required" : "";
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

const addlessonValidation = (data) => {
    var errors = {}
    isEmpty(data.levelId) ? errors.levelId = "levelId is required" : "";
    return {
        errors,
        isValid: isEmpty(errors)
    }
}
const resetPasswordValidation = (data) => {
    var errors = {}

    if (isEmpty(data.otp)) {
        errors.otp = 'otp is required';
    } else {
        if (data.otp.length !== 6) {
            errors.otp = 'otp length 6 digit required';
        }
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

const emailValidation = (data) => {
    var error = {}

    if (isEmpty(data.email)) {
        error.email = 'email is required';
    } else {
        emailValidator(data.email) ? "" : error.email = 'check email format';
    }
    return {
        error,
        isValidMsg: isEmpty(error)
    }
}

const addDailyTips = (data) => {
    var errors = {}
    if (isEmpty(data.title)) {
        errors.title = 'title is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

const addEnrollmentQuestion = (data) => {
    var errors = {}
    if (isEmpty(data.title)) {
        errors.title = 'title is required';
    }
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = {
    signInValidation,
    addCategoryValidation,
    addlevelValidation,
    addlessonValidation,
    signUpValidation,
    resetPasswordValidation,
    emailValidation,
    addDailyTips,
    addEnrollmentQuestion
}