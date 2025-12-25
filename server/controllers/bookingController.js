const Booking = require('../models/Booking');
const LabSlot = require('../models/LabSlot');
const nodemailer = require('nodemailer');

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @desc    Book a slot
// @route   POST /api/bookings
// @access  Private (Student)
const createBooking = async (req, res) => {
    const { slotId } = req.body;
    const studentId = req.user._id;

    try {
        const slot = await LabSlot.findById(slotId);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        if (slot.bookedCount >= slot.seatCapacity) {
            return res.status(400).json({ message: 'Slot is full' });
        }

        const existingBooking = await Booking.findOne({ slotId, studentId });
        if (existingBooking) {
            return res.status(400).json({ message: 'You have already booked this slot' });
        }

        const booking = await Booking.create({
            slotId,
            studentId
        });

        // Increment bookedCount
        slot.bookedCount += 1;
        await slot.save();

        // Send Email Notification
        // Only if email config is present to avoid crashing in dev without creds
        if (process.env.EMAIL_USER) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: 'Lab Slot Confirmation',
                text: `You have successfully booked the lab: ${slot.labName} on ${new Date(slot.date).toDateString()} from ${slot.startTime} to ${slot.endTime}.`
            };
            transporter.sendMail(mailOptions, (err, info) => {
                if (err) console.log('Email error:', err);
                else console.log('Email sent:', info.response);
            });
        }

        res.status(201).json(booking);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my bookings
// @route   GET /api/bookings/my-bookings
// @access  Private (Student)
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ studentId: req.user._id })
            .populate('slotId')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get bookings for a specific slot
// @route   GET /api/bookings/slot/:slotId
// @access  Private (Faculty/Student)
const getBookingsForSlot = async (req, res) => {
    try {
        const bookings = await Booking.find({ slotId: req.params.slotId })
            .populate('studentId', 'name email roles');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createBooking, getMyBookings, getBookingsForSlot };
