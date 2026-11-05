const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

const setupMobileCarousels = () => {
  document.querySelectorAll('.mobile-carousel').forEach((track, carouselIndex) => {
    if (track.dataset.carouselReady === 'true') return;
    const items = [...track.children];
    if (items.length < 2) return;

    track.dataset.carouselReady = 'true';
    track.setAttribute('role', 'region');
    track.setAttribute('aria-roledescription', 'carrossel');
    track.setAttribute('aria-label', track.dataset.carouselLabel || `Carrossel ${carouselIndex + 1}`);
    track.setAttribute('tabindex', '0');

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.innerHTML = `<span class="carousel-status" aria-live="polite">1 / ${items.length}</span><span class="carousel-actions"><button class="carousel-button carousel-prev" type="button" aria-label="Item anterior">←</button><button class="carousel-button carousel-next" type="button" aria-label="Próximo item">→</button></span>`;
    track.insertAdjacentElement('afterend', controls);

    const status = controls.querySelector('.carousel-status');
    const previous = controls.querySelector('.carousel-prev');
    const next = controls.querySelector('.carousel-next');
    let activeIndex = 0;
    let scrollFrame;

    const update = () => {
      const currentLeft = track.scrollLeft;
      activeIndex = items.reduce((closest, item, index) => (
        Math.abs(item.offsetLeft - currentLeft) < Math.abs(items[closest].offsetLeft - currentLeft) ? index : closest
      ), 0);
      status.textContent = `${activeIndex + 1} / ${items.length}`;
      previous.disabled = activeIndex === 0;
      next.disabled = activeIndex === items.length - 1;
    };

    const goTo = (index) => {
      const target = items[Math.max(0, Math.min(items.length - 1, index))];
      track.scrollTo({ left: target.offsetLeft - parseFloat(getComputedStyle(track).paddingLeft), behavior: 'smooth' });
    };

    previous.addEventListener('click', () => goTo(activeIndex - 1));
    next.addEventListener('click', () => goTo(activeIndex + 1));
    track.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(activeIndex - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); goTo(activeIndex + 1); }
    });
    track.addEventListener('scroll', () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(update);
    }, { passive: true });
    update();
  });
};

setupMobileCarousels();

function updateHeader() {
  header?.classList.toggle('scrolled', window.scrollY > 24);
}

function closeMenu() {
  if (!menuButton || !mobileMenu) return;
  menuButton.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const open = !mobileMenu.classList.contains('open');
  menuButton.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  document.body.classList.toggle('menu-open', open);
});

document.querySelectorAll('.mobile-menu a').forEach((link) => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('shown');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px' });

document.querySelectorAll('main section').forEach((section) => {
  section.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 75}ms`);
  });
});

document.querySelectorAll('.reveal:not(.shown)').forEach((element) => revealObserver.observe(element));

const observedSections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.desktop-nav a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

observedSections.forEach((section) => sectionObserver.observe(section));

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', () => { if (window.innerWidth > 840) closeMenu(); });

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
updateHeader();
