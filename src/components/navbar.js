import { API_URL } from '../config.js';


export function renderNavbar(target) {
  target.className = 'bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow w-full';

  const navHTML = `
    <div class="text-xl font-bold">Galería Compartida</div>
    <div class="flex gap-4 text-sm items-center">
      <a href="#/" class="hover:text-blue-300">Galería</a>
      <a href="#/upload" class="hover:text-blue-300">Subir</a>
      <button id="notif-btn" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded hidden">
        🔔 Activar Notificaciones
      </button>
    </div>
  `;

  target.innerHTML = navHTML;

  // Mostrar botón solo si está en estado "default"
  if (Notification.permission === 'default') {
    const btn = document.getElementById('notif-btn');
    btn.classList.remove('hidden');

    btn.addEventListener('click', async () => {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('No se otorgaron permisos de notificaciones.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        btn.classList.add('hidden');
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('TU_CLAVE_PUBLICA') // 👈 Reemplaza
      });

      await fetch(`${API_URL}/suscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      alert('✅ Notificaciones activadas');
      btn.classList.add('hidden');
    });
  }
}

// helper global (puedes moverlo a otro archivo si prefieres)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}
