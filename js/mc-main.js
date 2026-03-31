/**
 * Maples & Connick — Main JavaScript
 * Version: 2.0.0
 * Zero dependencies. Passive listeners. RAF-throttled scroll. IntersectionObserver.
 */
(function () {
  'use strict';

  /* ── Progressive enhancement flag ───────────────────────── */
  document.documentElement.classList.add('mc-js');

  /* ── Shared scroll state (single listener, RAF-throttled) ─── */
  var scrollY = 0, lastScrollY = 0, ticking = false;
  var scrollCallbacks = [];

  function onScroll() {
    scrollY = window.pageYOffset;
    if (!ticking) {
      requestAnimationFrame(function () {
        for (var i = 0; i < scrollCallbacks.length; i++) scrollCallbacks[i](scrollY, lastScrollY);
        lastScrollY = scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Scroll Reveal (IntersectionObserver) ────────────────── */
  function initReveal() {
    var obs = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('mc-revealed');
          obs.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    var els = document.querySelectorAll('[data-mc-reveal]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      // CSS handles stagger via nth-child for card grids; only apply manual delay if data-mc-delay is set
      if (el.dataset.mcDelay) {
        el.style.transitionDelay = el.dataset.mcDelay + 'ms';
      }
      obs.observe(el);
    }
  }

  /* ── Mobile Navigation ───────────────────────────────────── */
  function initMobileNav() {
    var toggle = document.querySelector('[data-mc-nav-toggle]');
    var nav = document.querySelector('[data-mc-nav]');
    var overlay = document.querySelector('[data-mc-nav-overlay]');
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

    toggle.addEventListener('click', function () {
      nav.classList.contains('mc-nav--open') ? closeNav() : openNav();
    });
    if (overlay) overlay.addEventListener('click', closeNav);

    nav.addEventListener('click', function (e) {
      var a = e.target.closest('a');
      if (a && !a.classList.contains('mc-nav__dropdown-toggle') && !a.classList.contains('mc-nav__group-title')) closeNav();
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

    nav.addEventListener('click', function (e) {
      var dt = e.target.closest('.mc-nav__dropdown-toggle');
      if (dt && window.innerWidth <= 900) {
        e.preventDefault();
        var p = dt.closest('.mc-nav__dropdown');
        var wasOpen = p.classList.contains('mc-nav__dropdown--open');
        var all = nav.querySelectorAll('.mc-nav__dropdown--open');
        for (var i = 0; i < all.length; i++) all[i].classList.remove('mc-nav__dropdown--open');
        if (!wasOpen) p.classList.add('mc-nav__dropdown--open');
      }
      var gt = e.target.closest('.mc-nav__group-toggle');
      if (gt && window.innerWidth <= 900) {
        e.preventDefault();
        e.stopPropagation();
        var group = gt.closest('.mc-nav__group');
        var isOpen = group.classList.contains('mc-nav__group--open');
        var siblings = group.parentElement.querySelectorAll('.mc-nav__group--open');
        for (var j = 0; j < siblings.length; j++) {
          siblings[j].classList.remove('mc-nav__group--open');
          var s = siblings[j].querySelector('.mc-nav__group-toggle span');
          if (s) s.textContent = '+';
          var b = siblings[j].querySelector('.mc-nav__group-toggle');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
        if (!isOpen) {
          group.classList.add('mc-nav__group--open');
          var span = gt.querySelector('span');
          if (span) span.textContent = '\u2212';
          gt.setAttribute('aria-expanded', 'true');
        }
      }
    });
  }

  /* ── Sticky Header (uses shared scroll) ──────────────────── */
  function initStickyHeader() {
    var header = document.querySelector('.mc-header');
    if (!header) return;
    scrollCallbacks.push(function (sy, lastSy) {
      header.classList.toggle('mc-header--scrolled', sy > 80);
      if (sy > lastSy && sy > 300) header.classList.add('mc-header--hidden');
      else header.classList.remove('mc-header--hidden');
    });
  }

  /* ── Smooth Scroll ───────────────────────────────────────── */
  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
      }
    });
  }

  /* ── FAQ Accordion ───────────────────────────────────────── */
  function initAccordion() {
    document.addEventListener('click', function (e) {
      var q = e.target.closest('.mc-faq-item__question');
      if (!q) return;
      var item = q.closest('.mc-faq-item');
      var parent = item.closest('.mc-faq');
      if (parent) {
        var open = parent.querySelectorAll('.mc-faq-item[open]');
        for (var i = 0; i < open.length; i++) { if (open[i] !== item) open[i].removeAttribute('open'); }
      }
    });
  }

  /* ── Counter Animation ───────────────────────────────────── */
  function initCounters() {
    var obs = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var el = entries[i].target;
        var target = parseInt(el.dataset.mcCount, 10);
        var prefix = el.dataset.mcPrefix || '';
        var suffix = el.dataset.mcSuffix || '';
        var start = performance.now();
        (function (el, target, prefix, suffix, start) {
          function step(now) {
            var p = Math.min((now - start) / 1600, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + Math.round(target * eased).toLocaleString() + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        })(el, target, prefix, suffix, start);
        obs.unobserve(el);
      }
    }, { threshold: 0.5 });
    var els = document.querySelectorAll('[data-mc-count]');
    for (var i = 0; i < els.length; i++) obs.observe(els[i]);
  }

  /* ── Scroll to Top (uses shared scroll) ──────────────────── */
  function initScrollToTop() {
    var btn = document.querySelector('[data-mc-scroll-top]');
    if (!btn) return;
    scrollCallbacks.push(function (sy) {
      btn.classList.toggle('mc-scroll-top--visible', sy > 600);
    });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ── Lazy Images (polyfill only) ─────────────────────────── */
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return;
    var obs = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          var img = entries[i].target;
          if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
          obs.unobserve(img);
        }
      }
    });
    var imgs = document.querySelectorAll('img[data-src]');
    for (var i = 0; i < imgs.length; i++) obs.observe(imgs[i]);
  }

  /* ── Dynamic Year ────────────────────────────────────────── */
  function initYear() {
    var els = document.querySelectorAll('[data-mc-year]');
    var y = new Date().getFullYear();
    for (var i = 0; i < els.length; i++) els[i].textContent = y;
  }

  /* ── Typewriter Effect ───────────────────────────────────── */
  function initTypewriter() {
    var el = document.querySelector('[data-mc-typewriter]');
    if (!el) return;
    var words = el.dataset.mcTypewriter.split(',').map(function (w) { return w.trim(); });
    var wi = 0, ci = 0, del = false;
    function tick() {
      var w = words[wi];
      el.textContent = w.substring(0, ci);
      if (!del && ci === w.length) { setTimeout(function () { del = true; tick(); }, 2000); return; }
      if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
      ci += del ? -1 : 1;
      setTimeout(tick, del ? 40 : 80);
    }
    tick();
  }

  /* ── Parallax Hero (uses shared scroll) ──────────────────── */
  function initParallax() {
    var hero = document.querySelector('.mc-hero');
    if (!hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    scrollCallbacks.push(function (sy) {
      if (sy < window.innerHeight) hero.style.backgroundPositionY = (sy * 0.4) + 'px';
    });
  }

  /* ── Sticky Mobile CTA Bar (uses shared scroll) ─────────── */
  function initStickyMobileCTA() {
    if (window.innerWidth > 768) return;
    var bar = document.createElement('div');
    bar.className = 'mc-mobile-cta';
    bar.innerHTML = '<a href="tel:+15042693870" class="mc-mobile-cta__phone"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.72 11.72 0 003.66.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.66 1 1 0 01-.24 1.01l-2.23 2.12z"/></svg> 504-269-3870</a><a href="contact/" class="mc-mobile-cta__btn">Free Case Review</a>';
    document.body.appendChild(bar);
    scrollCallbacks.push(function (sy) {
      bar.classList.toggle('mc-mobile-cta--visible', sy > 300);
    });
  }

  /* ── Contact Form Handling ───────────────────────────────── */
  function initContactForm() {
    var form = document.getElementById('mc-contact-form');
    if (!form) return;
    var successEl = document.getElementById('mc-form-success');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('.mc-form__submit');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) {
          if (r.ok) {
            form.style.display = 'none';
            if (successEl) successEl.style.display = 'block';
            if (typeof gtag === 'function') gtag('event', 'generate_lead', { event_category: 'contact' });
          } else {
            alert('There was a problem sending your message. Please call us at 504-269-3870.');
            if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
          }
        })
        .catch(function () {
          alert('There was a problem sending your message. Please call us at 504-269-3870.');
          if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
        });
    });
  }

  /* ── Cookie Consent ──────────────────────────────────────── */
  function initCookieConsent() {
    if (localStorage.getItem('mc-cookie-consent')) return;
    var b = document.createElement('div');
    b.className = 'mc-cookie-banner';
    b.innerHTML = '<p>We use cookies to improve your experience. By continuing, you agree to our <a href="/privacy/">Privacy Policy</a>.</p><button class="mc-cookie-banner__accept">Accept</button>';
    document.body.appendChild(b);
    b.querySelector('.mc-cookie-banner__accept').addEventListener('click', function () {
      localStorage.setItem('mc-cookie-consent', 'accepted');
      b.remove();
    });
  }

  /* ── Init ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
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
    initStickyMobileCTA();
    initContactForm();
    initCookieConsent();
  });
})();
