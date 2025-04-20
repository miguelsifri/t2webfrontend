import { createModal } from '../components/modal.js';
import { getAllImagesFromIndexDB, addImageToIndexDB, deleteImageFromIndexDB } from '../lib/db.js';
import { syncIndexDBWithBackend } from '../utils/syncIndexDBWithBackend.js';
import { API_URL } from '../config.js';

window.addEventListener('online', async () => {
  console.log('[Sync] Online – syncing with backend...');
  await syncIndexDBWithBackend();
});

export async function renderGalleryPage(container) {
  container.innerHTML = `
    <div id="gallery" class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mt-4"></div>
  `;

  document.body.appendChild(container);
  const gallery = document.getElementById('gallery');

  if (!navigator.onLine) {
    // 🟠 Modo offline: mostrar imágenes desde IndexedDB
    const images = await getAllImagesFromIndexDB();
  
    if (images.length === 0) {
      gallery.innerHTML = `
        <div class="col-span-full text-center text-gray-500">
          No hay imágenes disponibles sin conexión.
        </div>`;
      return;
    }
  
    images.forEach(img => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded shadow flex flex-col items-center justify-center aspect-square p-4 space-y-2';
  
      const el = document.createElement('img');
      el.src = URL.createObjectURL(img.blob);
      el.alt = img.nombre;
      el.className = 'h-4/5 object-contain cursor-pointer transition hover:scale-105 duration-200';
      el.addEventListener('click', () => createModal(el.src));
  
      const btnContainer = document.createElement('div');
      btnContainer.className = 'flex gap-2 mt-2 w-full justify-center';
  
      const shareBtn = document.createElement('button');
      shareBtn.innerHTML = '📤 <span>Compartir</span>';
      shareBtn.className = 'flex items-center gap-1 justify-center bg-blue-300 text-white text-sm px-4 py-2 rounded w-28 opacity-50 cursor-not-allowed';
      shareBtn.disabled = true;
      shareBtn.title = 'No disponible sin conexión';
  
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️ <span>Eliminar</span>';
      deleteBtn.className = 'flex items-center gap-1 justify-center bg-red-300 text-white text-sm px-4 py-2 rounded w-28 opacity-50 cursor-not-allowed';
      deleteBtn.disabled = true;
      deleteBtn.title = 'No disponible sin conexión';
  
      btnContainer.appendChild(shareBtn);
      btnContainer.appendChild(deleteBtn);
      card.appendChild(el);
      card.appendChild(btnContainer);
      gallery.appendChild(card);
    });
  }
  

  else {
    // 🟢 Modo online: cargar imágenes desde backend
    fetch(`${API_URL}/gallery`)
      .then(res => res.json())
      .then(async images => {
        for (const img of images) {
          const imageUrl = `${API_URL}${img}`;

          const card = document.createElement('div');
          card.className = 'bg-white rounded shadow flex flex-col items-center justify-center aspect-square p-4 space-y-2';

          const el = document.createElement('img');
          el.src = imageUrl;
          el.className = 'h-4/5 object-contain cursor-pointer transition hover:scale-105 duration-200';
          el.addEventListener('click', () => createModal(el.src));

          const btnContainer = document.createElement('div');
          btnContainer.className = 'flex gap-2 mt-2 w-full justify-center';

          // Compartir
          const shareBtn = document.createElement('button');
          shareBtn.innerHTML = '📤 <span>Compartir</span>';
          shareBtn.className = 'flex items-center gap-1 justify-center bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 w-28';
          shareBtn.addEventListener('click', () => {
            if (navigator.share) {
              navigator.share({
                title: 'Imagen compartida',
                text: 'Mira esta foto de la galería',
                url: el.src
              }).catch(err => console.error('Error al compartir:', err));
            } else {
              alert('Tu navegador no soporta la Web Share API');
            }
          });

          // Eliminar
          const deleteBtn = document.createElement('button');
          deleteBtn.innerHTML = '🗑️ <span>Eliminar</span>';
          deleteBtn.className = 'flex items-center gap-1 justify-center bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700 w-28';
          deleteBtn.onclick = async () => {
            const confirmDelete = confirm('¿Seguro que quieres eliminar esta imagen?');
            if (confirmDelete) {
              const filename = img.split('/').pop();
              const res = await fetch(`${API_URL}/delete/${filename}`, {
                method: 'DELETE'
              });

              if (res.ok) {
                await deleteImageFromIndexDB(filename);
                alert('Imagen eliminada');
                card.remove();
              } else {
                alert('Error al eliminar la imagen');
              }
            }
          };

          // Agrega botones al contenedor
          btnContainer.appendChild(shareBtn);
          btnContainer.appendChild(deleteBtn);
          card.appendChild(el);
          card.appendChild(btnContainer);
          gallery.appendChild(card);

          // Guardar en IndexedDB para uso offline
          try {
            const blob = await fetch(imageUrl).then(r => r.blob());
            await addImageToIndexDB(imageUrl.split('/').pop(), blob);
          } catch (err) {
            console.error(`Error al guardar ${imageUrl} en IndexedDB:`, err);
          }
        }
      })
      .catch(err => {
        gallery.innerHTML = `
          <div class="col-span-full text-center text-red-500">
            Error al cargar imágenes desde el servidor.
          </div>`;
        console.error('Error fetching gallery:', err);
      });
  }
}
