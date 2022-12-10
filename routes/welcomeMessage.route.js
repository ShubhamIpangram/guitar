const router = require('express').Router();
const messageCtrl = require('../controllers/welcomeMessage.controller');

router.route('/add-welcomeMessage')
    .post(messageCtrl.addwelcomeMessage);
router.route('/welcomeMessageList')
    .get(messageCtrl.welcomeMessageList);
router.route('/deleteWelcomeMessage/:id').delete(messageCtrl.deleteWelcomeMessage);
router.route('/welcomeMessageDetails/:id').get(messageCtrl.welcomeMessageDetails);
router.route('/update-welcomeMessage/:id').put(messageCtrl.updateWelcomeMessage);
router.route('/hide-welcomeMessage/:id').put(messageCtrl.hideWelcomeMessage);

module.exports = router;