const router = require('express').Router();
const enrollmentCtrl = require('../controllers/enrollment.controller');

router.route('/add-enrollmentQuestion')
    .post(enrollmentCtrl.addEnrollmentQuestion);
router.route('/enrollmentQuestionList')
    .get(enrollmentCtrl.enrollmentQuestionList);
router.route('/deleteEnrollmentQuestion/:id').delete(enrollmentCtrl.deleteEnrollmentQuestion);
router.route('/enrollmentQuestionDetails/:id').get(enrollmentCtrl.detailEnrollmentQuestion);
router.route('/update-enrollmentQuestion/:id').put(enrollmentCtrl.updateEnrollmentQuestion);
router.route('/hide-enrollmentQuestion/:id').put(enrollmentCtrl.hideEnrollmentQuestion);

module.exports = router;