const router = require('express').Router();
const lessonCtrl = require('../controllers/lesson.controller');

router.route('/add-lession')
    .post(lessonCtrl.addLesson);
router.route('/lesson_list').get(lessonCtrl.lessonlist);
router.route('/deleteLesson/:id').delete(lessonCtrl.deleteLesson);
router.route('/lessonDetails/:id').get(lessonCtrl.detailLesson);
router.route('/update-lesson/:id').put(lessonCtrl.updateLesson);
router.route('/hide-lesson/:id').put(lessonCtrl.hideLesson);

module.exports = router;