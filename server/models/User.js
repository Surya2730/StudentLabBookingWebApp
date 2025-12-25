const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['student', 'faculty'],
        required: true,
        default: 'student'
    },
    department: {
        type: String,
        required: true,
        default: 'CSE' // Default for now
    },
    avatar: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
