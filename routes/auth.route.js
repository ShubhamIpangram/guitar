const router = require('express').Router();
const authCtrl = require('../controllers/auth.controller');

router.route('/adminLogin')
    .post(authCtrl.adminlogin);

router.route('/adminRegister')
    .post(authCtrl.adminRegister);

router.route('/changepassword')
    .post(authCtrl.changePassword);

router.route('/forgotpassword')
    .post(authCtrl.forgotPassword)

router.route('/resetpassword')
    .post(authCtrl.resetPassword)

router.route('/adminUpdateprofile/:id')
    .post(authCtrl.updateProfile);



module.exports = router;