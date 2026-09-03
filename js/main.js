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
