const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createBooking, getMyBookings, getBookingsForSlot, updateBookingMarks } = require('../controllers/bookingController');

router.post('/', protect, authorize('student'), createBooking);
router.get('/my-bookings', protect, authorize('student'), getMyBookings);
router.get('/slot/:slotId', protect, getBookingsForSlot);
router.put('/:id/marks', protect, authorize('faculty', 'admin'), updateBookingMarks);

module.exports = router;
