const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createSlot, getSlots, getMySlots, getSlotById, deleteSlot } = require('../controllers/slotController');

router.route('/')
    .get(protect, getSlots)
    .post(protect, authorize('faculty', 'admin'), createSlot);

router.get('/my-slots', protect, authorize('faculty', 'admin'), getMySlots);

router.route('/:id')
    .get(protect, getSlotById)
    .delete(protect, authorize('faculty', 'admin'), deleteSlot);

module.exports = router;
