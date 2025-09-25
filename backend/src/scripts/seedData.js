const mongoose = require('mongoose');
require('dotenv').config();
const { seedAssessments } = require('../controllers/seedAssessments.js');

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        console.log('Connected to MongoDB');

        // Seed assessments
        await seedAssessments();

        console.log('Data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();