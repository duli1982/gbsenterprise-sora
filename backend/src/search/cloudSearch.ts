import db from '../db/firestore';

interface ModuleDoc {
  id: string;
  title: string;
  description: string;
}

let index: ModuleDoc[] = [];
let indexed = false;

async function loadIndex() {
  const snapshot = await db.collection('modules').get();
  index = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  indexed = true;
}

export async function indexModulesFromFirestore(): Promise<void> {
  await loadIndex();
}

async function ensureIndex(): Promise<void> {
  if (!indexed) {
    await loadIndex();
  }
}

export async function searchModules(query: string): Promise<ModuleDoc[]> {
  await ensureIndex();
  const q = query.toLowerCase();
  return index.filter(m =>
    m.title.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
  );
}

export async function suggestModules(query: string): Promise<string[]> {
  await ensureIndex();
  const q = query.toLowerCase();
  return index
    .filter(m => m.title.toLowerCase().startsWith(q))
    .map(m => m.title);
}
