import { createAlert } from "../components/alert";
import { addImageToIndexDB } from "../lib/db";
import { API_URL } from '../config.js';
import { getLocationAndTime } from "../utils/getLocationAndTime";

export function renderUploadPage(container) {
  container.innerHTML = `
    <div id="upload-form">
      <form id="uploadForm" class="max-w-md mx-auto bg-white p-6 rounded shadow space-y-6 mt-4">
        <input type="file" id="fileInput" accept="image/*" 
              class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                      file:rounded-full file:border-0 file:text-sm file:font-semibold 
                      file:bg-blue-600 file:text-white hover:file:bg-blue-700" required />
        
        <div id="preview" class="w-full aspect-square flex items-center justify-center bg-gray-100 border border-dashed border-gray-400 rounded"></div>
        
        <button type="submit" 
                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
          Subir Imagen
        </button>
      </form>
      </div>
  `;

  const form = container.querySelector('#uploadForm');
  const fileInput = container.querySelector('#fileInput');
  const preview = container.querySelector('#preview');

  // Evento para actualizar preview
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    preview.innerHTML = ''; // limpia preview anterior

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'max-h-full max-w-full object-contain rounded';
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      preview.textContent = 'Archivo no válido';
    }
  });

  // Submit del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = fileInput.files[0];
    if (!file) return;
  
    const nombreGenerado = `${Date.now()}-${file.name}`;
  
    if (!navigator.onLine) {
      await addImageToIndexDB(nombreGenerado, file, true);
      alert('Imagen guardada localmente. Se subirá cuando vuelvas a estar online.');
      window.location.hash = '#/';
      return;
    }

    const { location, timestamp } = await getLocationAndTime();
  
    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitud', location?.lat ?? '');
    formData.append('longitud', location?.lon ?? '');
    formData.append('timestamp', timestamp);
  
    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });
  
      if (res.ok) {
        const data = await res.json();
        const nombreDesdeBackend = data.path.split('/').pop();
        await addImageToIndexDB(nombreDesdeBackend, file, false, timestamp, location);
        alert('Imagen subida y guardada correctamente.');
        window.location.hash = '#/';
      } else {
        alert('Error al subir la imagen.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Falla de red durante la subida.');
    }
  });
  
}

function updateUploadViewStatus() {
  const uploadForm = document.getElementById('upload-form');

  const existingAlert = document.getElementById('global-alert');
  if (existingAlert) existingAlert.remove();

  if (uploadForm) {
    if (!navigator.onLine) {
      uploadForm.classList.add('hidden');
  
      const alert = createAlert('⚠️ No se pueden subir imágenes sin conexión a internet.', 'error');
      alert.id = 'global-alert';
      document.body.appendChild(alert);
    } else {
      uploadForm.classList.remove('hidden');
    }
  }
}

window.addEventListener('load', updateUploadViewStatus);
window.addEventListener('online', updateUploadViewStatus);
window.addEventListener('offline', updateUploadViewStatus);