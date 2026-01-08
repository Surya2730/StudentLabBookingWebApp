const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    department: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true // e.g., 1, 2, 3, 4
    },
    semester: {
        type: Number,
        required: true
    },
    schedule: {
        // Monday: ["Subject 1", "Lab", ...]
        Monday: [{ type: String }],
        Tuesday: [{ type: String }],
        Wednesday: [{ type: String }],
        Thursday: [{ type: String }],
        Friday: [{ type: String }],
        Saturday: [{ type: String }],
    }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
