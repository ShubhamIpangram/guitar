const router = require('express').Router();
const lessonCtrl = require('../controllers/lesson.controller');
const { upload } = require('../helpers/commonfile');

router.route('/lessonType_list')
    .get(lessonCtrl.lessonTypeList);
router.route('/add-lession')
    .post(upload.fields([
        { name: "music", maxCount: 2 },
        { name: "uploadVideo", maxCount: 2 },
        { name: "uploadMusic", maxCount: 2 },
        { name: "uploadImage", maxCount: 2 },
        { name: "uploadQuestion", maxCount: 2 },
        { name: "answerImage1", maxCount: 2 },
        { name: "answerImage2", maxCount: 2 },
        { name: "answerImage3", maxCount: 2 },
        { name: "answerImage4", maxCount: 2 },
        { name: "answerImage5", maxCount: 2 },
        { name: "answerImage6", maxCount: 2 },
    ]), lessonCtrl.addLesson);
router.route('/lesson_list').get(lessonCtrl.lessonlist);
router.route('/deleteLesson/:id').delete(lessonCtrl.deleteLesson);
router.route('/lessonDetails/:id').get(lessonCtrl.detailLesson);
router.route('/update-lesson/:id').put(lessonCtrl.updateLesson);
router.route('/hide-lesson/:id').put(lessonCtrl.hideLesson);
router.route('/lesson-filter').get(lessonCtrl.lessonFilter);

module.exports = router;