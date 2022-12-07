const router = require('express').Router();
const fileCtrl = require('../controllers/file.controller');
const {upload} = require('../helpers/commonfile');

router.route('/convertfile')
    .post(upload.single("file"), fileCtrl.fileConvert);

router.route('/decodedsongs')
    .get(fileCtrl.getDecodedSongs)

router.route('/song/:id')
    .get(fileCtrl.getSongById)

router.route('/deletesong/:id')
    .delete(fileCtrl.deleteSong)

router.route('/updatesong/:id')
    .put(upload.single("file"), fileCtrl.updateSong)

module.exports = router;