const db = require("../index");
const lessonColl = db.collection("lesson");
const lessonTypeColl = db.collection("lessonType");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const { ObjectId } = require('mongodb');
const { addlessonValidation } = require('../helpers/validation');






exports.lessonTypeList = async (req, res, next) => {
    try {
        const result = await query.find(lessonTypeColl, {})
        const obj = resPattern.successPattern(httpStatus.OK, { result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}

exports.addLesson = async (req, res, next) => {
    try {
        const { errors, isValid } = await addlessonValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        const lesson = req.body;
        lesson.hideLesson = false;
        lesson.levelId = ObjectId(req.body.levelId)
        const insertdata = await query.insert(lessonColl, lesson);
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
    } catch (e) {
        console.log("e..", e);
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
};

exports.lessonlist = async (req, res, next) => {
    try {
        const { pageNo, limit, searchText } = req.query;
        const Limit = parseInt(limit)

        let search = "";
        if (searchText) {
            search = searchText
        }

        const result = await query.findByPagination(lessonColl,
            {
                lessonType: {
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

exports.deleteLesson = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result1 = await query.findOne(lessonColl, { _id: id });
        if (result1) {
            const result = await query.deleteOne(lessonColl, { _id: id });
            const obj = resPattern.successPattern(httpStatus.OK, { message: "Delete level successfully...!" }, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `level not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.detailLesson = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result = await query.findOne(lessonColl, { _id: id });
        if (result) {
            const obj = resPattern.successPattern(httpStatus.OK, result, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `level not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.updateLesson = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const bodyData = req.body;
        const result = await query.findOneAndUpdate(lessonColl,
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


exports.hideLesson = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const { hideLesson } = req.body;
        const result = await query.findOneAndUpdate(lessonColl,
            { _id: id },
            { $set: { hideLesson: hideLesson } },
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