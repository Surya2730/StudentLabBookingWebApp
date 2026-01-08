const Timetable = require('../models/Timetable');

// @desc    Get Timetable
// @route   GET /api/timetable
// @access  Private
const getTimetable = async (req, res) => {
    try {
        if (req.user.role === 'faculty') {
            // Mixed Timetable for Faculty
            // Dummy logic: Take periods from different departments to simulate a busy faculty schedule
            // For real apps, this would query a FacultySchedule model.

            const departments = ['CSE', 'ECE', 'EEE']; // Available seeded depts
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const mixedSchedule = {};

            // Fetch all timetables to mix match
            const allTimetables = await Timetable.find({ year: 1 }); // Just grabbing year 1 schedules for mixing

            days.forEach(day => {
                const daySchedule = [];
                for (let i = 0; i < 7; i++) {
                    // Randomly pick a subject from one of the departments for this slot
                    const randomDeptIndex = Math.floor(Math.random() * departments.length);
                    const deptTimetable = allTimetables.find(t => t.department === departments[randomDeptIndex]);

                    if (deptTimetable && deptTimetable.schedule[day] && deptTimetable.schedule[day][i]) {
                        daySchedule.push(`${deptTimetable.schedule[day][i]} (${departments[randomDeptIndex]})`);
                    } else {
                        daySchedule.push('Free');
                    }
                }
                mixedSchedule[day] = daySchedule;
            });

            return res.status(200).json({
                department: 'Faculty (Mixed)',
                year: 'All',
                semester: 'All',
                schedule: mixedSchedule
            });

        } else {
            // Student: Get their department's timetable
            // Assume student has department and maybe year/sem in profile (or passed in query)
            const { department } = req.user;
            const { year, semester } = req.query; // Optional filters

            // If not provided, try to guess or return first found for dept
            const query = { department: department || 'CSE' };
            if (year) query.year = year;
            if (semester) query.semester = semester;

            // Default to Year 1 Sem 1 if not specified for now, as we only seeded that
            const timetable = await Timetable.findOne(query) || await Timetable.findOne({ department: department || 'CSE' });

            if (!timetable) {
                return res.status(404).json({ message: 'Timetable not found' });
            }

            res.status(200).json(timetable);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create/Update Timetable (Faculty/Admin)
// @route   POST /api/timetable
// @access  Faculty
const updateTimetable = async (req, res) => {
    try {
        const { department, year, semester, schedule } = req.body;

        let timetable = await Timetable.findOne({ department, year, semester });

        if (timetable) {
            timetable.schedule = schedule;
            await timetable.save();
        } else {
            timetable = await Timetable.create({
                department,
                year,
                semester,
                schedule
            });
        }

        res.status(200).json(timetable);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { getTimetable, updateTimetable };
