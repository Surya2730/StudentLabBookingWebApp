const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    period: {
        type: Number,
        required: true // 1 to 7
    },
    department: {
        type: String,
        required: true
    },
    studentsPresent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    otp: {
        type: String, // The OTP used for this session
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// Compound index to ensure one attendance record per period per dept per day (optional, depending on logic)
attendanceSchema.index({ date: 1, period: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
