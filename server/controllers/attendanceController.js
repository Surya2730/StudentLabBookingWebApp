const Attendance = require('../models/Attendance');
const OTP = require('../models/OTP');
const User = require('../models/User');

// @desc    Generate Attendance OTP (Faculty)
// @route   POST /api/attendance/generate-otp
// @access  Faculty
const generateOTP = async (req, res) => {
    try {
        const { period, department } = req.body;

        // Generate a 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 20 * 1000); // 20 seconds validity

        const otp = await OTP.create({
            type: 'attendance',
            code,
            expiresAt,
            metadata: {
                period,
                department,
                facultyId: req.user._id
            }
        });

        // Create or update today's attendance record for this period
        // We might just want to return the OTP here and create the record when students join, 
        // OR create the record now. Let's create a placeholder if it doesn't exist.

        // Actually, we'll just return the OTP. The attendance record is updated/created when students mark it? 
        // Or cleaner: Create the Attendance document now so we have a persistent record of the session.

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            date: today,
            period,
            department
        });

        if (!attendance) {
            attendance = await Attendance.create({
                date: today,
                period,
                department,
                otp: code,
                faculty: req.user._id,
                studentsPresent: []
            });
        } else {
            // Update the OTP if it was regenerated
            attendance.otp = code;
            attendance.faculty = req.user._id;
            await attendance.save();
        }

        res.status(200).json({ success: true, code, expiresAt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Mark Attendance (Student)
// @route   POST /api/attendance/mark
// @access  Student
const markAttendance = async (req, res) => {
    try {
        const { code } = req.body;
        const student = await User.findById(req.user._id);

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            code,
            type: 'attendance',
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or Expired OTP' });
        }

        // Verify Student Department (Optional: strict check)
        if (student.department !== otpRecord.metadata.department) {
            return res.status(400).json({ message: `This OTP is for ${otpRecord.metadata.department} department` });
        }

        const { period, department } = otpRecord.metadata;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update Attendance Record
        const attendance = await Attendance.findOne({
            date: today,
            period,
            department
        });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance Session not found' });
        }

        // Check if already present
        if (attendance.studentsPresent.includes(req.user._id)) {
            return res.status(400).json({ message: 'Attendance already marked' });
        }

        attendance.studentsPresent.push(req.user._id);
        await attendance.save();

        res.status(200).json({ success: true, message: 'Attendance Marked Successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Student Stats
// @route   GET /api/attendance/stats
// @access  Student
const getAttendanceStats = async (req, res) => {
    try {
        // Calculate percentage, etc.
        // This is a simplified calculation.
        const totalSessions = await Attendance.countDocuments({ department: req.user.department });
        const attendedSessions = await Attendance.countDocuments({
            department: req.user.department,
            studentsPresent: req.user._id
        });

        const percentage = totalSessions === 0 ? 0 : ((attendedSessions / totalSessions) * 100).toFixed(2);

        res.status(200).json({
            totalSessions,
            attendedSessions,
            percentage
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Active OTP (Faculty)
// @route   GET /api/attendance/active-otp
// @access  Faculty
const getActiveOTP = async (req, res) => {
    try {
        const otp = await OTP.findOne({
            'metadata.facultyId': req.user._id,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otp) {
            return res.status(200).json(null);
        }

        res.status(200).json(otp);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { generateOTP, markAttendance, getAttendanceStats, getActiveOTP };
