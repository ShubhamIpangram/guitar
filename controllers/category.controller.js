const db = require("../index");
const categoryColl = db.collection("category");
const categoryTypeColl = db.collection("categoryType");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const { addCategoryValidation } = require('../helpers/validation');
const { ObjectId } = require('mongodb');



exports.categoryTypeList = async (req, res, next) => {

    try {
        const result = await query.find(categoryTypeColl, {})
        const obj = resPattern.successPattern(httpStatus.OK, { result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}

exports.addCategory = async (req, res, next) => {
    try {

        const { errors, isValid } = await addCategoryValidation(req.body);
        if (!isValid) {
            const message = Object.values(errors);
            return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
        }

        const Level = req.body.level;
        const levelid = Level.map((e) => {
            return ObjectId(e);
        })
        const category = req.body;
        category.hideCategory = false;
        category.categoryType = ObjectId(req.body.categoryType);
        category.level = levelid;
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

        const totalCount = await query.count(categoryColl, {})
        const result = await categoryColl.aggregate([
            {
                $match: {
                    title: {
                        $regex: ".*" + search + ".*",
                        $options: "i",
                    }
                }
            },
            {
                $lookup: {
                    from: 'categoryType',
                    localField: 'categoryType',
                    foreignField: '_id',
                    as: 'categoryType'
                }
            },
            { $skip: parseInt(Limit) * parseInt(pageNo) },
            { $limit: parseInt(Limit) },
            {
                $lookup: {
                    from: 'level',
                    localField: 'level',
                    foreignField: '_id',
                    as: 'level'
                }
            },
            { $project: { level: { hideLevel: 0, categoryId: 0, createdAt: 0 } } },
        ]).toArray();

        // const result = await query.findByPagination(categoryColl,
        //     {
        //         title: {
        //             $regex: ".*" + search + ".*",
        //             $options: "i",
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'categoryType',
        //             localField: 'categoryType',
        //             foreignField: '_id',
        //             as: 'Plan'
        //         }
        //     }, pageNo, Limit, { "createdAt": -1 })

        const obj = resPattern.successPattern(httpStatus.OK, { totalCount, result }, `success`);
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
        if (req.body.categoryType) {
            bodyData.categoryType = ObjectId(req.body.categoryType)
        }

        if (req.body.level) {
            const Level = req.body.level;
            const levelid = Level.map((e) => {
                return ObjectId(e);
            })
            bodyData.level = levelid;
        }
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
            await categoryColl.aggregate([
                {
                    $match: {
                        title: {
                            $regex: ".*" + search + ".*",
                            $options: "i",
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'categoryType',
                        localField: 'categoryType',
                        foreignField: '_id',
                        as: 'categoryType'
                    }
                },
                { $skip: parseInt(Limit) * parseInt(pageNo) },
                { $limit: parseInt(Limit) },
                {
                    $lookup: {
                        from: 'level',
                        localField: 'level',
                        foreignField: '_id',
                        as: 'level'
                    }
                },
                { $project: { level: { hideLevel: 0, categoryId: 0, createdAt: 0 } } },
            ]).toArray() : await categoryColl.aggregate([
                {
                    $match: {
                        categoryType: ObjectId(categoryFilter),
                        title: {
                            $regex: ".*" + search + ".*",
                            $options: "i",
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'categoryType',
                        localField: 'categoryType',
                        foreignField: '_id',
                        as: 'categoryType'
                    }
                },
                { $skip: parseInt(Limit) * parseInt(pageNo) },
                { $limit: parseInt(Limit) },
                {
                    $lookup: {
                        from: 'level',
                        localField: 'level',
                        foreignField: '_id',
                        as: 'level'
                    }
                },
                { $project: { level: { hideLevel: 0, categoryId: 0, createdAt: 0 } } },
            ]).toArray();
        const obj = resPattern.successPattern(httpStatus.OK, { result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}



exports.typeList = async (req, res, next) => {
    const id = ObjectId(req.params.id);
    try {
        //const result = await query.find(categoryColl, { categoryType: id })

        const result = await categoryColl.aggregate([
            {
                $match: {
                    categoryType: id
                }
            },
            { $project: { title: 1, createdAt: 1 } },
        ]).toArray();
        const obj = resPattern.successPattern(httpStatus.OK, { result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}