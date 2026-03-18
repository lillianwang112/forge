import { openDB } from 'idb';

const DB_NAME = 'forge-db';
const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Progress store
        if (!db.objectStoreNames.contains('progress')) {
          const progressStore = db.createObjectStore('progress', { keyPath: 'id' });
          progressStore.createIndex('trackId', 'trackId', { unique: false });
          progressStore.createIndex('completed', 'completed', { unique: false });
        }

        // Code snapshots store
        if (!db.objectStoreNames.contains('code-snapshots')) {
          const snapshotStore = db.createObjectStore('code-snapshots', { keyPath: 'id' });
          snapshotStore.createIndex('lessonId', 'lessonId', { unique: false });
        }

        // SRS cards store
        if (!db.objectStoreNames.contains('srs-cards')) {
          const srsStore = db.createObjectStore('srs-cards', { keyPath: 'conceptId' });
          srsStore.createIndex('nextReview', 'nextReview', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// ---- Progress ----

export async function saveProgress(data) {
  const db = await getDB();
  return db.put('progress', data);
}

export async function getProgress(id) {
  const db = await getDB();
  return db.get('progress', id);
}

export async function getAllProgress(trackId) {
  const db = await getDB();
  if (trackId) {
    return db.getAllFromIndex('progress', 'trackId', trackId);
  }
  return db.getAll('progress');
}

// ---- Code Snapshots ----

export async function saveCodeSnapshot(data) {
  const db = await getDB();
  return db.put('code-snapshots', data);
}

export async function getCodeSnapshot(id) {
  const db = await getDB();
  return db.get('code-snapshots', id);
}

// ---- SRS Cards ----

export async function saveSRSCard(data) {
  const db = await getDB();
  return db.put('srs-cards', data);
}

export async function getDueCards(now) {
  const db = await getDB();
  const all = await db.getAll('srs-cards');
  return all.filter((card) => card.nextReview <= now);
}

export async function getAllCards() {
  const db = await getDB();
  return db.getAll('srs-cards');
}

// ---- Settings ----

export async function setSetting(key, value) {
  const db = await getDB();
  return db.put('settings', { key, value });
}

export async function getSetting(key) {
  const db = await getDB();
  const record = await db.get('settings', key);
  return record?.value;
}
