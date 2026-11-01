// GestiónEstudiantil: interacciones del landing.
'use strict';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const menuToggle = document.querySelector('#menuToggle');
const menuLabel = document.querySelector('#menuLabel');
const navLinks = document.querySelector('#navLinks');
const demoDialog = document.querySelector('#demoDialog');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogMessage = document.querySelector('#dialogMessage');
const currentYear = document.querySelector('#currentYear');
const header = document.querySelector('.site-header');

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* Header: sombra al salir del inicio. */
if (header) {
  const syncHeader = () => header.classList.toggle('scrolled', window.scrollY > 8);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}

/* Menú móvil con estado accesible e icono coherente. */
const setMenuState = (open) => {
  if (!menuToggle || !navLinks) return;

  navLinks.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');

  const icon = menuToggle.querySelector('use');
  if (icon) icon.setAttribute('href', open ? '#i-close' : '#i-menu');
  if (menuLabel) menuLabel.textContent = open ? 'Cerrar' : 'Menú';
};

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    setMenuState(!navLinks.classList.contains('open'));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuState(false);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenuState(false);
  });
}

/* Diálogo honesto: el prototipo no tiene autenticación ni canal de contacto. */
const dialogContent = {
  login: {
    title: 'Entrar',
    icon: '#i-lock',
    message: 'El acceso forma parte del prototipo: todavía no hay autenticación ni datos reales. Puedes ver cómo se vería el ciclo en la sección “Así se ve”.'
  },
  contact: {
    title: 'Contacto',
    icon: '#i-mail',
    message: 'Este es un prototipo demostrativo y el canal de contacto aún no está configurado. Sustituye este aviso por un correo real antes de publicar.'
  }
};

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    if (!demoDialog || !dialogTitle || !dialogMessage) return;

    const content = dialogContent[button.dataset.action] || dialogContent.login;
    dialogTitle.textContent = content.title;
    dialogMessage.textContent = content.message;

    const dialogIcon = demoDialog.querySelector('.icon-tile use');
    if (dialogIcon) dialogIcon.setAttribute('href', content.icon);

    setMenuState(false);

    if (!demoDialog.open) demoDialog.showModal();
  });
});

if (demoDialog) {
  demoDialog.addEventListener('click', (event) => {
    if (event.target === demoDialog) demoDialog.close();
  });
}

/* Contadores: solo cuando el panel entra en pantalla. */
const formatNumber = (value, decimals) =>
  value.toFixed(decimals).replace('.', ',');

const animateCounter = (element) => {
  if (element.dataset.done === 'true') return;
  element.dataset.done = 'true';

  const target = Number.parseFloat(element.dataset.count);
  if (Number.isNaN(target)) return;

  const decimals = Number.parseInt(element.dataset.decimals || '0', 10);
  const suffix = element.dataset.suffix || '';
  const finalText = formatNumber(target, decimals) + suffix;

  if (reduceMotion || !('requestAnimationFrame' in window)) {
    element.textContent = finalText;
    return;
  }

  const duration = 900;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatNumber(target * eased, decimals) + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = finalText;
    }
  };

  requestAnimationFrame(step);
};

const animateCounters = (root) => {
  root.querySelectorAll('[data-count]').forEach(animateCounter);
};

/* Pestañas: ratón, teclado y paneles accesibles. */
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const tabPanels = tabs
  .map((tab) => document.getElementById(tab.getAttribute('aria-controls')))
  .filter(Boolean);

const activateTab = (tab, options = {}) => {
  tabs.forEach((item) => {
    const selected = item === tab;
    const panel = document.getElementById(item.getAttribute('aria-controls'));

    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;

    if (panel) {
      panel.hidden = !selected;
      if (selected) panel.classList.add('in');
    }
  });

  const activePanel = document.getElementById(tab.getAttribute('aria-controls'));
  if (activePanel) animateCounters(activePanel);
  if (options.focus) tab.focus();
};

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));

  tab.addEventListener('keydown', (event) => {
    let nextIndex = null;

    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    activateTab(tabs[nextIndex], { focus: true });
  });
});

/* Barra de progreso de lectura en el header. */
{
  const root = document.documentElement;
  const setProgress = () => {
    const max = root.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    root.style.setProperty('--progress', value.toFixed(4));
  };

  setProgress();
  window.addEventListener('scroll', setProgress, { passive: true });
  window.addEventListener('resize', setProgress);
}

/* Roles: cambia la vista de ejemplo del hero entre docentes y dirección. */
const roleTabs = Array.from(document.querySelectorAll('.role-tab'));
const roleViews = Array.from(document.querySelectorAll('.hero-role-view'));

if (roleTabs.length && roleViews.length) {
  const setRole = (role) => {
    roleTabs.forEach((tab) => {
      tab.setAttribute('aria-pressed', String(tab.dataset.role === role));
    });

    roleViews.forEach((view) => {
      view.hidden = view.dataset.roleView !== role;
    });
  };

  roleTabs.forEach((tab) => {
    tab.addEventListener('click', () => setRole(tab.dataset.role));
  });
}

/* Parallax sutil en los chips del hero, solo con puntero fino. */
const hero = document.querySelector('.hero');

if (hero && !reduceMotion
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  hero.addEventListener('mousemove', (event) => {
    const rect = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3));
    hero.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3));
  });

  hero.addEventListener('mouseleave', () => {
    hero.style.setProperty('--mx', '0');
    hero.style.setProperty('--my', '0');
  });
}

/* Reveal al hacer scroll. Sin IntersectionObserver, todo visible. */
const revealItems = Array.from(document.querySelectorAll('[data-reveal]'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0 });

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('in'));
}

/* El panel visible se activa cuando la sección "Así se ve" aparece. */
const seePanel = document.querySelector('.see-panel');
const initialPanel = tabPanels.find((panel) => !panel.hidden);

if (seePanel && initialPanel) {
  if ('IntersectionObserver' in window && !reduceMotion) {
    const panelObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        initialPanel.classList.add('in');
        animateCounters(initialPanel);
        panelObserver.disconnect();
      });
    }, { threshold: 0.1 });

    panelObserver.observe(seePanel);
  } else {
    initialPanel.classList.add('in');
    animateCounters(initialPanel);
  }
}

/* Enlace activo del menú según la sección visible. */
const navItems = Array.from(document.querySelectorAll('.nav-link'));
const navTargets = navItems
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter((item) => item.section);

if (navTargets.length) {
  let ticking = false;

  const syncNav = () => {
    ticking = false;
    const line = window.innerHeight * 0.42;

    const current = navTargets.reduce((active, item) => {
      const rect = item.section.getBoundingClientRect();
      return rect.top <= line && rect.bottom > line ? item : active;
    }, null);

    navItems.forEach((link) => {
      link.classList.toggle('active', Boolean(current) && current.link === link);
    });
  };

  const requestSync = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(syncNav);
  };

  syncNav();
  window.addEventListener('scroll', requestSync, { passive: true });
  window.addEventListener('resize', requestSync);
}
