const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CarWash = require('./models/CarWash');

dotenv.config();

const carWashSeedData = [
  {
    name: 'Sparkle Auto Spa - Nasr City Branch',
    address: 'Makram Ebeid St, Nasr City, Cairo',
    operatingAreas: ['Nasr City', 'New Cairo', 'Downtown Cairo'],
    rating: 4.6,
    services: [
      { serviceName: 'Basic Wash', price: 80, duration: 30 },
      { serviceName: 'Premium Wash', price: 140, duration: 50 },
      { serviceName: 'Interior Detailing', price: 180, duration: 75 },
    ],
    createdAt: new Date(),
  },
  {
    name: 'Nile Shine Car Care Center',
    address: '90 Street, New Cairo, Cairo',
    operatingAreas: ['Nasr City', 'New Cairo', 'Downtown Cairo'],
    rating: 4.4,
    services: [
      { serviceName: 'Basic Wash', price: 85, duration: 35 },
      { serviceName: 'Premium Wash', price: 150, duration: 55 },
      { serviceName: 'Engine Cleaning', price: 175, duration: 70 },
    ],
    createdAt: new Date(),
  },
  {
    name: 'Downtown Express Wash',
    address: '26th of July St, Downtown Cairo',
    operatingAreas: ['Nasr City', 'New Cairo', 'Downtown Cairo'],
    rating: 4.2,
    services: [
      { serviceName: 'Basic Wash', price: 90, duration: 30 },
      { serviceName: 'Premium Wash', price: 155, duration: 55 },
      { serviceName: 'Wax Protection', price: 180, duration: 70 },
    ],
    createdAt: new Date(),
  },
  {
    name: 'Rapid Mobile Car Wash',
    address: 'Mobile Service - Customer Location',
    operatingAreas: ['Nasr City', 'New Cairo', 'Downtown Cairo'],
    rating: 4.7,
    services: [
      { serviceName: 'Mobile Wash', price: 100, duration: 40 },
      { serviceName: 'Premium Wash', price: 165, duration: 60 },
      { serviceName: 'Waterless Mobile Wash', price: 130, duration: 45 },
    ],
    createdAt: new Date(),
  },
  {
    name: 'Eco Mobile Car Wash Cairo',
    address: 'Mobile Service - On Demand Across Cairo',
    operatingAreas: ['Nasr City', 'New Cairo', 'Downtown Cairo'],
    rating: 4.5,
    services: [
      { serviceName: 'Mobile Wash', price: 110, duration: 45 },
      { serviceName: 'Basic Wash', price: 80, duration: 30 },
      { serviceName: 'Premium Wash', price: 170, duration: 65 },
    ],
    createdAt: new Date(),
  },
];

const seedCarWashes = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await CarWash.deleteMany({});
    console.log('Existing CarWash documents cleared');

    const inserted = await CarWash.insertMany(carWashSeedData);
    console.log(`${inserted.length} car wash centers seeded successfully`);
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedCarWashes();
