// GestiónEstudiantil: interacciones básicas del landing page.
'use strict';

// 1. Seleccionamos los elementos del HTML que necesitamos controlar.
const menuToggle = document.querySelector('#menuToggle');
const navLinks = document.querySelector('#navLinks');
const demoDialog = document.querySelector('#demoDialog');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogMessage = document.querySelector('#dialogMessage');
const currentYear = document.querySelector('#currentYear');

// 2. Mostramos automáticamente el año actual en el pie de página.
currentYear.textContent = new Date().getFullYear();

// 3. Abrimos y cerramos el menú de navegación en pantallas pequeñas.
menuToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  menuToggle.textContent = isOpen ? '×' : '☰';
});

// Al elegir un enlace, ocultamos el menú móvil.
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menú');
    menuToggle.textContent = '☰';
  });
});

// 4. Mostramos mensajes de demostración al pulsar los botones principales.
// No hay autenticación real: eso requeriría un backend y una base de datos.
document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'login') {
      dialogTitle.textContent = 'Iniciar sesión';
      dialogMessage.textContent = 'La pantalla de acceso es una demostración. Para autenticar usuarios se necesita conectar un backend seguro.';
    } else if (action === 'start') {
      dialogTitle.textContent = '¡Comencemos!';
      dialogMessage.textContent = 'El landing page está listo como prototipo. El siguiente paso sería construir los módulos de estudiantes, asignaturas, asistencia y reportes.';
    }

    demoDialog.showModal();
  });
});

// 5. Marcamos el enlace de navegación correspondiente a la sección visible.
const sections = document.querySelectorAll('main section[id], main section');
const navItems = document.querySelectorAll('.nav-link');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const sectionId = entry.target.id;
    navItems.forEach((item) => {
      const isCurrent = item.getAttribute('href') === `#${sectionId}`;
      item.classList.toggle('active', isCurrent);
    });
  });
}, { rootMargin: '-35% 0px -55% 0px' });

document.querySelectorAll('#inicio, #caracteristicas, #como-funciona, #contacto').forEach((section) => {
  observer.observe(section);
});
