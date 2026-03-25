/**
 * Maples & Connick — Main JavaScript
 * Version: 1.0.0
 * Performance-first: no jQuery, no frameworks, vanilla ES6+
 * Features: scroll animations, mobile nav, FAQ accordion, lazy images,
 *           scroll-to-top, counter animation, parallax hero, sticky header
 */

(function () {
  'use strict';

  // ─── Scroll Reveal (Intersection Observer) ────────────────────────
  // Elements with [data-mc-reveal] animate in when scrolled into view.
  // Supports: fade-up, fade-left, fade-right, fade-in, scale-in
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('mc-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  function initReveal() {
    document.querySelectorAll('[data-mc-reveal]').forEach((el, i) => {
      // Stagger delay for grid children
      const delay = el.dataset.mcDelay || (el.closest('.mc-grid, .mc-card-grid') ? i * 80 : 0);
      el.style.transitionDelay = delay + 'ms';
      revealObserver.observe(el);
    });
  }

  // ─── Mobile Navigation ────────────────────────────────────────────
  function initMobileNav() {
    const toggle = document.querySelector('[data-mc-nav-toggle]');
    const nav = document.querySelector('[data-mc-nav]');
    const overlay = document.querySelector('[data-mc-nav-overlay]');
    if (!toggle || !nav) return;

    function openNav() {
      nav.classList.add('mc-nav--open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('mc-nav-open');
      if (overlay) overlay.classList.add('mc-nav-overlay--visible');
    }

    function closeNav() {
      nav.classList.remove('mc-nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('mc-nav-open');
      if (overlay) overlay.classList.remove('mc-nav-overlay--visible');
    }

    toggle.addEventListener('click', () => {
      nav.classList.contains('mc-nav--open') ? closeNav() : openNav();
    });

    if (overlay) overlay.addEventListener('click', closeNav);

    // Close on nav link click (mobile)
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeNav);
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });
  }

  // ─── Sticky Header ───────────────────────────────────────────────
  function initStickyHeader() {
    const header = document.querySelector('.mc-header');
    if (!header) return;
    let lastScroll = 0;
    const scrollThreshold = 80;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      header.classList.toggle('mc-header--scrolled', currentScroll > scrollThreshold);

      // Hide on scroll down, show on scroll up
      if (currentScroll > lastScroll && currentScroll > 300) {
        header.classList.add('mc-header--hidden');
      } else {
        header.classList.remove('mc-header--hidden');
      }
      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ─── Smooth Scroll ───────────────────────────────────────────────
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ─── FAQ / Accordion ─────────────────────────────────────────────
  function initAccordion() {
    document.querySelectorAll('.mc-faq-item').forEach((item) => {
      const question = item.querySelector('.mc-faq-item__question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.hasAttribute('open');
        // Close siblings (optional: remove for independent toggle)
        const parent = item.closest('.mc-faq');
        if (parent) {
          parent.querySelectorAll('.mc-faq-item[open]').forEach((other) => {
            if (other !== item) other.removeAttribute('open');
          });
        }
      });
    });
  }

  // ─── Counter Animation ───────────────────────────────────────────
  // Elements with [data-mc-count="123"] animate from 0 to the target number
  function initCounters() {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.mcCount, 10);
          const prefix = el.dataset.mcPrefix || '';
          const suffix = el.dataset.mcSuffix || '';
          const duration = 1600;
          const start = performance.now();

          function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(target * eased);
            el.textContent = prefix + current.toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }

          requestAnimationFrame(step);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-mc-count]').forEach((el) => {
      counterObserver.observe(el);
    });
  }

  // ─── Scroll to Top ───────────────────────────────────────────────
  function initScrollToTop() {
    const btn = document.querySelector('[data-mc-scroll-top]');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('mc-scroll-top--visible', window.pageYOffset > 600);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ─── Lazy Image Loading ──────────────────────────────────────────
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return; // native support
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          imgObserver.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach((img) => imgObserver.observe(img));
  }

  // ─── Dynamic Year ────────────────────────────────────────────────
  function initYear() {
    document.querySelectorAll('[data-mc-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  // ─── Typewriter Effect (Hero) ────────────────────────────────────
  function initTypewriter() {
    const el = document.querySelector('[data-mc-typewriter]');
    if (!el) return;
    const words = el.dataset.mcTypewriter.split(',').map((w) => w.trim());
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 80;
    const deleteSpeed = 40;
    const pauseTime = 2000;

    function tick() {
      const current = words[wordIndex];
      el.textContent = current.substring(0, charIndex);

      if (!isDeleting && charIndex === current.length) {
        setTimeout(() => { isDeleting = true; tick(); }, pauseTime);
        return;
      }
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }

      charIndex += isDeleting ? -1 : 1;
      setTimeout(tick, isDeleting ? deleteSpeed : typeSpeed);
    }

    tick();
  }

  // ─── Parallax Hero Background ────────────────────────────────────
  function initParallax() {
    const hero = document.querySelector('.mc-hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    window.addEventListener('scroll', () => {
      const scroll = window.pageYOffset;
      if (scroll < window.innerHeight) {
        hero.style.backgroundPositionY = (scroll * 0.4) + 'px';
      }
    }, { passive: true });
  }

  // ─── Init All ────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initMobileNav();
    initStickyHeader();
    initSmoothScroll();
    initAccordion();
    initCounters();
    initScrollToTop();
    initLazyImages();
    initYear();
    initTypewriter();
    initParallax();
  });

})();
