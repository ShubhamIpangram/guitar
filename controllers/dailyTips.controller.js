const db = require("../index");
const dailyTipColl = db.collection("dailyTips");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const { addDailyTips } = require('../helpers/validation');
const { ObjectId } = require('mongodb');


exports.addDailyTips = async (req, res, next) => {
    try {
        const { errors, isValid } = await addDailyTips(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        const category = req.body;
        category.hidedailyTips = false;
        const insertdata = await query.insert(dailyTipColl, category);
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


exports.dailyTipslist = async (req, res, next) => {

    try {
        const { pageNo, limit, searchText } = req.query;
        const Limit = parseInt(limit)

        let search = "";
        if (searchText) {
            search = searchText
        }

        const result = await query.findByPagination(dailyTipColl,
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

exports.deletedailyTips = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result1 = await query.findOne(dailyTipColl, { _id: id });
        if (result1) {
            const result = await query.deleteOne(dailyTipColl, { _id: id });
            const obj = resPattern.successPattern(httpStatus.OK, { message: "Delete dailyTips successfully...!" }, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `dailyTips not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.detaildailyTips = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result = await query.findOne(dailyTipColl, { _id: id });
        if (result) {
            const obj = resPattern.successPattern(httpStatus.OK, result, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `dailyTips not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.updatedailyTips = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const bodyData = req.body;
        const result = await query.findOneAndUpdate(dailyTipColl,
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

exports.hidedailyTips = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const { hidedailyTips } = req.body;
        const result = await query.findOneAndUpdate(dailyTipColl,
            { _id: id },
            { $set: { hidedailyTips: hidedailyTips } },
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
