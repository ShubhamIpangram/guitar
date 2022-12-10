const db = require("../index");
const userColl = db.collection("user");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const { signInValidation } = require('../helpers/validation');
const { generatePassword, encrypt, generateOTP, sendEmail } = require("../helpers/commonfile");
const { ObjectID } = require('mongodb');


exports.addUser = async (req, res, next) => {
    try {
        const requestdata = {
            $or: [{ mobile_no: req.body.mobile_no }, { email: req.body.email }, { uniqueUserName: req.body.uniqueUserName }],
        };
        const userEmail = await query.findOne(userColl, requestdata);

        console.log(userEmail)
        if (userEmail) {
            const message = `user already registered with this mobile number or email or uniqueUserName`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        } else {
            const user = req.body;
            user.hideUser = false;
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

exports.userlist = async (req, res, next) => {
    try {
        const { pageNo, limit, searchText } = req.query;
        const Limit = parseInt(limit)

        let search = "";
        if (searchText) {
            search = searchText
        }

        let result = await query.findByPagination(userColl,
            {
                _id: { $ne: ObjectID(req.params.id) },
                name: {
                    $regex: ".*" + search + ".*",
                    $options: "i",
                }
            },
            {}, pageNo, Limit, { "createdAt": -1 })

        const obj = resPattern.successPattern(httpStatus.OK, { result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const id = ObjectID(req.params.id);
        const result1 = await query.findOne(userColl, { _id: id });
        if (result1) {
            const result = await query.deleteOne(userColl, { _id: id });
            const obj = resPattern.successPattern(httpStatus.OK, { message: "Delete level successfully...!" }, `success`);
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

exports.detailUser = async (req, res, next) => {
    try {
        const id = ObjectID(req.params.id);
        const result = await query.findOne(userColl, { _id: id });
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

exports.updateUser = async (req, res, next) => {
    try {
        const id = ObjectID(req.params.id);
        const bodyData = req.body;
        const result = await query.findOneAndUpdate(userColl,
            { _id: id },
            { $set: bodyData },
            { returnOriginal: false }
        );
        const obj = resPattern.successPattern(httpStatus.OK, result.value, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.hideUser = async (req, res, next) => {
    try {
        const id = ObjectID(req.params.id);
        const { hideUser } = req.body;
        const result = await query.findOneAndUpdate(userColl,
            { _id: id },
            { $set: { hideUser: hideUser } },
            { returnOriginal: false }
        );
        const obj = resPattern.successPattern(httpStatus.OK, result.value, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}


exports.filterUser = async (req, res, next) => {
    try {
        const { pageNo, limit, searchText, filter } = req.query;
        const Limit = parseInt(limit)
        let search = "";
        let userFilter = ""
        if (searchText) {
            search = searchText
        }
        if (filter) {
            userFilter = filter
        }
        const result = userFilter == "" ?
            await query.findByPagination(userColl,
                {
                    //  _id: { $ne: ObjectID(req.params.id) },
                    name: {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                    }
                },
                {}, pageNo, Limit, { "createdAt": -1 }) : await query.findByPagination(userColl,
                    {
                        roleType: userFilter,
                        // _id: { $ne: ObjectID(req.params.id) },
                        name: {
                            $regex: ".*" + search + ".*",
                            $options: "i",
                        }
                    },
                    {}, pageNo, Limit, { "createdAt": -1 })

        const obj = resPattern.successPattern(httpStatus.OK, { result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}