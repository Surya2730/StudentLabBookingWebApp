const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Timetable = require('./models/Timetable');
const StudentProfile = require('./models/StudentProfile');
const User = require('./models/User'); // Check if User exists to link profile?

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Clear existing Timetables (Optional: or update)
        await Timetable.deleteMany({});
        console.log('Old Timetables removed.');

        // 2. Seed Student Timetables (CSE, ECE, EEE)
        const timetables = [
            {
                department: 'CSE',
                year: 1,
                semester: 1,
                schedule: {
                    Monday: ['Maths', 'Physics', 'C Programming', 'Lunch', 'English', 'Library', 'Sports'],
                    Tuesday: ['Physics', 'Maths', 'C Lab', 'C Lab', 'Lunch', 'Electronics', 'EVS'],
                    Wednesday: ['C Programming', 'Electronics', 'Maths', 'Lunch', 'Physics Lab', 'Physics Lab', 'Library'],
                    Thursday: ['English', 'C Programming', 'Maths', 'Lunch', 'Electronics', 'Sports', 'Mentoring'],
                    Friday: ['Electronics', 'Physics', 'English', 'Lunch', 'Maths', 'C Programming', 'Library']
                }
            },
            {
                department: 'ECE',
                year: 1,
                semester: 1,
                schedule: {
                    Monday: ['Circuits', 'Maths', 'Physics', 'Lunch', 'English', 'EDC', 'Sports'],
                    Tuesday: ['Maths', 'Circuits', 'EDC', 'Lunch', 'Physics Lab', 'Physics Lab', 'Library'],
                    Wednesday: ['EDC', 'Circuits', 'Maths', 'Lunch', 'English', 'EVS', 'Sports'],
                    Thursday: ['Physics', 'EDC', 'Circuits Lab', 'Circuits Lab', 'Lunch', 'Maths', 'English'],
                    Friday: ['English', 'Maths', 'Circuits', 'Lunch', 'EDC', 'Physics', 'Mentoring']
                }
            },
            {
                department: 'EEE',
                year: 1,
                semester: 1,
                schedule: {
                    Monday: ['Electrical Machines', 'Maths', 'Physics', 'Lunch', 'Circuits', 'English', 'Sports'],
                    Tuesday: ['Maths', 'Circuits', 'Machines', 'Lunch', 'Physics Lab', 'Physics Lab', 'Library'],
                    Wednesday: ['Machines', 'Circuits', 'Maths', 'Lunch', 'English', 'EVS', 'Sports'],
                    Thursday: ['Physics', 'Machines', 'Circuits Lab', 'Circuits Lab', 'Lunch', 'Maths', 'English'],
                    Friday: ['English', 'Maths', 'Circuits', 'Lunch', 'Machines', 'Physics', 'Mentoring']
                }
            }
        ];

        await Timetable.insertMany(timetables);
        console.log('Timetables Seeded.');

        // 3. Seed/Update Student Profiles (Dummy Data)
        // Find existing students or create dummy users if needed?
        // Let's assume some users exist. If not, creating profiles might fail if User ID is required.
        // I will just update ALL existing students with random points for now to populate the leaderboard.

        const students = await User.find({ role: 'student' });

        for (const student of students) {
            const randomReward = Math.floor(Math.random() * 2000);
            const randomActivity = Math.floor(Math.random() * 500);
            const currentLevel = Math.floor(Math.random() * 10);

            await StudentProfile.findOneAndUpdate(
                { user: student._id },
                {
                    rollNumber: 'ROLL-' + student._id.toString().slice(-4),
                    year: 1, // Default
                    department: student.department || 'CSE',
                    rewardPoints: randomReward,
                    activityPoints: randomActivity,
                    psLevels: [
                        { subject: 'C Programming', level: currentLevel },
                        { subject: 'Python', level: Math.max(0, currentLevel - 2) }
                    ]
                },
                { upsert: true, new: true }
            );
        }
        console.log('Student Profiles updated with dummy data.');

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
