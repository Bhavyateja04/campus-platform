/**
 * Seed a handful of sample notifications so AlertsScreen has live content.
 * Idempotent: removes prior seeded entries first (matched by `seed: true` in body? we
 * don't have such a field, so we instead clear by titles below).
 *
 * Run from server/ directory:
 *   node scripts/seedNotifications.js
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Notification = require('../src/models/NotificationModel');

const SEED = [
  {
    title: 'Mid Semester Exams',
    body: 'Mid semester exams scheduled from Nov 18–24. Hall tickets available in Exam Locator.',
    type: 'Academic',
    icon: 'book-outline',
    color: '#4A6FA5',
  },
  {
    title: 'Hackathon 2026 — Registration Open',
    body: 'Register before Nov 15 for the Annual University Hackathon. Prizes worth ₹2 Lakh.',
    type: 'Events',
    icon: 'trophy-outline',
    color: '#E07B3A',
  },
  {
    title: 'Coding Club — Weekly Meet',
    body: 'This Saturday at 10AM in Lab 3. Topic: Competitive Programming with C++.',
    type: 'Clubs',
    icon: 'people-outline',
    color: '#6A1B9A',
  },
  {
    title: 'Library Hours Extended',
    body: 'Library will remain open till 10 PM during exam season (Nov 14–24).',
    type: 'Academic',
    icon: 'library-outline',
    color: '#4A6FA5',
  },
  {
    title: 'Campix v1.1.0 Available',
    body: 'New version 1.1.0 ships with Campus Memories and an improved Lost & Found.',
    type: 'System',
    icon: 'settings-outline',
    color: '#00796B',
  },
];

async function main() {
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI missing in server/.env');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const titles = SEED.map((s) => s.title);
  const removed = await Notification.deleteMany({ title: { $in: titles }, audience: 'all' });
  console.log(`Removed ${removed.deletedCount} existing seed notifications.`);

  const created = await Notification.insertMany(
    SEED.map((s) => ({ ...s, audience: 'all', readBy: [] }))
  );
  console.log(`Inserted ${created.length} notifications.`);

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
