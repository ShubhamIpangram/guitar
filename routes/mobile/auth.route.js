const router = require('express').Router();
const authCtrl = require('../../controllers/mobile/auth.controller');
const { protect } = require('../../middleware/auth');

router.route('/signUp')
    .post(authCtrl.signUp);

router.route('/signIn')
    .post(authCtrl.signIn);

router.route('/forgot-password')
    .post(authCtrl.forgotPassword);

router.route('/reset-password')
    .post(authCtrl.resetPassword)

router.route('/change-password/:id')
    .put(authCtrl.changePassword);

router.route('/updateUserProfile/:id')
    .post(authCtrl.updateProfile);

router.route('/ProfileDetail/:id')
    .get(authCtrl.userProfileDetail);
module.exports = router;