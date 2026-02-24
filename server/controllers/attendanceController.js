const Attendance = require('../models/Attendance');
const OTP = require('../models/OTP');
const User = require('../models/User');

// @desc    Generate Attendance OTP (Faculty)
// @route   POST /api/attendance/generate-otp
// @access  Faculty
const generateOTP = async (req, res) => {
    try {
        const { period, department, slotId } = req.body;

        // Generate a 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 20 * 1000); // 20 seconds validity

        const otpPayload = {
            type: slotId ? 'slot' : 'attendance',
            code,
            expiresAt,
            metadata: {
                facultyId: req.user._id
            }
        };

        if (slotId) {
            otpPayload.slotId = slotId;
            otpPayload.metadata.slotId = slotId; // specific to slot
        } else {
            otpPayload.metadata.period = period;
            otpPayload.metadata.department = department;
        }

        const otp = await OTP.create(otpPayload);

        // For Regular Class Attendance, we create/update the session
        if (!slotId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let attendance = await Attendance.findOne({
                date: today,
                period,
                department
            });

            if (!attendance) {
                await Attendance.create({
                    date: today, period, department, otp: code, faculty: req.user._id, studentsPresent: []
                });
            } else {
                attendance.otp = code;
                attendance.faculty = req.user._id;
                await attendance.save();
            }
        }

        res.status(200).json({ success: true, code, expiresAt, metadata: otpPayload.metadata });
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
        const Booking = require('../models/Booking');

        // Find valid OTP
        const otpRecord = await OTP.findOne({
            code,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or Expired OTP' });
        }

        // --- LAB SLOT ATTENDANCE ---
        if (otpRecord.type === 'slot' || otpRecord.slotId || otpRecord.metadata.slotId) {
            const slotId = otpRecord.slotId || otpRecord.metadata.slotId;

            // Find Student's Booking for this slot
            const booking = await Booking.findOne({
                slotId: slotId,
                studentId: req.user._id
            });

            if (!booking) {
                return res.status(404).json({ message: 'You have not booked this lab slot.' });
            }

            if (booking.attendanceStatus === 'Present') {
                return res.status(400).json({ message: 'Attendance already marked for this slot.' });
            }

            booking.attendanceStatus = 'Present';
            await booking.save();

            return res.status(200).json({ success: true, message: 'Lab Slot Attendance Marked!' });
        }

        // --- REGULAR CLASS ATTENDANCE ---
        if (student.department !== otpRecord.metadata.department) {
            return res.status(400).json({ message: `This OTP is for ${otpRecord.metadata.department}` });
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

        if (attendance.studentsPresent.includes(req.user._id)) {
            return res.status(400).json({ message: 'Attendance already marked' });
        }

        attendance.studentsPresent.push(req.user._id);
        await attendance.save();

        res.status(200).json({ success: true, message: 'Class Attendance Marked Successfully' });

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
        const attendanceRecords = await Attendance.find({
            department: req.user.department,
            studentsPresent: req.user._id
        });

        const totalSessionRecords = await Attendance.find({
            department: req.user.department
        });

        // Group by date
        const groupAttendanceByDate = (records) => {
            return records.reduce((acc, record) => {
                const dateKey = new Date(record.date).toISOString().split('T')[0];
                if (!acc[dateKey]) acc[dateKey] = 0;
                acc[dateKey] += 1; // Count periods
                return acc;
            }, {});
        };

        const studentDailyAttendance = groupAttendanceByDate(attendanceRecords);
        const totalPossibleAttendance = groupAttendanceByDate(totalSessionRecords);

        let earnedCredits = 0;
        Object.values(studentDailyAttendance).forEach(periods => {
            if (periods >= 7) earnedCredits += 1.0;
            else if (periods >= 4) earnedCredits += 0.5;
            // You could add else if (periods >= 1) earnedCredits += 0.2? 
            // The user said: "if he put otp for first 4 period then it want to add as .5"
        });

        const totalActiveDays = Object.keys(totalPossibleAttendance).length;
        const percentage = totalActiveDays === 0 ? 0 : ((earnedCredits / totalActiveDays) * 100).toFixed(2);

        res.status(200).json({
            earnedCredits,
            totalActiveDays,
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
