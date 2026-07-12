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
    title: 'Class 11 Physics: Complete Master Course',
    description: 'Complete Class 11 Physics for NEET/JEE. This comprehensive course covers Kinematics, Laws of Motion, Work Energy Power, Rotational Mechanics, Gravitation, Properties of Matter, and Thermodynamics with detailed one-shot long-format lectures.',
    instructor: 'Alakh Pandey',
    category: 'Physics',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600',
    duration: '85h 30m',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 24500,
    enrolledCount: 145000,
    videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM',
    lessons: [
      { title: 'Mathematical Tools & Vector Algebra', videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM', duration: '5:15:30' },
      { title: 'Kinematics 1D & 2D (One Shot)', videoUrl: 'https://www.youtube.com/watch?v=8-wgK0zAaqI', duration: '8:22:15' },
      { title: 'Laws of Motion & Friction', videoUrl: 'https://www.youtube.com/watch?v=Cx73VWk_Rak', duration: '7:35:40' },
      { title: 'Work, Energy, and Power', videoUrl: 'https://www.youtube.com/watch?v=k_rCYiorZzs', duration: '6:28:10' },
      { title: 'Rotational Dynamics & Center of Mass', videoUrl: 'https://www.youtube.com/watch?v=rfscVS0vtbw', duration: '9:45:00' },
      { title: 'Gravitation & Planetary Motion', videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8', duration: '5:50:30' },
      { title: 'Fluid Mechanics & Properties of Matter', videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg', duration: '8:30:15' },
      { title: 'Thermodynamics & Kinetic Theory', videoUrl: 'https://www.youtube.com/watch?v=UO98lJQ3QGI', duration: '7:15:00' },
      { title: 'Oscillations & Waves (One Shot)', videoUrl: 'https://www.youtube.com/watch?v=PkZNo7MFNFg', duration: '8:10:45' }
    ]
  },
  {
    title: 'Class 12 Physics: Complete Master Course',
    description: 'Complete Class 12 Physics syllabus. Covers Electrostatics, Current Electricity, Magnetism, Electromagnetic Induction, AC, Ray & Wave Optics, Modern Physics, and Semiconductor Electronics in deep detail.',
    instructor: 'Alakh Pandey',
    category: 'Physics',
    thumbnail: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?w=600',
    duration: '92h 15m',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 28900,
    enrolledCount: 168000,
    videoUrl: 'https://www.youtube.com/watch?v=30CYAV6YSbk',
    lessons: [
      { title: 'Electrostatics & Electric Fields', videoUrl: 'https://www.youtube.com/watch?v=30CYAV6YSbk', duration: '9:35:00' },
      { title: 'Electric Potential & Capacitance', videoUrl: 'https://www.youtube.com/watch?v=vn3tm0quoqE', duration: '6:50:30' },
      { title: 'Current Electricity (Complete Chapter)', videoUrl: 'https://www.youtube.com/watch?v=9kRgVxULbag', duration: '8:10:00' },
      { title: 'Moving Charges, Magnetism & Matter', videoUrl: 'https://www.youtube.com/watch?v=ur6I5m2nTvk', duration: '9:20:00' },
      { title: 'Electromagnetic Induction & Alternating Current', videoUrl: 'https://www.youtube.com/watch?v=nQVCkqvU1uE', duration: '8:45:30' },
      { title: 'Ray Optics & Optical Instruments', videoUrl: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc', duration: '11:45:00' },
      { title: 'Wave Optics (Complete Lecture)', videoUrl: 'https://www.youtube.com/watch?v=9kRgVxULbag', duration: '7:15:30' },
      { title: 'Modern Physics (Dual Nature, Atoms, Nuclei)', videoUrl: 'https://www.youtube.com/watch?v=25jxGPMF1rM', duration: '12:15:00' },
      { title: 'Semiconductor Electronics & Logic Gates', videoUrl: 'https://www.youtube.com/watch?v=8-wgK0zAaqI', duration: '8:10:45' }
    ]
  },
  {
    title: 'Class 11 Chemistry: Complete Master Course',
    description: 'Master Class 11 Chemistry. Highly detailed modules on Some Basic Concepts (Mole Concept), Structure of Atom, Periodic Classification, Chemical Bonding, States of Matter, Thermodynamics, Equilibrium, Redox, s-block, p-block, Organic Chemistry Basics (GOC), and Hydrocarbons.',
    instructor: 'Pankaj Sir',
    category: 'Chemistry',
    thumbnail: 'https://images.unsplash.com/photo-1603126852811-376a661614f1?w=600',
    duration: '78h 40m',
    difficulty: 'Intermediate',
    rating: 4.8,
    reviewCount: 19800,
    enrolledCount: 112000,
    videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg',
    lessons: [
      { title: 'Mole Concept & Stoichiometry', videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg', duration: '6:10:00' },
      { title: 'Atomic Structure One Shot', videoUrl: 'https://www.youtube.com/watch?v=3hJ2W6EUMR4', duration: '7:45:30' },
      { title: 'Classification of Elements & Periodicity', videoUrl: 'https://www.youtube.com/watch?v=04lpu10ldrQ', duration: '4:30:00' },
      { title: 'Chemical Bonding & Hybridization', videoUrl: 'https://www.youtube.com/watch?v=W8dAATfMKtg', duration: '9:50:45' },
      { title: 'Chemical Thermodynamics & Energetics', videoUrl: 'https://www.youtube.com/watch?v=04lpu10ldrQ', duration: '8:15:00' },
      { title: 'Chemical & Ionic Equilibrium', videoUrl: 'https://www.youtube.com/watch?v=3hJ2W6EUMR4', duration: '10:20:00' },
      { title: 'General Organic Chemistry (GOC) - Parts 1 & 2', videoUrl: 'https://www.youtube.com/watch?v=W8dAATfMKtg', duration: '11:20:00' },
      { title: 'Hydrocarbons (Alkanes, Alkenes, Alkynes)', videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg', duration: '9:45:15' }
    ]
  },
  {
    title: 'Class 12 Chemistry: Complete Master Course',
    description: 'Complete Class 12 Chemistry preparation. Detailed organic, inorganic, and physical chemistry modules covering Solutions, Electrochemistry, Chemical Kinetics, d- & f- Block Elements, Coordination Compounds, Haloalkanes, Alcohols, Aldehydes, Amines, and Biomolecules.',
    instructor: 'Pankaj Sir',
    category: 'Chemistry',
    thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600',
    duration: '84h 15m',
    difficulty: 'Advanced',
    rating: 4.9,
    reviewCount: 22400,
    enrolledCount: 135000,
    videoUrl: 'https://www.youtube.com/watch?v=9kRgVxULbag',
    lessons: [
      { title: 'Solutions & Colligative Properties', videoUrl: 'https://www.youtube.com/watch?v=dN6safFWWPg', duration: '6:30:00' },
      { title: 'Electrochemistry (Full Concept)', videoUrl: 'https://www.youtube.com/watch?v=9kRgVxULbag', duration: '8:15:00' },
      { title: 'Chemical Kinetics & Rate Laws', videoUrl: 'https://www.youtube.com/watch?v=obH0Po_RGBk', duration: '7:45:30' },
      { title: 'Coordination Compounds One Shot', videoUrl: 'https://www.youtube.com/watch?v=3hJ2W6EUMR4', duration: '8:20:00' },
      { title: 'Haloalkanes and Haloarenes Mechanisms', videoUrl: 'https://www.youtube.com/watch?v=ur6I5m2nTvk', duration: '7:30:00' },
      { title: 'Alcohols, Phenols and Ethers', videoUrl: 'https://www.youtube.com/watch?v=nQVCkqvU1uE', duration: '9:20:15' },
      { title: 'Aldehydes, Ketones and Carboxylic Acids', videoUrl: 'https://www.youtube.com/watch?v=5LrDIWkK_Bc', duration: '11:15:40' },
      { title: 'Amines & Nitrogen Containing Compounds', videoUrl: 'https://www.youtube.com/watch?v=obH0Po_RGBk', duration: '6:50:00' },
      { title: 'Biomolecules & Polymers', videoUrl: 'https://www.youtube.com/watch?v=9kRgVxULbag', duration: '7:40:00' }
    ]
  },
  {
    title: 'Class 11 Biology: Complete Master Course',
    description: 'Learn Class 11 Biology with visual conceptual clarity. Covers Diversity in Living World, Structural Organisation in Plants & Animals, Cell Structure and Function (Biomolecules, Division), Plant Physiology, and Human Physiology (7 high-yield chapters).',
    instructor: 'Tarun Sir & MD Sir',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600',
    duration: '96h 20m',
    difficulty: 'Beginner',
    rating: 4.9,
    reviewCount: 31200,
    enrolledCount: 185000,
    videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4',
    lessons: [
      { title: 'The Living World & Biological Classification', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '7:10:00' },
      { title: 'Plant Kingdom & Animal Kingdom', videoUrl: 'https://www.youtube.com/watch?v=lMwdorFoGtk', duration: '9:50:30' },
      { title: 'Morphology & Anatomy of Flowering Plants', videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4', duration: '8:40:00' },
      { title: 'Cell: Structure, Function & Division', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '9:15:00' },
      { title: 'Biomolecules One Shot Lecture', videoUrl: 'https://www.youtube.com/watch?v=lMwdorFoGtk', duration: '6:30:00' },
      { title: 'Plant Physiology (Photosynthesis, Respiration, Growth)', videoUrl: 'https://www.youtube.com/watch?v=ynUK8zXMulY', duration: '11:50:00' },
      { title: 'Human Physiology Part 1 (Digestion, Respiration, Circulation)', videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4', duration: '12:15:00' },
      { title: 'Human Physiology Part 2 (Excretion, Locomotion, Control, Integration)', videoUrl: 'https://www.youtube.com/watch?v=ynUK8zXMulY', duration: '13:20:30' }
    ]
  },
  {
    title: 'Class 12 Biology: Complete Master Course',
    description: 'Class 12 Biology syllabus for medical exams. Thoroughly covers Reproduction in Organisms, Flowering Plants and Humans, Reproductive Health, Genetics and Evolution (Principles of Inheritance, Molecular Basis, Evolution), Biology in Human Welfare, Biotechnology and its Applications, and Ecology.',
    instructor: 'Tarun Sir & MD Sir',
    category: 'Biology',
    thumbnail: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600',
    duration: '88h 45m',
    difficulty: 'Intermediate',
    rating: 4.9,
    reviewCount: 29400,
    enrolledCount: 172000,
    videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4',
    lessons: [
      { title: 'Sexual Reproduction in Flowering Plants', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '8:25:00' },
      { title: 'Human Reproduction & Reproductive Health', videoUrl: 'https://www.youtube.com/watch?v=lMwdorFoGtk', duration: '9:40:00' },
      { title: 'Principles of Inheritance and Variation', videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4', duration: '10:40:00' },
      { title: 'Molecular Basis of Inheritance (Deep Dive)', videoUrl: 'https://www.youtube.com/watch?v=ynUK8zXMulY', duration: '12:15:30' },
      { title: 'Evolution: Theories and Evidence', videoUrl: 'https://www.youtube.com/watch?v=ZCEs2xWnvl4', duration: '7:50:00' },
      { title: 'Human Health and Disease & Microbes', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '9:30:00' },
      { title: 'Biotechnology: Principles and Recombinant DNA', videoUrl: 'https://www.youtube.com/watch?v=h93t-Y8JAT4', duration: '9:30:00' },
      { title: 'Ecology & Environment (Ecosystems, Biodiversity, Conservation)', videoUrl: 'https://www.youtube.com/watch?v=lMwdorFoGtk', duration: '11:20:30' }
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
