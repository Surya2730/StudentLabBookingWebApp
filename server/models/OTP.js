const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LabSlot',
        required: false // Made optional for generic use
    },
    type: {
        type: String,
        enum: ['slot', 'attendance'],
        default: 'slot'
    },
    metadata: {
        // dynamic data for attendance (e.g., department, period, facultyId)
        department: String,
        period: Number,
        facultyId: String
    },
    code: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Utilize MongoDB TTL to automatically expire documents
// Note: TTL index is usually on a single Date field. 
// However, the prompt says "Server-generated OTP with expiry (10 seconds)".
// We can enforce this check in logic too.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
