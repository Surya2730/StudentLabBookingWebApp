const express = require('express');
const router = express.Router();
const { getTimetable, updateTimetable } = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTimetable);
router.post('/', protect, updateTimetable);

module.exports = router;
