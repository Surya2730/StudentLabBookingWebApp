const OTP = require('../models/OTP');
const Booking = require('../models/Booking');
const LabSlot = require('../models/LabSlot');

// @desc    Generate OTP for a slot
// @route   POST /api/attendance/generate-otp
// @access  Private (Faculty)
const generateOTP = async (req, res) => {
    const { slotId } = req.body;

    // Check if slot belongs to faculty
    const slot = await LabSlot.findById(slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    if (slot.facultyId.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit
    const expiresAt = new Date(Date.now() + 15 * 1000); // 15 seconds from now

    try {
        // Remove existing OTPs for this slot to avoid confusion? Or just allow new one to coexist?
        // Usually only one valid OTP at a time is best.
        await OTP.deleteMany({ slotId });

        const otp = await OTP.create({
            slotId,
            code: otpCode,
            expiresAt
        });

        res.json({ code: otp.code, expiresAt: otp.expiresAt });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit OTP for attendance
// @route   POST /api/attendance/submit-otp
// @access  Private (Student)
const submitOTP = async (req, res) => {
    const { slotId, otp: inputOtp } = req.body;
    const studentId = req.user._id;

    try {
        // Find OTP for the slot
        // Must be exact match and not expired
        // Note: MongoDB TTL background thread runs every 60s, so documents might exist after expiry time.
        // We must check expiresAt manually for precise 10s logic.
        const validOTP = await OTP.findOne({ slotId, code: inputOtp });

        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > validOTP.expiresAt) {
            return res.status(400).json({ message: 'OTP Expired' });
        }

        // Mark attendance
        const booking = await Booking.findOne({ slotId, studentId });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.attendanceStatus = 'Present';
        await booking.save();

        res.json({ message: 'Attendance marked successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Marks
// @route   POST /api/attendance/marks
// @access  Private (Faculty)
const updateMarks = async (req, res) => {
    const { bookingId, marks } = req.body;

    try {
        const booking = await Booking.findById(bookingId).populate('slotId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.slotId.facultyId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        booking.marks = marks;
        await booking.save();

        res.json({ message: 'Marks updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateOTP, submitOTP, updateMarks };
