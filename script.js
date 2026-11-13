const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-nav a');
const revealElements = document.querySelectorAll('.reveal');
const joinDialog = document.querySelector('#join-dialog');
const interestForm = document.querySelector('#interest-form');
const formStep = document.querySelector('.dialog-form-step');
const successStep = document.querySelector('.dialog-success-step');
const signalTrack = document.querySelector('.signal-track');

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

const updateHeader = () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
};

const closeMenu = () => {
  menuToggle.classList.remove('active');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
};

menuToggle.addEventListener('click', () => {
  const isOpen = !mobileNav.classList.contains('open');
  menuToggle.classList.toggle('active', isOpen);
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  mobileNav.classList.toggle('open', isOpen);
  mobileNav.setAttribute('aria-hidden', String(!isOpen));
  document.body.classList.toggle('menu-open', isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileNav.classList.contains('open')) closeMenu();
});

const setupInfiniteCarousel = () => {
  if (!signalTrack) return;

  const sourceGroup = signalTrack.querySelector('.signal-group');
  if (!sourceGroup) return;

  signalTrack.querySelectorAll('.signal-group[aria-hidden="true"]').forEach((group) => group.remove());

  const groupWidth = sourceGroup.getBoundingClientRect().width;
  if (!groupWidth) return;

  const copiesNeeded = Math.max(2, Math.ceil(window.innerWidth / groupWidth) + 1);
  for (let index = 0; index < copiesNeeded; index += 1) {
    const clone = sourceGroup.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    signalTrack.appendChild(clone);
  }

  signalTrack.style.setProperty('--marquee-distance', `${groupWidth}px`);
  signalTrack.style.setProperty('--marquee-duration', `${Math.max(18, groupWidth / 42)}s`);
};

const queueCarouselSetup = () => window.requestAnimationFrame(setupInfiniteCarousel);
if (document.fonts?.ready) document.fonts.ready.then(queueCarouselSetup);
else queueCarouselSetup();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14, rootMargin: '0px 0px -40px' });

document.querySelectorAll('main section').forEach((section) => {
  section.querySelectorAll('.reveal').forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 85}ms`);
  });
});

revealElements.forEach((element) => {
  if (!element.classList.contains('is-visible')) revealObserver.observe(element);
});

function animateNumber(element, target, duration) {
  const startedAt = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(target * eased));
    if (progress < 1) window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

const scorePanel = document.querySelector('.score-panel');
const scoreObserver = new IntersectionObserver((entries, observer) => {
  const entry = entries[0];
  if (!entry.isIntersecting) return;

  const score = Number(document.querySelector('.score-ring').dataset.score);
  const ring = document.querySelector('.ring-value');
  const circumference = 2 * Math.PI * 76;
  ring.style.strokeDashoffset = String(circumference * (1 - score / 100));

  document.querySelectorAll('.score-factors u').forEach((bar) => {
    bar.style.width = `${bar.dataset.width}%`;
  });

  animateNumber(document.querySelector('.score-number'), score, 1200);
  scorePanel.classList.add('is-calculated');
  observer.disconnect();
}, { threshold: 0.18 });

scoreObserver.observe(scorePanel);

const trackedSections = document.querySelectorAll('main section[id]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.desktop-nav a').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

trackedSections.forEach((section) => sectionObserver.observe(section));

function resetDialog() {
  formStep.hidden = false;
  successStep.hidden = true;
  interestForm.reset();
}

function openDialog(preselectedRole = '') {
  resetDialog();
  if (preselectedRole) {
    const roleInput = interestForm.querySelector(`input[value="${preselectedRole}"]`);
    if (roleInput) roleInput.checked = true;
  }
  joinDialog.showModal();
  document.body.classList.add('dialog-open');
}

document.querySelectorAll('.js-open-dialog').forEach((button) => {
  button.addEventListener('click', () => {
    closeMenu();
    openDialog(button.dataset.role || '');
  });
});

function closeDialog() {
  joinDialog.close();
  document.body.classList.remove('dialog-open');
}

document.querySelector('.dialog-close').addEventListener('click', closeDialog);
document.querySelector('.dialog-done').addEventListener('click', closeDialog);

joinDialog.addEventListener('click', (event) => {
  const bounds = joinDialog.getBoundingClientRect();
  const clickedBackdrop = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (clickedBackdrop) closeDialog();
});

joinDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

interestForm.addEventListener('submit', (event) => {
  event.preventDefault();
  formStep.hidden = true;
  successStep.hidden = false;
});

document.querySelector('#current-year').textContent = new Date().getFullYear();
window.addEventListener('scroll', updateHeader, { passive: true });
let resizeFrame;
window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeMenu();
  window.cancelAnimationFrame(resizeFrame);
  resizeFrame = window.requestAnimationFrame(setupInfiniteCarousel);
});
updateHeader();

const setupTennisMotion = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const motionLayer = document.createElement('div');
  motionLayer.className = 'tennis-motion-layer';
  motionLayer.setAttribute('aria-hidden', 'true');
  motionLayer.innerHTML = '<span class="rally-trail"></span><span class="scroll-tennis-ball"></span><span class="ball-shadow"></span>';
  document.body.appendChild(motionLayer);

  const ball = motionLayer.querySelector('.scroll-tennis-ball');
  const shadow = motionLayer.querySelector('.ball-shadow');
  let ticking = false;

  const updateMotion = () => {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, window.scrollY / maxScroll);
    const wave = Math.sin(progress * Math.PI * 7);
    const side = Math.cos(progress * Math.PI * 4);
    const x = window.innerWidth < 620 ? 86 + wave * 5 : 89 + wave * 7 + side * 2;
    const y = 18 + progress * 65;
    document.documentElement.style.setProperty('--rally-progress', progress.toFixed(4));
    document.documentElement.style.setProperty('--rally-x', `${x.toFixed(2)}vw`);
    document.documentElement.style.setProperty('--rally-y', `${y.toFixed(2)}vh`);
    document.documentElement.style.setProperty('--rally-spin', `${Math.round(progress * 1480)}deg`);
    document.documentElement.style.setProperty('--hero-scroll', `${Math.min(window.scrollY, window.innerHeight) * .12}px`);
    ball.classList.toggle('is-serving', window.scrollY < 80);
    shadow.style.opacity = String(.14 + Math.abs(wave) * .16);
    ticking = false;
  };

  const requestMotion = () => {
    if (reduceMotion.matches || ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateMotion);
  };

  if (!reduceMotion.matches) {
    updateMotion();
    window.addEventListener('scroll', requestMotion, { passive: true });
    window.addEventListener('resize', requestMotion, { passive: true });
  }

  const tiltCards = document.querySelectorAll('.profile-card, .journey-step, .impact-card, .score-panel');
  tiltCards.forEach((card) => {
    card.classList.add('motion-card');
    card.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const bounds = card.getBoundingClientRect();
      const px = (event.clientX - bounds.left) / bounds.width;
      const py = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--tilt-x', `${((.5 - py) * 7).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${((px - .5) * 8).toFixed(2)}deg`);
      card.style.setProperty('--glow-x', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--glow-y', `${(py * 100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
};

setupTennisMotion();
