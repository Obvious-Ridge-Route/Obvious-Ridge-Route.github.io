import { initContactForm } from './contact.js';
import { activeStepCount, isStacked, scrollProgress, stackedActiveCount } from './steps.js';

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 768px)');

function onScrollFrame(callback) {
  let queued = false;
  const run = () => {
    queued = false;
    callback();
  };
  const schedule = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(run);
    }
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  callback();
}

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  onScrollFrame(() => header.classList.toggle('is-scrolled', window.scrollY > 8));
}

function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  if (!toggle || !menu) return;

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open, { returnFocus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  menu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { returnFocus: true });
  });
  document.addEventListener('click', (event) => {
    if (isOpen() && !menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}

function inViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

function initReveal() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  if (!items.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;

  // Anything already on screen stays put; only content below the fold animates in.
  items.filter(inViewport).forEach((item) => item.classList.add('is-visible'));
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  items.filter((item) => !item.classList.contains('is-visible')).forEach((item) => observer.observe(item));
  root.classList.add('reveal-ready');
}

function initSheenOnce() {
  const panels = document.querySelectorAll('[data-sheen-once]');
  if (!panels.length || reduceMotion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-sheening');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.35 },
  );
  panels.forEach((panel) => observer.observe(panel));
}

// The four Agentic AI steps light up in order as the band scrolls through the viewport.
function initSteps() {
  const list = document.querySelector('[data-steps]');
  if (!list) return;
  const steps = [...list.querySelectorAll('[data-step]')];
  const rail = document.querySelector('[data-steps-progress]');
  const band = list.closest('.agentic') ?? list;

  if (reduceMotion.matches) {
    steps.forEach((step) => step.classList.add('is-active'));
    rail?.style.setProperty('--progress', '1');
    return;
  }

  list.setAttribute('data-steps-ready', '');
  onScrollFrame(() => {
    const tops = steps.map((step) => step.getBoundingClientRect().top);
    let count;
    let progress;
    if (isStacked(tops)) {
      count = stackedActiveCount(tops, window.innerHeight);
      progress = count / steps.length;
    } else {
      const rect = band.getBoundingClientRect();
      progress = scrollProgress(rect.top, rect.height, window.innerHeight);
      count = activeStepCount(progress, steps.length);
    }
    steps.forEach((step, index) => step.classList.toggle('is-active', index < count));
    rail?.style.setProperty('--progress', progress.toFixed(3));
  });
}

function initParallax() {
  const layer = document.querySelector('[data-parallax]');
  if (!layer || reduceMotion.matches) return;
  onScrollFrame(() => {
    if (!desktop.matches) {
      layer.style.transform = '';
      return;
    }
    const shift = Math.min(window.scrollY, 900) * 0.06;
    layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
  });
}

function init() {
  initHeader();
  initMenu();
  initReveal();
  initSheenOnce();
  initSteps();
  initParallax();
  initContactForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
