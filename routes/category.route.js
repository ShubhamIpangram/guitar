const router = require('express').Router();
const categoryCtrl = require('../controllers/category.controller');

router.route('/add-category')
    .post(categoryCtrl.addCategory);
router.route('/category_list')
    .get(categoryCtrl.categorylist);
router.route('/deleteCategory/:id').delete(categoryCtrl.deleteCategory);
router.route('/categoryDetails/:id').get(categoryCtrl.detailCategory);
router.route('/update-category/:id').put(categoryCtrl.updateCategory)
router.route('/hide-category/:id').put(categoryCtrl.hideCategory)
router.route('/filter-Category').get(categoryCtrl.filterCategory);

module.exports = router;