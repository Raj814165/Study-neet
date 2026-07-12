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
    title: 'NEET Biology 2025 for Hindi Medium by Ashish Singh Lectures',
    description: 'NEET Biology 2025 playlist tailored for Hindi Medium aspirants. Complete and thorough lectures from Ashish Singh Lectures.',
    instructor: 'Ashish Singh Lectures',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600',
    duration: '2h 04m',
    difficulty: 'Beginner',
    rating: 4.8,
    reviewCount: 450,
    enrolledCount: 12000,
    videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM',
    lessons: [
      { title: "NEET Biology 2025 - Orientation Session : Biology की शानदार शुरुआत With Renu Ma'am", videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM', duration: '42:59' },
      { title: 'NEET Biology 2025 | L - 1 | वर्गीकरण का आधार | Animal Kingdom | प्राणि जगत By Renu Ma\'am', videoUrl: 'https://www.youtube.com/watch?v=8-wgK0zAaqI', duration: '1:21:25' }
    ]
  },
  {
    title: 'NEET Biology (Class 11) | All Chapters Complete Playlist',
    description: 'All Chapters Complete Playlist | Topicwise Videos Useful for NEET Class 11 preparation.',
    instructor: 'Magnet Brains',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600',
    duration: '1h 03m',
    difficulty: 'Beginner',
    rating: 4.7,
    reviewCount: 380,
    enrolledCount: 9500,
    videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    lessons: [
      { title: 'All About NEET Biology | Everything You Need to Know About NEET Examination', videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: '25:49' },
      { title: "How To Crack NEET? | NEET Do's and Don'ts!! | NEET Biology", videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration: '37:47' }
    ]
  },
  {
    title: 'Complete NEET Biology by Vipin Sir || NEET 2026',
    description: 'Complete NEET Biology preparation by Vipin Sir for NEET 2026. Detailed one-shot conceptual lectures.',
    instructor: 'Vipin Sir',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600',
    duration: '22h 03m',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 1250,
    enrolledCount: 35000,
    videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4',
    lessons: [
      { title: 'CELL STRUCTURE AND FUNCTION - Complete Unit in One Shot || NEET 2026 || Vipin Sharma', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '11:20:25' },
      { title: 'DIVERSITY IN LIVING WORLD - Complete Unit in One Shot || NEET 2026 || Vipin Sir', videoUrl: 'https://www.youtube.com/watch?v=lMwdorFoGtk', duration: '10:42:36' }
    ]
  },
  {
    title: '🚀 45 Days Biology Crash Course | Seep Pahuja | Complete NEET Biology',
    description: 'Fast track crash course covering NEET Biology. 45 Days daily target lectures by Seep Pahuja.',
    instructor: 'Seep Pahuja',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600',
    duration: '4h 06m',
    difficulty: 'Intermediate',
    rating: 4.9,
    reviewCount: 2100,
    enrolledCount: 54000,
    videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4',
    lessons: [
      { title: 'NEET 2026 Biology: Human Reproduction One Shot | 1 Day 1 Chapter Free Crash Course By Seep Pahuja', videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4', duration: '2:04:48' },
      { title: 'NEET 2026 Biology: Reproductive Health One Shot | 1 Day 1 Chapter Free Crash Course By Seep Pahuja', videoUrl: 'https://www.youtube.com/watch?v=ynUK8zXMulY', duration: '2:01:45' }
    ]
  },
  {
    title: 'Complete Physics | UMMEED NEET 2026',
    description: 'High-quality physics conceptual lectures in Hindi medium under the UMMEED NEET series.',
    instructor: 'Akhil Goyal Sir',
    category: 'Physics',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600',
    duration: '10h 48m',
    difficulty: 'Advanced',
    rating: 4.8,
    reviewCount: 940,
    enrolledCount: 22000,
    videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM',
    lessons: [
      { title: 'आधुनिक भौतिकी | UMMEED HINDI NEET | One-Shot | Akhil Goyal Sir Physics NEET | NEET Wallah Hindi', videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM', duration: '5:27:45' },
      { title: 'तरंग प्रकाशिकी | UMMEED HINDI NEET | One-Shot | Akhil Goyal Sir Physics NEET | NEET Wallah Hindi', videoUrl: 'https://www.youtube.com/watch?v=8-wgK0zAaqI', duration: '5:20:57' }
    ]
  },
  {
    title: 'Physics Crash Course for NEET - by Alakh sir',
    description: 'Consolidated Physics Crash Course for NEET aspirants taught directly by Alakh Pandey sir.',
    instructor: 'Alakh Pandey',
    category: 'Physics',
    thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600',
    duration: '3h 19m',
    difficulty: 'Intermediate',
    rating: 4.9,
    reviewCount: 3800,
    enrolledCount: 92000,
    videoUrl: 'https://www.youtube.com/watch?v=Cx73VWk_Rak',
    lessons: [
      { title: 'NEET Physics Crash Course || Basic Mathematics | Trigonometry | Differentiation n Integration | Umeed', videoUrl: 'https://www.youtube.com/watch?v=Cx73VWk_Rak', duration: '1:28:24' },
      { title: 'KINEMATICS 01 || Motion in a Straight Line || 1-D Motion || NEET Physics Crash Course', videoUrl: 'https://www.youtube.com/watch?v=k_rCYiorZzs', duration: '1:51:17' }
    ]
  },
  {
    title: 'UMMEED 2026 : Complete Class ORGANIC CHEMISTRY in One Shot - NEET 2026',
    description: 'Complete Class Organic Chemistry in One Shot series for NEET 2026 preparation.',
    instructor: 'Pankaj Sir',
    category: 'Chemistry',
    thumbnail: 'https://images.unsplash.com/photo-1603126852811-376a661614f1?w=600',
    duration: '7h 55m',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 1650,
    enrolledCount: 48000,
    videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg',
    lessons: [
      { title: 'IUPAC Nomenclature in ONE SHOT || All Concepts, Tricks & PYQ || NEET 2026', videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg', duration: '2:52:26' },
      { title: 'Isomerism in ONE SHOT || All Concepts, Tricks & PYQ || NEET 2026', videoUrl: 'https://www.youtube.com/watch?v=3hJ2W6EUMR4', duration: '5:02:56' }
    ]
  }
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
