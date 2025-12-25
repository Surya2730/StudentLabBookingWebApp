const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { token, role, department } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update googleId/avatar AND update role/dept if provided
            user.googleId = sub;
            user.avatar = picture;
            // Update role and department based on latest login selection
            user.role = role || user.role;
            user.department = department || user.department;
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                role: role || 'student', // Use provided role
                department: department || 'CSE' // Use provided department
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department, // Send Department to client
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(400).json({ message: 'Invalid Google Token' });
    }
};

// @desc    Dev Login (Mock)
// @route   POST /api/auth/dev-login
// @access  Public
const devLogin = async (req, res) => {
    const { email, role, department } = req.body;

    // Force strict dev mode check if needed, but for this project safe to assume accessible
    try {
        let user = await User.findOne({ email });

        if (user) {
            // Update logic for dev mode if needed, e.g. switching roles/depts for testing
            user.role = role || user.role;
            user.department = department || user.department;
            await user.save();
        } else {
            user = await User.create({
                name: email.split('@')[0],
                email,
                googleId: 'dev_mock_id_' + Math.random(),
                role: role || 'student',
                department: department || 'CSE',
                avatar: 'https://via.placeholder.com/150'
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department, // Send Department to client
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { googleLogin, devLogin };
