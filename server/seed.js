const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const CarWash = require('./models/CarWash');
const HomePackage = require('./models/HomePackage');

/** Home packages (EGP). Ratios vs prior tier; global min wash 200 EGP at Crystal Clear Express. */
const homePackageSeed = [
  {
    _id: 'home-1',
    name: 'Driveway Express',
    description: 'Exterior hand wash and dry at your location.',
    durationMin: 40,
    price: 1125,
    features: ['Hand wash & dry', 'Wheels & tires', 'Exterior windows'],
  },
  {
    _id: 'home-2',
    name: 'Curb-to-Curb Detail',
    description: 'Interior vacuum, wipe-down, and exterior wash.',
    durationMin: 90,
    price: 2125,
    features: ['Full exterior wash', 'Interior vacuum', 'Dash & console wipe'],
  },
  {
    _id: 'home-3',
    name: 'Full Home Spa',
    description: 'Complete interior and exterior detailing.',
    durationMin: 150,
    price: 4000,
    features: ['Deep clean interior', 'Clay & wax exterior', 'Leather treatment'],
  },
];

/** Mirrors client `washCenters` in client/src/data/washCenters.ts */
const carWashSeedData = [
  {
    _id: 'c1',
    name: 'Crystal Clear Auto Spa',
    image:
      'https://images.unsplash.com/photo-1520340351474-8134a2e84fa3?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewCount: 234,
    area: 'Downtown',
    locationLine: 'Downtown, 5th Avenue',
    address: '450 5th Avenue, Downtown',
    phone: '+1 555-0101',
    hours: 'Mon–Sun: 8:00 AM – 8:00 PM',
    hoursShort: '8:00 AM – 8:00 PM',
    description:
      'Premium car wash & detailing center with state-of-the-art equipment and eco-friendly products.',
    services: [
      {
        id: 'c1-s1',
        name: 'Basic Wash',
        description: 'Exterior wash with soap & rinse.',
        durationMin: 20,
        price: 300,
      },
      {
        id: 'c1-s2',
        name: 'Full Service',
        description: 'Exterior wash plus interior vacuum and wipe-down.',
        durationMin: 45,
        price: 700,
      },
      {
        id: 'c1-s3',
        name: 'Premium Detail',
        description: 'Full interior and exterior detailing package.',
        durationMin: 90,
        price: 2125,
      },
      {
        id: 'c1-s4',
        name: 'Express Touch-Up',
        description: 'Quick exterior rinse and dry.',
        durationMin: 12,
        price: 200,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'c2',
    name: 'AquaShine Car Wash',
    image:
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=1200&q=80',
    rating: 4.5,
    reviewCount: 187,
    area: 'Westside',
    locationLine: 'Westside Mall, Block B',
    address: 'Westside Mall, Block B, Unit 12',
    phone: '+1 555-0102',
    hours: 'Mon–Sat: 9:00 AM – 7:00 PM',
    hoursShort: '9:00 AM – 7:00 PM',
    description:
      'Friendly hand-wash service with convenient mall parking and fast turnaround.',
    services: [
      {
        id: 'c2-s1',
        name: 'Express Wash',
        description: 'Fast exterior wash and dry.',
        durationMin: 15,
        price: 250,
      },
      {
        id: 'c2-s2',
        name: 'Standard Wash',
        description: 'Hand wash, wheels, and interior vacuum.',
        durationMin: 35,
        price: 550,
      },
      {
        id: 'c2-s3',
        name: 'Wax & Shine',
        description: 'Standard wash plus spray wax finish.',
        durationMin: 45,
        price: 950,
      },
      {
        id: 'c2-s4',
        name: 'Interior Refresh',
        description: 'Deep vacuum and glass cleaning.',
        durationMin: 30,
        price: 800,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'c3',
    name: 'SparkleWorks Detailing',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewCount: 312,
    area: 'Northside',
    locationLine: 'North Park, Industrial Zone',
    address: '88 Industrial Way, North Park',
    phone: '+1 555-0103',
    hours: 'Mon–Sun: 7:00 AM – 9:00 PM',
    hoursShort: '7:00 AM – 9:00 PM',
    description:
      'Specialists in hand finishing and interior deep cleaning for luxury vehicles.',
    services: [
      {
        id: 'c3-s1',
        name: 'Hand Wash',
        description: 'Careful two-bucket hand wash and dry.',
        durationMin: 35,
        price: 375,
      },
      {
        id: 'c3-s2',
        name: 'Interior Deep Clean',
        description: 'Seats, carpets, and cabin sanitization.',
        durationMin: 90,
        price: 1875,
      },
      {
        id: 'c3-s3',
        name: 'Ceramic Lite',
        description: 'Spray sealant and gloss enhancement.',
        durationMin: 40,
        price: 1125,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'c4',
    name: 'NorthStar Hand Wash',
    image:
      'https://images.unsplash.com/photo-1507139953747-bedd604e23ac?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    reviewCount: 142,
    area: 'Northside',
    locationLine: 'Northside, Summit Ave',
    address: '210 Summit Ave, Northside',
    phone: '(555) 555-2210',
    hours: 'Tue–Sun: 10:00 AM – 6:00 PM',
    hoursShort: '10:00 AM – 6:00 PM',
    description:
      'Hand-finished washes for delicate paint, SUVs, and pet-hair cleanup with Northside parking.',
    services: [
      {
        id: 'c4-s1',
        name: 'Hand Wash',
        description: 'Careful hand wash for delicate finishes.',
        durationMin: 40,
        price: 700,
      },
      {
        id: 'c4-s2',
        name: 'SUV Plus',
        description: 'Larger vehicle wash with undercarriage rinse.',
        durationMin: 50,
        price: 875,
      },
      {
        id: 'c4-s3',
        name: 'Pet Hair Removal',
        description: 'Deep vacuum and lint roll interior.',
        durationMin: 60,
        price: 1800,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'c5',
    name: 'East End Eco Wash',
    image:
      'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    reviewCount: 401,
    area: 'East End',
    locationLine: 'East End, Greenway Blvd',
    address: '77 Greenway Blvd, East End',
    phone: '(555) 678-3344',
    hours: 'Mon–Sun: 8:00 AM – 8:00 PM',
    hoursShort: '8:00 AM – 8:00 PM',
    description:
      'Low-water biodegradable wash, glass & trim care, and ozone odor treatment.',
    services: [
      {
        id: 'c5-s1',
        name: 'Eco Rinse',
        description: 'Low-water eco wash with biodegradable soaps.',
        durationMin: 28,
        price: 450,
      },
      {
        id: 'c5-s2',
        name: 'Glass & Trim',
        description: 'Streak-free glass and trim restoration.',
        durationMin: 35,
        price: 650,
      },
      {
        id: 'c5-s3',
        name: 'Ozone Fresh',
        description: 'Ozone treatment to neutralize odors.',
        durationMin: 25,
        price: 600,
      },
      {
        id: 'c5-s4',
        name: 'Full Eco Detail',
        description: 'Complete interior and exterior eco detail.',
        durationMin: 140,
        price: 3000,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'c6',
    name: 'Metro Express Tunnel',
    image:
      'https://images.unsplash.com/photo-1619405399517-d7fce0f13302?auto=format&fit=crop&w=1200&q=80',
    rating: 4.4,
    reviewCount: 520,
    area: 'Downtown',
    locationLine: 'Downtown, Commerce Pl',
    address: '9 Commerce Pl, Downtown',
    phone: '(555) 900-7722',
    hours: 'Mon–Sun: 6:00 AM – 11:00 PM',
    hoursShort: '6:00 AM – 11:00 PM',
    description:
      'High-volume tunnel wash with underbody blast, wax spray, and monthly unlimited plans.',
    services: [
      {
        id: 'c6-s1',
        name: 'Tunnel Basic',
        description: 'Fast tunnel wash with spot-free rinse.',
        durationMin: 15,
        price: 300,
      },
      {
        id: 'c6-s2',
        name: 'Tunnel Plus',
        description: 'Basic plus underbody blast and wax spray.',
        durationMin: 20,
        price: 450,
      },
      {
        id: 'c6-s3',
        name: 'Unlimited Monthly',
        description: 'Book as recurring — shown as single visit price.',
        durationMin: 15,
        price: 625,
      },
    ],
    createdAt: new Date(),
  },
  {
    _id: 'c7',
    name: 'Summit Suburban Detail',
    image:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    reviewCount: 97,
    area: 'Suburbs',
    locationLine: 'Suburbs, Cedar Court',
    address: '3 Cedar Court, Suburbs',
    phone: '(555) 111-4455',
    hours: 'Wed–Mon: 9:00 AM – 5:00 PM',
    hoursShort: '9:00 AM – 5:00 PM',
    description:
      'Family vans, third-row vacuuming, and lite paint correction for suburban commuters.',
    services: [
      {
        id: 'c7-s1',
        name: 'Family Van Package',
        description: 'Extra seating rows and trunk vacuum.',
        durationMin: 65,
        price: 1375,
      },
      {
        id: 'c7-s2',
        name: 'Paint Correction Lite',
        description: 'Minor swirl removal and sealant.',
        durationMin: 180,
        price: 7000,
      },
    ],
    createdAt: new Date(),
  },
];

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    await CarWash.deleteMany({});
    await HomePackage.deleteMany({});
    console.log('Existing CarWash and HomePackage documents cleared');

    for (const doc of carWashSeedData) {
      await CarWash.create(doc);
    }
    await HomePackage.insertMany(homePackageSeed);

    console.log(
      `${carWashSeedData.length} centers and ${homePackageSeed.length} home packages seeded successfully`
    );
  } catch (error) {
    console.error(`Seeding failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seed();
