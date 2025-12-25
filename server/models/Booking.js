const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabSlot',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendanceStatus: {
        type: String,
        enum: ['Pending', 'Present', 'Absent'],
        default: 'Pending'
    },
    marks: {
        type: Number,
        default: null
    }
}, { timestamps: true });

// Prevent double booking
bookingSchema.index({ slotId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
