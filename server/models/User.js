const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    password: {
        type: String,
        // Password is NOT required if googleId is present, but we can handle validation in controller
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values (for email/pass users)
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        required: true,
        default: 'student'
    },
    department: {
        type: String,
        required: true,
        default: 'CSE'
    },
    avatar: {
        type: String
    }
}, { timestamps: true });

// Encrypt password using bcrypt
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
