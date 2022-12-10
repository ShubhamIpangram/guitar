const db = require("../index");
const enrollmentColl = db.collection("enrollment");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const { addEnrollmentQuestion } = require('../helpers/validation');
const { ObjectId } = require('mongodb');


exports.addEnrollmentQuestion = async (req, res, next) => {
    try {
        const { errors, isValid } = await addEnrollmentQuestion(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        const category = req.body;
        category.hideEnrollmentQuestion = false;
        const insertdata = await query.insert(enrollmentColl, category);
        console.log(insertdata)
        if (insertdata.ops.length > 0) {
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
        //}

    } catch (e) {
        console.log("e..", e);
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};


exports.enrollmentQuestionList = async (req, res, next) => {

    try {
        const { pageNo, limit, searchText } = req.query;
        const Limit = parseInt(limit)
        
        let search = "";
        if (searchText) {
            search = searchText
        }
        const result = await query.findByPagination(enrollmentColl,
            {
                title: {
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

exports.deleteEnrollmentQuestion = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result1 = await query.findOne(enrollmentColl, { _id: id });
        if (result1) {
            const result = await query.deleteOne(enrollmentColl, { _id: id });
            const obj = resPattern.successPattern(httpStatus.OK, { message: "Delete EnrollmentQuestion successfully...!" }, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `EnrollmentQuestion not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.detailEnrollmentQuestion = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result = await query.findOne(enrollmentColl, { _id: id });
        if (result) {
            const obj = resPattern.successPattern(httpStatus.OK, result, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `EnrollmentQuestion not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.updateEnrollmentQuestion = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const bodyData = req.body;
        const result = await query.findOneAndUpdate(enrollmentColl,
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

exports.hideEnrollmentQuestion = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const { hideEnrollmentQuestion } = req.body;
        const result = await query.findOneAndUpdate(enrollmentColl,
            { _id: id },
            { $set: { hideEnrollmentQuestion: hideEnrollmentQuestion } },
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
