const LabSlot = require('../models/LabSlot');
const Booking = require('../models/Booking');

// @desc    Create a new lab slot
// @route   POST /api/slots
// @access  Private (Faculty)
const createSlot = async (req, res) => {
    const { date, startTime, endTime, labName, seatCapacity, department } = req.body;

    // Basic validation could go here

    try {
        const slot = await LabSlot.create({
            facultyId: req.user._id,
            date,
            startTime,
            endTime,
            labName,
            seatCapacity,
            department
        });
        res.status(201).json(slot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all slots (with optional role filters if needed)
// @route   GET /api/slots
// @access  Private
const getSlots = async (req, res) => {
    try {
        // Retrieve slots sorted by date
        // Filter by user's department
        const slots = await LabSlot.find({ department: req.user.department }).sort({ date: 1 });

        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get slots created by current faculty
// @route   GET /api/slots/my-slots
// @access  Private (Faculty)
const getMySlots = async (req, res) => {
    try {
        const slots = await LabSlot.find({ facultyId: req.user._id }).sort({ date: 1 });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single slot details
// @route   GET /api/slots/:id
// @access  Private
const getSlotById = async (req, res) => {
    try {
        const slot = await LabSlot.findById(req.params.id);
        if (slot) {
            res.json(slot);
        } else {
            res.status(404).json({ message: 'Slot not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete slot
// @route   DELETE /api/slots/:id
// @access  Private (Faculty)
const deleteSlot = async (req, res) => {
    try {
        const slot = await LabSlot.findById(req.params.id);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        // Ensure user is the owner
        if (slot.facultyId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await LabSlot.deleteOne({ _id: req.params.id });
        // Also delete associated bookings? 
        await Booking.deleteMany({ slotId: req.params.id });

        res.json({ message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createSlot, getSlots, getMySlots, getSlotById, deleteSlot };
