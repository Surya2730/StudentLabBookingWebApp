const mongoose = require('mongoose');

const labSlotSchema = new mongoose.Schema({
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String, // Format "HH:mm"
        required: true
    },
    endTime: {
        type: String, // Format "HH:mm"
        required: true
    },
    labName: {
        type: String,
        required: true
    },
    seatCapacity: {
        type: Number,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    bookedCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('LabSlot', labSlotSchema);
