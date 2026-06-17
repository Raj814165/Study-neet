/**
 * Seed Script — Creates admin user and demo courses in MongoDB
 * Run: cd backend && node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Course = require('./models/Course');

const ADMIN_DATA = {
  name: 'Admin',
  email: 'm@admin.com',
  password: 'coading',
  role: 'admin',
};

const STUDENT_DATA = {
  name: 'Alex Student',
  email: 'student@demo.com',
  password: 'student123',
  role: 'user',
};

const DEMO_COURSES = [
  {
    title: 'NEET 2026: Physics Complete Syllabus (Yakeen)',
    description: 'Master Physics for NEET 2026 with Alakh Sir. This comprehensive course covers 11th and 12th standard physics with high-yield concepts, numerical tricks, and previous year questions. Perfect for droppers and 12th class students aiming for a top medical college.',
    instructor: 'Alakh Pandey',
    category: 'Physics',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600',
    duration: '120h 30m',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 45210,
    enrolledCount: 154200,
    videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM',
    lessons: [
      { title: 'Units and Measurements - One Shot', videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM', duration: '2:15:30' },
      { title: 'Kinematics 1D & 2D', videoUrl: 'https://www.youtube.com/watch?v=8-wgK0zAaqI', duration: '3:22:15' },
      { title: 'Laws of Motion & Friction', videoUrl: 'https://www.youtube.com/watch?v=Cx73VWk_Rak', duration: '2:35:40' },
      { title: 'Work, Energy, and Power', videoUrl: 'https://www.youtube.com/watch?v=k_rCYiorZzs', duration: '2:28:10' },
    ],
  },
  {
    title: 'NEET 2026: Chemistry Masterclass',
    description: 'Complete Physical, Organic, and Inorganic Chemistry for NEET 2026. Learn from the best PW faculties with NCERT line-by-line explanations, assertion-reasoning questions, and mind maps for quick revision.',
    instructor: 'Pankaj Sir',
    category: 'Chemistry',
    thumbnail: 'https://images.unsplash.com/photo-1603126852811-376a661614f1?w=600',
    duration: '110h 15m',
    difficulty: 'Intermediate',
    rating: 4.8,
    reviewCount: 38156,
    enrolledCount: 142000,
    videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg',
    lessons: [
      { title: 'Some Basic Concepts of Chemistry', videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg', duration: '2:20:00' },
      { title: 'Structure of Atom', videoUrl: 'https://www.youtube.com/watch?v=3hJ2W6EUMR4', duration: '2:25:30' },
      { title: 'Chemical Bonding', videoUrl: 'https://www.youtube.com/watch?v=04lpu10ldrQ', duration: '3:30:15' },
      { title: 'General Organic Chemistry (GOC)', videoUrl: 'https://www.youtube.com/watch?v=W8dAATfMKtg', duration: '4:40:00' },
    ],
  },
  {
    title: 'NEET 2026: Biology (Botany + Zoology) Target Series',
    description: 'Score 360/360 in Biology! This detailed course covers all Botany and Zoology chapters strictly aligned with the latest NMC NEET syllabus. Includes NCERT highlights, mnemonics, and assertion-reason practice.',
    instructor: 'Tarun Sir & MD Sir',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600',
    duration: '180h 45m',
    difficulty: 'Beginner',
    rating: 4.9,
    reviewCount: 52893,
    enrolledCount: 186215,
    videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4',
    lessons: [
      { title: 'The Living World & Biological Classification', videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4', duration: '2:35:00' },
      { title: 'Plant Kingdom & Animal Kingdom', videoUrl: 'https://www.youtube.com/watch?v=ynUK8zXMulY', duration: '3:28:20' },
      { title: 'Cell: The Unit of Life', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '2:42:15' },
      { title: 'Human Reproduction & Reproductive Health', videoUrl: 'https://www.youtube.com/watch?v=lMwdorFoGtk', duration: '3:30:00' },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create(ADMIN_DATA);
    console.log(`👤 Admin created: ${admin.email} (password: ${ADMIN_DATA.password})`);

    // Create student
    const student = await User.create(STUDENT_DATA);
    console.log(`👤 Student created: ${student.email} (password: ${STUDENT_DATA.password})`);

    // Create courses
    const courses = await Course.insertMany(DEMO_COURSES);
    console.log(`📚 ${courses.length} courses created`);

    console.log('\n✅ Seed complete!\n');
    console.log('──────────────────────────────────────');
    console.log('  Admin Login:');
    console.log(`  Email:    ${ADMIN_DATA.email}`);
    console.log(`  Password: ${ADMIN_DATA.password}`);
    console.log('──────────────────────────────────────');
    console.log('  Student Login:');
    console.log(`  Email:    ${STUDENT_DATA.email}`);
    console.log(`  Password: ${STUDENT_DATA.password}`);
    console.log('──────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();
