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
