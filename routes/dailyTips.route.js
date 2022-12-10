const router = require('express').Router();
const dailyTipsCtrl = require('../controllers/dailyTips.controller');

router.route('/add-dailyTips')
    .post(dailyTipsCtrl.addDailyTips);
router.route('/dailyTipsList')
    .get(dailyTipsCtrl.dailyTipslist);
router.route('/deletedailyTips/:id').delete(dailyTipsCtrl.deletedailyTips);
router.route('/dailyTipsDetails/:id').get(dailyTipsCtrl.detaildailyTips);
router.route('/update-dailyTips/:id').put(dailyTipsCtrl.updatedailyTips)
router.route('/hide-dailyTips/:id').put(dailyTipsCtrl.hidedailyTips)

module.exports = router;