const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, department } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student', // Default fallback
            department: department || 'CSE'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token: generateToken(user._id),
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { token } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Define Admin Email
    const ADMIN_EMAIL = 'suryaselvam.219@gmail.com';

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture, sub } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

        // Determine Role
        // Force Admin role for specific admin email, Student for everyone else
        let forcedRole = 'student';
        if (email === ADMIN_EMAIL) {
            forcedRole = 'admin';
        }

        if (user) {
            // Update user details
            user.googleId = sub;
            user.avatar = picture;
            // Only update role if it's the admin email, or if they have no role. 
            // We generally trust the DB role, but for the admin, we enforce it.
            if (email === ADMIN_EMAIL) {
                user.role = 'admin';
            }
            // We do not overwrite department here; assume it's set or default 'CSE'

            await user.save();
        } else {
            // Create new user (Auto-Register)
            user = await User.create({
                name,
                email,
                googleId: sub,
                avatar: picture,
                role: forcedRole,
                department: 'CSE' // Default department, can be updated in profile later if needed
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error("Google Auth Error Details:", error);
        res.status(400).json({ message: 'Invalid Google Token', error: error.message });
    }
};

module.exports = { registerUser, authUser, googleLogin };
