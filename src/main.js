import { router } from './router.js';
import './style.css';
import { API_URL } from './config.js';


console.log("API_URL:", API_URL) // ← falta un paréntesis o punto y coma
console.log('main.js cargado')
window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);

// if ('serviceWorker' in navigator && import.meta.env.PROD) {
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered:', reg))
      .catch(err => console.error('[SW] Registration failed:', err));
  });
}

navigator.serviceWorker.ready.then(async (reg) => {
  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('BF_rJlyHtR9-loT7pX5YEA8brsLlDtgME2ZX4dI0fu7zwrpA_8BP3xErit66X95bv8xzjYuGpw4NO_KtzDY3LZk')
  });

  await fetch(`${API_URL}/suscribe`, {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: {
      'Content-Type': 'application/json'
    }
  });
});

// helper necesario
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const raw = atob(base64);
  return new Uint8Array([...raw].map(char => char.charCodeAt(0)));
}
