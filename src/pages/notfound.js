export function renderNotFoundPage() {
  const container = document.createElement('div');
  container.className = 'p-4 text-center';
  container.innerHTML = `
    <h1 class="text-3xl font-bold text-red-600 mb-4">404</h1>
    <p class="text-lg">Página no encontrada</p>
    <a href="#/" class="mt-4 inline-block text-blue-600 underline">Volver a la galería</a>
  `;
  document.body.appendChild(container);
}
