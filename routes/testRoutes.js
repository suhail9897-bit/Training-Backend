const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const testController = require('../controllers/testController');
const verifyToken = require('../middleware/auth');

// ✅ Multer setup for test uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(__dirname, '../uploads/tests'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/admin/upload-test
router.post('/upload-test', verifyToken, upload.single('file'), testController.uploadTest);

// GET /api/admin/tests
router.get('/tests', verifyToken, testController.getAllTests);

//test delete route
router.delete('/test/:id', verifyToken, testController.deleteTest);

//excel preview route
router.get('/test/:id/preview', verifyToken, testController.previewTest);

//Excel download route
router.get('/test/:id/download', verifyToken, testController.downloadTestFile);



module.exports = router;
