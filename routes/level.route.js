const router = require('express').Router();
const levelCtrl = require('../controllers/level.controller');

router.route('/add-level')
    .post(levelCtrl.addLevel);
router.route('/level_list').get(levelCtrl.levellist);
router.route('/deleteLevel/:id').delete(levelCtrl.deleteLevel);
router.route('/levelDetails/:id').get(levelCtrl.detailLevel);
router.route('/update-level/:id').put(levelCtrl.updateLevel);
router.route('/hide-level/:id').put(levelCtrl.hideLevel)

module.exports = router;