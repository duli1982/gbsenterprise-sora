import db from '../src/db/firestore';

const modules = [
  { title: 'Intro to GBS', description: 'Welcome module' },
  { title: 'Advanced Processes', description: 'Deep dive' },
];

async function seed() {
  const batch = db.batch();
  modules.forEach(mod => {
    const ref = db.collection('modules').doc();
    batch.set(ref, mod);
  });
  await batch.commit();
  console.log('Seeded modules');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
