const db = require("../../index");
const userColl = db.collection("user");
const APIError = require("../../helpers/APIError");
const resPattern = require("../../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../../query/query");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const { signUpValidation, signInValidation, emailValidation, resetPasswordValidation } = require('../../helpers/validation');
const { generatePassword, encrypt, generateOTP, sendEmail } = require("../../helpers/commonfile");
const { ObjectID } = require('mongodb');

const privateKey = fs.readFileSync('/etc/private.key',
    { encoding: 'utf8', flag: 'r' });


exports.signUp = async (req, res, next) => {
    try {
        const { errors, isValid } = await signUpValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        const requestdata = {
            $or: [{ mobile_no: req.body.mobile_no }, { email: req.body.email }],
        };
        const userEmail = await query.findOne(userColl, requestdata);
        if (userEmail) {
            const message = `You have already registered with this mobile number or email`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        } else {
            const user = req.body;
            user.otp = "";
            user.expireTime = "";
            user.password = generatePassword(req.body.password);
            const insertdata = await query.insert(userColl, user);
            if (insertdata.ops.length > 0) {
                delete insertdata.ops[0]["password"];
                const obj = resPattern.successPattern(
                    httpStatus.OK,
                    insertdata.ops[0],
                    `success`
                );
                return res.status(obj.code).json({
                    ...obj,
                });

            } else {
                const message = `Something went wrong, Please try again.`;
                return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
            }
        }
    } catch (e) {
        console.log("e..", e);
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};

exports.signIn = async (req, res, next) => {
    try {
        const { errors, isValid } = await signInValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        const { password } = req.body;
        const reqData = { email: req.body.email };

        let user = await query.findOne(userColl, reqData);
        if (!user || user.password == null) {
            const message = `Incorrect email or password.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = encrypt(jwt.sign(
                { _id: user._id, mobile_no: user.mobile_no },
                //privateKey, { algorithm: 'RS256' }
                process.env.JWT_SECRET
            ));
            delete user["password"];
            let obj = resPattern.successPattern(
                httpStatus.OK,
                { user, token },
                "success"
            );
            return res.status(obj.code).json(obj);
        } else {
            const message = `Incorrect email or password.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));

    }
};


//forgotPassword to send otp on email
exports.forgotPassword = async (req, res, next) => {
    try {
        const { error, isValidMsg } = await emailValidation(req.body);

        if (!isValidMsg) {
            const message = Object.values(error);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        const requestdata = { email: req.body.email };
        //find user
        const userData = await query.findOne(userColl, requestdata);
        if (!userData) {
            const message = `You have not registered with this email`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        if (userData) {
            const otp = generateOTP();
            console.log(otp);
            await query.findOneAndUpdate(userColl, requestdata, {
                $set: {
                    otp: otp,
                    expireTime: moment().add(10, "minutes").format("YYYY-MM-DDThh:mm:ss"),
                },
            });

            let body = {
                "email": req.body.email,
                "subject": "OTP For Forgot Password",
                "otp": otp,
                "info": "Your Otp is"
            }

            await sendEmail(body);
            //send response
            const message = `Email sent successfully.`;
            const obj = resPattern.successMessge(httpStatus.OK, message);
            return res.json({
                ...obj,
            });
        } else {
            const message = `User not found with email: '${userData.email}.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { error, isValidMsg } = await emailValidation(req.body);

        if (!isValidMsg) {
            const message = Object.values(error);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        const { errors, isValid } = await resetPasswordValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        const requestdata = { email: req.body.email };

        const userData = await query.findOne(userColl, requestdata);

        if (!userData) {
            const message = `Please Enter valid Email.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        if (moment().format("YYYY-MM-DDThh:mm:ss") < userData.expireTime) {
            if (req.body.otp == userData.otp) {
                const newPassword = generatePassword(req.body.newPassword);
                await query.findOneAndUpdate(userColl, requestdata, {
                    $set: { password: newPassword },
                });
                const message = `Password Reset Successfully.`;
                const obj = resPattern.successMessge(httpStatus.OK, message);
                return res.json({
                    ...obj,
                });
            } else {
                const message = `Verification code doesn't match.`;
                return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
            }
        } else {
            const message = `Verification code expired.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};

exports.verifyotp = async (req, res, next) => {
    try {
        const { error, isValidMsg } = await emailValidation(req.body);

        if (!isValidMsg) {
            const message = Object.values(error);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        const { errors, isValid } = await resetPasswordValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        const requestdata = { email: req.body.email };
        const user = await query.findOne(userColl, requestdata);

        if (user) {
            if (moment().format("YYYY-MM-DDThh:mm:ss") < user.expireTime) {
                if (user.otp == req.body.otp) {
                    const token = encrypt(jwt.sign(
                        { _id: user._id, email: user.email },
                        process.env.JWT_SECRET
                    ));
                    let obj = resPattern.successPattern(httpStatus.OK,
                        {
                            user,
                            token,
                            message: `Verification code verified sucessfully.`,
                            new: false,
                        },
                        "success"
                    );
                    return res.status(obj.code).json(obj);
                } else {
                    const message1 = `Verification code doesn't match.`;
                    return next(new APIError(`${message1}`, httpStatus.BAD_REQUEST, true));
                }
            } else {
                const message2 = `Verification code expired.`;
                return next(new APIError(`${message2}`, httpStatus.BAD_REQUEST, true));
            }
        } else {
            const message = `You have not registered with this email`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        console.log(e);
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        let oldpass = req.body.oldpassword;
        let newpass = req.body.newpassword;
        let user = await query.findOne(userColl, { _id: ObjectID(req.params.id) });
        console.log(user)
        const isMatch = await bcrypt.compare(oldpass, user.password);

        if (isMatch) {
            var encyNewPass = generatePassword(newpass);
            const userdata = await query.findOneAndUpdate(
                userColl,
                { _id: ObjectID(req.params.id) },
                { $set: { password: encyNewPass } },
                { returnOriginal: false }
            );
            let obj = resPattern.successPattern(httpStatus.OK, userdata.value, "success");
            return res.status(obj.code).json(obj);
        } else {
            const message = "Old Password Not Match !!! ";
            return next(new APIError(`${message}`, httpStatus.UNAUTHORIZED, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};


exports.updateProfile = async (req, res, next) => {
    try {
        let userId = ObjectID(req.params.id);
        let userData = req.body;

        if (req.body.name) {
            userData['name'] = req.body.name;
        }

        if (req.body.mobile_no) {
            userData['mobile_no'] = req.body.mobile_no;
        }

        if (req.body.email) {
            userData['email'] = req.body.email;
        }

        if (req.body.roleType) {
            userData['roleType'] = req.body.roleType;
        }
        if (req.body.description) {
            userData['description'] = req.body.description;
        }

        const userUpdate = await query.findOneAndUpdate(
            userColl,
            { _id: userId },
            { $set: userData },
            { returnOriginal: false }
        );
        let user = userUpdate.value;
        const obj = resPattern.successPattern(httpStatus.OK, { user }, `success`);
        return res.status(obj.code).json(obj);
        /// }

    } catch (e) {
        console.log("e..", e);
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}


exports.userProfileDetail = async (req, res, next) => {
    try {
        const id = ObjectID(req.params.id);
        let result = await query.findOne(userColl, { _id: id });
        if (result) {
            const obj = resPattern.successPattern(httpStatus.OK, result, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `user not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}