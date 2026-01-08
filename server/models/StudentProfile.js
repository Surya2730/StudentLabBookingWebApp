const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    year: {
        type: Number,
        required: true
    },
    cgpa: {
        type: Number,
        default: 0
    },
    rewardPoints: {
        type: Number,
        default: 0
    },
    activityPoints: {
        type: Number,
        default: 0
    },
    psLevels: [{
        subject: { type: String }, // e.g., "C Programming"
        level: { type: Number, default: 0 } // e.g., 5
    }],
    assessments: [{
        title: { type: String },
        score: { type: Number },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
