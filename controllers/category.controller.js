const db = require("../index");
const categoryColl = db.collection("category");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const { addCategoryValidation } = require('../helpers/validation');
const { ObjectId } = require('mongodb');


exports.addCategory = async (req, res, next) => {
    try {
        const { errors, isValid } = await addCategoryValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
        // const requestdata = {
        //     categoryType: req.body.categoryType
        // };

        // const catType = await query.findOne(categoryColl, requestdata);
        // if (catType) {
        //     const message = `You have already exists with this categoryType`;
        //     return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        // } else {
        const category = req.body;
        category.hideCategory = false;
        const insertdata = await query.insert(categoryColl, category);
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


exports.categorylist = async (req, res, next) => {

    try {
        const { pageNo, limit, searchText } = req.query;
        const Limit = parseInt(limit)

        let search = "";
        if (searchText) {
            search = searchText
        }

        const result = await query.findByPagination(categoryColl,
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

exports.deleteCategory = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result1 = await query.findOne(categoryColl, { _id: id });
        if (result1) {
            const result = await query.deleteOne(categoryColl, { _id: id });
            const obj = resPattern.successPattern(httpStatus.OK, { message: "Delete category successfully...!" }, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `category not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.detailCategory = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const result = await query.findOne(categoryColl, { _id: id });
        if (result) {
            const obj = resPattern.successPattern(httpStatus.OK, result, `success`);
            return res.status(obj.code).json({
                ...obj,
            });
        } else {
            const message = `category not found with this ID.`;
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }
    } catch (e) {
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
    }
}

exports.updateCategory = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const bodyData = req.body;
        const result = await query.findOneAndUpdate(categoryColl,
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

exports.hideCategory = async (req, res, next) => {
    try {
        const id = ObjectId(req.params.id);
        const { hideCategory } = req.body;
        const result = await query.findOneAndUpdate(categoryColl,
            { _id: id },
            { $set: { hideCategory: hideCategory } },
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

exports.filterCategory = async (req, res, next) => {
    try {
        const { pageNo, limit, searchText, filter } = req.query;
        const Limit = parseInt(limit)

        let search = "";
        let categoryFilter = ""

        if (searchText) {
            search = searchText
        }

        if (filter) {
            categoryFilter = filter
        }

        const result = categoryFilter == "" ?
            await query.findByPagination(categoryColl,
                {
                    title: {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                    }
                },
                {}, pageNo, Limit, { "createdAt": -1 }) : await query.findByPagination(categoryColl,
                    {
                        categoryType: categoryFilter,
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