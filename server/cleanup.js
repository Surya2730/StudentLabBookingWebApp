const mongoose = require('mongoose');
const LabSlot = require('./models/LabSlot');
const Booking = require('./models/Booking');
require('dotenv').config();

const clearData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const deletedSlots = await LabSlot.deleteMany({});
        console.log(`Deleted ${deletedSlots.deletedCount} slots`);

        const deletedBookings = await Booking.deleteMany({});
        console.log(`Deleted ${deletedBookings.deletedCount} bookings`);

        console.log('Data cleanup successful');
        process.exit();
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
};

clearData();
