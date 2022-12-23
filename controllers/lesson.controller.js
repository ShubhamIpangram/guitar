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

        const id = ObjectId(req.body.lessonType)
        const LessonType = await query.findOne(lessonTypeColl, { _id: id });
        console.log(LessonType)
        if (LessonType.type === "Play with GuitarAlone") {
            const lesson = req.body;
            lesson.hideLesson = false;
            lesson.levelId = ObjectId(req.body.levelId)
            lesson.lessonType = ObjectId(req.body.lessonType)
            if (req.files) {
                console.log(req.files)
                lesson.music = "uploads/" + req.files.music[0].filename
            }
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
        }


        if (LessonType.type === "Theory - Learning") {
            const lesson = req.body;
            lesson.hideLesson = false;
            lesson.levelId = ObjectId(req.body.levelId)
            lesson.lessonType = ObjectId(req.body.lessonType)
            if (req.files) {
                console.log(req.files)
                lesson.uploadMusic = "uploads/" + req.files.uploadMusic[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.uploadVideo = "uploads/" + req.files.uploadVideo[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.uploadImage = "uploads/" + req.files.uploadImage[0].filename
            }

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
        }

        if (LessonType.type === "General MCQ") {
            const lesson = req.body;
            lesson.hideLesson = false;
            lesson.levelId = ObjectId(req.body.levelId)
            lesson.lessonType = ObjectId(req.body.lessonType)

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
        }


        if (LessonType.type === "General - Music Composition") {
            const lesson = req.body;
            lesson.hideLesson = false;
            lesson.levelId = ObjectId(req.body.levelId)
            lesson.lessonType = ObjectId(req.body.lessonType)


            if (req.files) {
                console.log(req.files)
                lesson.uploadQuestion = "uploads/" + req.files.uploadQuestion[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.answerImage1 = "uploads/" + req.files.answerImage1[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.answerImage2 = "uploads/" + req.files.answerImage2[0].filename
            }


            if (req.files) {
                console.log(req.files)
                lesson.answerImage3 = "uploads/" + req.files.answerImage3[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.answerImage4 = "uploads/" + req.files.answerImage4[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.answerImage5 = "uploads/" + req.files.answerImage5[0].filename
            }

            if (req.files) {
                console.log(req.files)
                lesson.answerImage6 = "uploads/" + req.files.answerImage6[0].filename
            }

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
        const totalCount = await query.count(lessonColl, {})
        const result = await lessonColl.aggregate([

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
                    from: 'lessonType',
                    localField: 'lessonType',
                    foreignField: '_id',
                    as: 'lessonType'
                }
            },
            { $skip: parseInt(Limit) * parseInt(pageNo) },
            { $limit: parseInt(Limit) },
            {
                $lookup: {
                    from: 'level',
                    localField: 'levelId',
                    foreignField: '_id',
                    as: 'levelId'
                }
            },
            { $project: { levelId: { hideLevel: 0, categoryType: 0, createdAt: 0 } } },
        ]).toArray();
        const obj = resPattern.successPattern(httpStatus.OK, { totalCount, result }, `success`);
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
        const result = await lessonColl.aggregate([
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: 'lessonType',
                    localField: 'lessonType',
                    foreignField: '_id',
                    as: 'lessonType'
                }
            },
            {
                $lookup: {
                    from: 'level',
                    localField: 'levelId',
                    foreignField: '_id',
                    as: 'levelId'
                }
            },
            { $project: { levelId: { hideLevel: 0, categoryType: 0, createdAt: 0 } } },
        ]).toArray();
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
        if (req.body.levelId) {
            bodyData.levelId = ObjectId(req.body.levelId)
        }
        if (req.body.lessonType) {
            bodyData.lessonType = ObjectId(req.body.lessonType)
        }
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


exports.lessonFilter = async (req, res, next) => {
    try {
        const { pageNo, limit, searchText, filter } = req.query;
        const Limit = parseInt(limit)

        let search = "";
        let lessonFilter = ""

        if (searchText) {
            search = searchText
        }

        if (filter) {
            lessonFilter = filter
        }
        const totalCount = await query.count(lessonColl, {})
        const result = lessonFilter == "" ?
            await lessonColl.aggregate([

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
                        from: 'lessonType',
                        localField: 'lessonType',
                        foreignField: '_id',
                        as: 'lessonType'
                    }
                },
                { $skip: parseInt(Limit) * parseInt(pageNo) },
                { $limit: parseInt(Limit) },
                {
                    $lookup: {
                        from: 'level',
                        localField: 'levelId',
                        foreignField: '_id',
                        as: 'levelId'
                    }
                },
                { $project: { levelId: { hideLevel: 0, categoryType: 0, createdAt: 0 } } },
            ]).toArray() : await lessonColl.aggregate([

                {
                    $match: {
                        lessonType: ObjectId(lessonFilter),
                        title: {
                            $regex: ".*" + search + ".*",
                            $options: "i",
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'lessonType',
                        localField: 'lessonType',
                        foreignField: '_id',
                        as: 'lessonType'
                    }
                },
                { $skip: parseInt(Limit) * parseInt(pageNo) },
                { $limit: parseInt(Limit) },
                {
                    $lookup: {
                        from: 'level',
                        localField: 'levelId',
                        foreignField: '_id',
                        as: 'levelId'
                    }
                },
                { $project: { levelId: { hideLevel: 0, categoryType: 0, createdAt: 0 } } },
            ]).toArray();

        const obj = resPattern.successPattern(httpStatus.OK, {totalCount, result }, `success`);
        return res.status(obj.code).json({
            ...obj,
        });
    } catch (e) {
        console.log('error---', e)
        return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true))
    }
}