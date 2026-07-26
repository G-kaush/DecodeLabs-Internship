const fs = require('node:fs');
const path = require('node:path');

const rootDir = path.join(__dirname, '..');
const dataDir = path.join(rootDir, 'data');
const dbPath = process.env.DATABASE_PATH || path.join(dataDir, 'skillhub-db.json');

const seedCourses = [
  {
    slug: 'html',
    title: 'HTML & Semantic Web',
    category: 'code',
    level: 'Beginner',
    duration: '3 weeks',
    description: 'Learn page structure, accessibility landmarks, and clean content hierarchy.',
    sortOrder: 1
  },
  {
    slug: 'css',
    title: 'Responsive CSS Mastery',
    category: 'code',
    level: 'Beginner',
    duration: '4 weeks',
    description: 'Use Grid, Flexbox, clamp, and media queries to support every screen size.',
    sortOrder: 2
  },
  {
    slug: 'ui-design',
    title: 'UI Design Foundations',
    category: 'design',
    level: 'Starter',
    duration: '2 weeks',
    description: 'Create warm, readable layouts with spacing, typography, and visual balance.',
    sortOrder: 3
  },
  {
    slug: 'portfolio',
    title: 'Portfolio Launch Kit',
    category: 'career',
    level: 'Practical',
    duration: '2 weeks',
    description: 'Turn your projects into a professional portfolio and prepare for interviews.',
    sortOrder: 4
  },
  {
    slug: 'js',
    title: 'JavaScript Interactions',
    category: 'code',
    level: 'Beginner',
    duration: '3 weeks',
    description: 'Add menus, filters, accordions, validation, and small state-driven features.',
    sortOrder: 5
  },
  {
    slug: 'wireframing',
    title: 'Wireframing for Web',
    category: 'design',
    level: 'Starter',
    duration: '1 week',
    description: 'Plan layouts with low-fidelity wireframes before moving into visual design.',
    sortOrder: 6
  }
];

function createInitialData() {
  return {
    meta: {
      nextEnquiryId: 1,
      createdAt: new Date().toISOString()
    },
    courses: seedCourses,
    enquiries: []
  };
}

function normalizeData(data) {
  const normalized = {
    meta: {
      nextEnquiryId: Number(data?.meta?.nextEnquiryId) || 1,
      createdAt: data?.meta?.createdAt || new Date().toISOString()
    },
    courses: Array.isArray(data?.courses) && data.courses.length > 0 ? data.courses : seedCourses,
    enquiries: Array.isArray(data?.enquiries) ? data.enquiries : []
  };

  const highestId = normalized.enquiries.reduce((max, enquiry) => Math.max(max, Number(enquiry.id) || 0), 0);
  normalized.meta.nextEnquiryId = Math.max(normalized.meta.nextEnquiryId, highestId + 1);

  return normalized;
}

function loadData() {
  fs.mkdirSync(dataDir, { recursive: true });

  if (!fs.existsSync(dbPath)) {
    const initialData = createInitialData();
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
    return initialData;
  }

  const fileContents = fs.readFileSync(dbPath, 'utf8');
  return normalizeData(JSON.parse(fileContents));
}

let database = loadData();

function saveData() {
  database.meta.updatedAt = new Date().toISOString();
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
}

function getCourses() {
  return [...database.courses].sort((first, second) => {
    return (first.sortOrder || 0) - (second.sortOrder || 0) || first.title.localeCompare(second.title);
  });
}

function findCourse(slug) {
  return database.courses.find((course) => course.slug === slug);
}

function createEnquiry(enquiry) {
  const now = new Date().toISOString();
  const savedEnquiry = {
    id: database.meta.nextEnquiryId,
    name: enquiry.name,
    email: enquiry.email,
    course: enquiry.course,
    message: enquiry.message,
    status: 'new',
    createdAt: now
  };

  database.meta.nextEnquiryId += 1;
  database.enquiries.push(savedEnquiry);
  saveData();

  return savedEnquiry;
}

function getEnquiries(limit = 25) {
  return [...database.enquiries]
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, limit)
    .map((enquiry) => {
      const course = findCourse(enquiry.course);
      return {
        ...enquiry,
        courseTitle: course ? course.title : enquiry.course
      };
    });
}

function getStats() {
  return {
    courses: database.courses.length,
    enquiries: database.enquiries.length,
    path: dbPath
  };
}

module.exports = {
  createEnquiry,
  findCourse,
  getCourses,
  getEnquiries,
  getStats
};
