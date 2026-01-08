const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

// @desc    Get My Profile (Student)
// @route   GET /api/profile/me
// @access  Student
const getMyProfile = async (req, res) => {
    try {
        let profile = await StudentProfile.findOne({ user: req.user._id }).populate('user', 'name email department');

        if (!profile) {
            // Auto-create if not exists (lazy init)
            profile = await StudentProfile.create({
                user: req.user._id,
                rollNumber: 'TEMP', // Should be updated
                year: 1, // Default
                department: req.user.department
            });
            profile = await profile.populate('user', 'name email department');
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Leaderboard
// @route   GET /api/profile/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        // Fetch all profiles sorted by rewardPoints
        const allProfiles = await StudentProfile.find()
            .sort({ rewardPoints: -1 })
            .populate({
                path: 'user',
                match: { role: 'student' }, // Only populate if role is student
                select: 'name department'
            });

        // Filter out profiles where user is null (faculty or deleted)
        // Then take top 20
        const leaderboard = allProfiles
            .filter(profile => profile.user)
            .slice(0, 20);

        res.status(200).json(leaderboard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update Student Points (Faculty)
// @route   PUT /api/profile/update-points
// @access  Faculty
const updatePoints = async (req, res) => {
    try {
        const { studentId, rewardPoints, activityPoints, reason, psSubject, psLevel } = req.body;
        // studentId is the User ObjectId

        const profile = await StudentProfile.findOne({ user: studentId });
        if (!profile) {
            return res.status(404).json({ message: 'Student Profile not found' });
        }

        if (rewardPoints) profile.rewardPoints = (profile.rewardPoints || 0) + parseInt(rewardPoints);
        if (activityPoints) profile.activityPoints = (profile.activityPoints || 0) + parseInt(activityPoints);

        // Update PS Levels if provided - ALWAYS APPEND (HISTORY)
        if (psSubject && psLevel) {
            profile.psLevels.push({
                subject: psSubject,
                level: parseInt(psLevel)
            });
        }

        // Optionally record this transaction
        if (reason) {
            profile.assessments.push({
                title: reason,
                score: (parseInt(rewardPoints) || 0) + (parseInt(activityPoints) || 0),
                date: new Date()
            });
        }

        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Search Students (For Faculty to add points)
// @route   GET /api/profile/search
// @access  Faculty
const searchStudents = async (req, res) => {
    try {
        const { query } = req.query; // matches name or email or rollnumber

        // 1. Find Users matching the query
        const users = await User.find({
            role: 'student',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name email department'); // keys: _id, name, email, department

        // 2. Find Profiles for these users
        const userIds = users.map(u => u._id);
        const profiles = await StudentProfile.find({ user: { $in: userIds } });

        // 3. Merge data
        let results = users.map(user => {
            const profile = profiles.find(p => p.user.toString() === user._id.toString());
            return {
                _id: user._id, // User ID
                name: user.name,
                email: user.email,
                department: user.department,
                // Profile details (if exists)
                rollNumber: profile?.rollNumber || 'N/A',
                rewardPoints: profile?.rewardPoints || 0,
                activityPoints: profile?.activityPoints || 0,
                psLevels: profile?.psLevels || []
            };
        });

        // Sort: "Starts with" prioritized
        if (query) {
            const lowerQuery = query.toLowerCase();
            results.sort((a, b) => {
                const aName = a.name.toLowerCase();
                const bName = b.name.toLowerCase();
                const aStarts = aName.startsWith(lowerQuery);
                const bStarts = bName.startsWith(lowerQuery);

                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return 0; // maintain default order if both or neither start with query
            });
        }

        res.status(200).json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getMyProfile, getLeaderboard, updatePoints, searchStudents };
