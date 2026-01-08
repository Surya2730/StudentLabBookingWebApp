const express = require('express');
const router = express.Router();
const { getMyProfile, getLeaderboard, updatePoints, searchStudents } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMyProfile);
router.get('/leaderboard', getLeaderboard); // Public or Protected? Let's make it public/semi-public
router.put('/update-points', protect, updatePoints); // Should check for faculty role inside controller or generic protect
router.get('/search', protect, searchStudents);

module.exports = router;
