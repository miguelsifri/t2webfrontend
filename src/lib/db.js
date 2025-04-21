import { openDB } from 'idb';


export const dbPromise = openDB('GaleriaDB', 2, {
  upgrade(db) {
    let store;

    if (!db.objectStoreNames.contains('imagenes')) {
      store = db.createObjectStore('imagenes', {
        keyPath: 'id',
        autoIncrement: true,
      });
      store.createIndex('nombre', 'nombre', { unique: true });
    }
  }
});



export async function addImageToIndexDB(name, blob, pending = false, timestamp = null, location = null) {
  const db = await dbPromise;

  const existing = await db.getAllFromIndex('imagenes', 'nombre');
  const exists = existing.some(img => img.nombre === name);
  if (exists) return;

  await db.put('imagenes', {
    nombre: name,
    blob,
    fecha: Date.now(),
    timestamp,
    lat: location?.lat ?? null,
    lon: location?.lon ?? null,
    pending
  });
}

export async function getPendingImagesFromIndexDB() {
  const db = await dbPromise;
  const all = await db.getAll('imagenes');
  return all.filter(img => img.pending);
}


export async function getAllImagesFromIndexDB() {
  const db = await dbPromise;
  return await db.getAll('imagenes');
}

export async function deleteImageFromIndexDB(name) {
  const db = await dbPromise;
  const all = await db.getAll('imagenes');
  const match = all.find(img => img.nombre === name);
  if (match) {
    await db.delete('imagenes', match.id);
  }
}



