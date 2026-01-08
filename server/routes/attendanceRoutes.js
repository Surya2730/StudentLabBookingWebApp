const express = require('express');
const router = express.Router();
const { generateOTP, markAttendance, getAttendanceStats, getActiveOTP } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware'); // Assuming this exists

router.post('/generate-otp', protect, generateOTP);
router.get('/active-otp', protect, getActiveOTP);
router.post('/mark', protect, markAttendance);
router.get('/stats', protect, getAttendanceStats);

module.exports = router;
