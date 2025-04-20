export function createModal(imageUrl) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50';

  const img = document.createElement('img');
  img.src = imageUrl;
  img.className = 'max-w-full max-h-[90vh] rounded shadow-lg';

  overlay.appendChild(img);

  // Cierra modal al hacer clic fuera de la imagen
  overlay.addEventListener('click', () => overlay.remove());

  document.body.appendChild(overlay);
}
