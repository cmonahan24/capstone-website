// ============================================================
// Nav: scroll state + mobile toggle
// ============================================================
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('is-scrolled', window.scrollY > 12);
}, { passive: true });

navToggle?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('is-open'));
});

// ============================================================
// Reveal-on-scroll
// ============================================================
const revealEls = document.querySelectorAll('[data-reveal]');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => io.observe(el));

// ============================================================
// Nav: active-section highlighting (scroll-spy)
// ============================================================
const navLinkEls = document.querySelectorAll('.nav-links a[href^="#"]');
const spySections = Array.from(navLinkEls)
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (spySections.length) {
  const spyIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (!link) return;
      navLinkEls.forEach(a => a.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  spySections.forEach(el => spyIo.observe(el));
}

// ============================================================
// Hero: Grumman AA-5B Tiger 3D scan
// Builds a "point cloud" from the Tiger's own outline. Each point's animation
// delay matches where the laser beam crosses it, so the dots light up as it sweeps.
// ============================================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const tigerGeo = document.querySelectorAll('#tiger-geo > *');
const pointsGroup = document.querySelector('.tiger-points-g');

if (tigerGeo.length && pointsGroup && !prefersReducedMotion) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const VIEW_W = 600;
  const SWEEP_SECONDS = 9 * 0.55; // keep in sync with scan-sweep in styles.css
  const addPoint = (x, y) => {
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('cx', x.toFixed(1));
    dot.setAttribute('cy', y.toFixed(1));
    dot.setAttribute('r', (0.8 + Math.random() * 0.9).toFixed(2));
    dot.style.animationDelay = `${((x / VIEW_W) * SWEEP_SECONDS).toFixed(2)}s`;
    pointsGroup.appendChild(dot);
  };

  // Points along every outline
  tigerGeo.forEach(el => {
    if (typeof el.getTotalLength !== 'function') return;
    const length = el.getTotalLength();
    const count = Math.max(6, Math.round(length / 9));
    for (let i = 0; i < count; i++) {
      const pt = el.getPointAtLength((length * i) / count);
      addPoint(pt.x + (Math.random() - 0.5) * 2.5, pt.y + (Math.random() - 0.5) * 2.5);
    }
  });

  // Scattered points inside the solid parts (skipped quietly if the browser can't hit-test)
  ['tiger-fuselage', 'tiger-fin', 'tiger-wing'].forEach(id => {
    const el = document.getElementById(id);
    if (!el || typeof el.isPointInFill !== 'function') return;
    let added = 0;
    for (let tries = 0; tries < 3000 && added < 70; tries++) {
      const x = 50 + Math.random() * 520;
      const y = 36 + Math.random() * 140;
      if (el.isPointInFill(new DOMPoint(x, y))) { addPoint(x, y); added++; }
    }
  });
}

// "Takeoff": the hero Tiger climbs away as you scroll past the hero
const heroFly = document.querySelector('.hero-tiger-fly');
const heroSection = document.querySelector('.hero');
if (heroFly && heroSection && !prefersReducedMotion) {
  let heroTicking = false;
  const updateTakeoff = () => {
    const p = Math.min(Math.max(window.scrollY / (heroSection.offsetHeight * 0.8), 0), 1);
    heroFly.style.setProperty('--p', p.toFixed(3));
    heroTicking = false;
  };
  window.addEventListener('scroll', () => {
    if (!heroTicking) { requestAnimationFrame(updateTakeoff); heroTicking = true; }
  }, { passive: true });
  updateTakeoff();
}

// ============================================================
// Scroll flight path: a Tiger rides along the nav bar showing how far down the page you are.
// It pitches nose-up while you scroll down, nose-down when you scroll back up.
// ============================================================
const flightBar = document.querySelector('.flight');
if (flightBar) {
  const flightPlane = flightBar.querySelector('.flight-plane');
  const flightFill = flightBar.querySelector('.flight-fill');
  let tilt = 0;
  let lastY = window.scrollY;
  let flightFrame = null;

  const renderFlight = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
    const travel = flightBar.clientWidth - flightPlane.getBoundingClientRect().width;
    flightFill.style.transform = `scaleX(${progress})`;
    flightPlane.style.transform = `translate(${(progress * travel).toFixed(1)}px, -50%) rotate(${tilt.toFixed(2)}deg)`;
  };

  const flightTick = () => {
    const dy = window.scrollY - lastY;
    lastY = window.scrollY;
    const target = prefersReducedMotion ? 0 : -Math.max(-14, Math.min(14, dy * 0.35));
    tilt += (target - tilt) * 0.18;
    renderFlight();
    flightFrame = (Math.abs(tilt) > 0.05 || Math.abs(dy) > 0.5) ? requestAnimationFrame(flightTick) : null;
  };

  window.addEventListener('scroll', () => { if (!flightFrame) flightFrame = requestAnimationFrame(flightTick); }, { passive: true });
  window.addEventListener('resize', renderFlight);
  renderFlight();
}

// Footer year
const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============================================================
// Photo fallbacks — show initials/label when a photo isn't in place yet
// ============================================================
document.querySelectorAll('[data-initials] img').forEach(img => {
  img.addEventListener('error', () => {
    const wrap = img.closest('[data-initials]');
    img.remove();
    wrap.classList.add('no-photo');
    const label = document.createElement('span');
    label.textContent = wrap.dataset.initials;
    wrap.appendChild(label);
    const caption = wrap.querySelector('.team-photo-caption');
    if (caption) caption.textContent = 'Group photo coming soon';
  }, { once: true });
});
