import { deleteImageFromIndexDB, getAllImagesFromIndexDB, addImageToIndexDB } from '../lib/db.js';
import { API_URL } from '../config.js';

export async function syncIndexDBWithBackend() {
  try {
    const res = await fetch(`${API_URL}/gallery`);

    const localImages = await getAllImagesFromIndexDB();

    for (const localImage of localImages) {
      if (localImage.pending) {
        const formData = new FormData();
        formData.append('image', localImage.blob, localImage.nombre);
        console.log(`Subiendo ${localImage.nombre}...`);

        try {
          const uploadRes = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
          });

          if (uploadRes.ok) {
            await deleteImageFromIndexDB(localImage.nombre);
            await addImageToIndexDB(localImage.nombre, localImage.blob, false); 
            console.log(`✅ Imagen sincronizada: ${localImage.nombre}`);
          } else {
            console.warn(`❌ Falló al subir: ${localImage.nombre}`);
          }
        } catch (err) {
          console.warn(`🚫 Error de red subiendo ${localImage.nombre}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync IndexedDB:', err);
  }
}
