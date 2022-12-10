const router = require('express').Router();
const userCtrl = require('../controllers/user.controller');

router.route('/add-User').post(userCtrl.addUser);
router.route('/user_list/:id').get(userCtrl.userlist);
router.route('/deleteUser/:id').delete(userCtrl.deleteUser);
router.route('/userDetails/:id').get(userCtrl.detailUser);
router.route('/update-userDetails/:id').put(userCtrl.updateUser);
router.route('/hide-User/:id').put(userCtrl.hideUser);
router.route('/filter-User').get(userCtrl.filterUser);


module.exports = router;