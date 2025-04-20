import { renderUploadPage } from './pages/upload.js';
import { renderGalleryPage } from './pages/gallery.js';
import { renderNotFoundPage } from './pages/notfound.js';
import { renderNavbar } from './components/navbar.js';

export function router() {
  // Limpia el contenido anterior
  document.body.innerHTML = '';

  // Crea estructura base
  const navbar = document.createElement('div');
  const main = document.createElement('main');
  main.id = 'main-content';
  document.body.append(navbar, main); // Añade navbar y main

  // Inserta navbar
  renderNavbar(navbar);

  // Decide qué vista renderizar
  const route = window.location.hash;

  if (route === '#/upload') {
    renderUploadPage(main);
  } else if (route === '#/' || route === '') {
    renderGalleryPage(main);
  } else {
    renderNotFoundPage(main);
  }
}

