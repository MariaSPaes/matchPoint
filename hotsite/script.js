const pageHeader = document.querySelector('.lp-header');
const navToggle = document.querySelector('.nav-toggle');
const mobileMenu = document.querySelector('.mobile-menu');

function updateHeader() {
  pageHeader.classList.toggle('scrolled', window.scrollY > 24);
}

function closeMenu() {
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('locked');
}

navToggle.addEventListener('click', () => {
  const shouldOpen = !mobileMenu.classList.contains('open');
  navToggle.classList.toggle('open', shouldOpen);
  navToggle.setAttribute('aria-expanded', String(shouldOpen));
  navToggle.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.classList.toggle('open', shouldOpen);
  mobileMenu.setAttribute('aria-hidden', String(!shouldOpen));
  document.body.classList.toggle('locked', shouldOpen);
});

document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('shown');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal:not(.shown)').forEach((element) => revealObserver.observe(element));

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const start = performance.now();
  const formatter = new Intl.NumberFormat('pt-BR');

  function frame(now) {
    const progress = Math.min((now - start) / 1400, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${formatter.format(Math.round(target * eased))}${element.dataset.suffix || ''}`;
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.75 });

document.querySelectorAll('[data-count]').forEach((counter) => counterObserver.observe(counter));

const sections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.nav-links a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 840) closeMenu(); });
document.querySelector('#year').textContent = new Date().getFullYear();
updateHeader();
