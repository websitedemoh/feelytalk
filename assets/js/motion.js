/* FeelyTalk – motion (plain JS, no libraries).
   1. Sticky nav gets a soft shadow + blur after 20px of scroll (class .is-scrolled).
   2. Scroll reveal: below-the-fold sections, cards and steps fade up once as they enter the viewport,
      staggered by column. Elements are only hidden by this script, so without JS everything is visible.
   Everything is skipped for prefers-reduced-motion. The hero entrance, floating chips, hover and pulse
   effects are pure CSS (see the MOTION block at the end of site.css). */
(function () {
  var doc = document;

  /* ------------------------------------------- hero decorations scale with the photo (600px = 1) */
  var arts = doc.querySelectorAll('.hero-art');
  if (arts.length) {
    var fit = function (a) { a.style.setProperty('--ks', (a.clientWidth / 600).toFixed(3)); };
    arts.forEach(fit);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (es) { es.forEach(function (e) { fit(e.target); }); });
      arts.forEach(function (a) { ro.observe(a); });
    } else window.addEventListener('resize', function () { arts.forEach(fit); });
  }

  /* ---------------------------------------------------------- sticky nav state */
  var header = doc.querySelector('.site-header');
  if (header) {
    var on = false, queued = false;
    var update = function () {
      queued = false;
      var scrolled = window.scrollY > 20;
      if (scrolled !== on) { on = scrolled; header.classList.toggle('is-scrolled', scrolled); }
    };
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------ scroll reveal */
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  var GRID = 'ul, ol:not(.card), .cat-grid, .faq, .feature-cols';
  var fold = window.innerHeight * 0.92;
  var groups = [];

  function realTarget(el) {
    if (el.tagName === 'PICTURE') return el.querySelector('img');
    return el;
  }
  function usable(el) {
    return el && !el.hidden && !el.classList.contains('sr-only') && !el.classList.contains('dash') && el.tagName !== 'SCRIPT';
  }

  doc.querySelectorAll('main section:not(.hero)').forEach(function (sec) {
    var cont = sec.querySelector('.container-ft');
    if (!cont) return;
    var kids = Array.prototype.slice.call(cont.children).map(realTarget).filter(usable);
    if (cont.classList.contains('grid') || cont.classList.contains('step-row')) { groups.push({ items: kids, byColumn: true }); return; }
    var singles = [];
    kids.forEach(function (k) {
      if (k.matches(GRID)) {
        var items = Array.prototype.slice.call(k.children).filter(usable);
        if (items.length) groups.push({ items: items, byColumn: true });
      } else singles.push(k);
    });
    if (singles.length) groups.push({ items: singles, byColumn: false });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      el.classList.add('is-in');
      var wait = 900 + (parseInt(el.style.getPropertyValue('--rd'), 10) || 0);
      setTimeout(function () {   // done: drop the helper state so hover transitions are unaffected
        el.removeAttribute('data-reveal');
        el.classList.remove('is-in');
        el.style.removeProperty('--rd');
      }, wait);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  groups.forEach(function (g) {
    var lefts = [];
    if (g.byColumn) {
      g.items.forEach(function (el) { var l = Math.round(el.getBoundingClientRect().left); if (lefts.indexOf(l) < 0) lefts.push(l); });
      lefts.sort(function (a, b) { return a - b; });
    }
    g.items.forEach(function (el, i) {
      if (el.getBoundingClientRect().top < fold) return;   // already on screen at load: leave visible
      var delay = g.byColumn
        ? Math.min(lefts.indexOf(Math.round(el.getBoundingClientRect().left)), 4) * 90
        : Math.min(i, 3) * 70;
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--rd', delay + 'ms');
      io.observe(el);
    });
  });
})();
