const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { generateOTP, submitOTP, updateMarks } = require('../controllers/attendanceController');

router.post('/generate-otp', protect, authorize('faculty'), generateOTP);
router.post('/submit-otp', protect, authorize('student'), submitOTP);
router.post('/marks', protect, authorize('faculty'), updateMarks);

module.exports = router;
