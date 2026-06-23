/* Brenden Wallner — portfolio interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var lerp = function (a, b, n) { return a + (b - a) * n; };
  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };

  /* ---- current year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- nav border + scroll progress bar ---- */
  var nav = document.querySelector('.nav');
  var progress = document.getElementById('progress');
  function onScroll() {
    var y = window.scrollY || 0;
    nav.classList.toggle('is-stuck', y > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- hero entrance: reveal copy + headline mask ---- */
  function playHero() {
    document.querySelectorAll('.hero .reveal').forEach(function (el) { el.classList.add('in'); });
    var title = document.querySelector('.hero__title');
    if (title) title.classList.add('in');
  }
  if (document.readyState !== 'loading') playHero();
  else window.addEventListener('DOMContentLoaded', playHero);

  /* ---- count-up stats (on first view) ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1300;
    function step(t) {
      if (start === null) start = t;
      var p = clamp((t - start) / dur, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- scroll reveal + count triggers ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('io-in');
        if (e.target.hasAttribute('data-count')) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.case, .mini, .svc, .process li, .about__inner > *, .stat__num[data-count]')
      .forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.case, .mini, .svc, .process li, .about__inner > *').forEach(function (el) { el.classList.add('io-in'); });
    document.querySelectorAll('.stat__num[data-count]').forEach(countUp);
  }

  /* ===================================================== */
  /* Pointer-driven effects (fine pointers, motion allowed) */
  /* ===================================================== */
  if (finePointer && !reduceMotion) {

    /* ---- trailing cursor ring ---- */
    var ring = document.getElementById('cursor');
    var rx = window.innerWidth / 2, ry = window.innerHeight / 2, tx = rx, ty = ry, shown = false;
    document.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { ring.classList.add('is-on'); shown = true; }
    });
    document.addEventListener('pointerleave', function () { ring.classList.remove('is-on'); shown = false; });
    document.querySelectorAll('a, button, .tilt, input, select, textarea').forEach(function (el) {
      el.addEventListener('pointerenter', function () { ring.classList.add('is-grow'); });
      el.addEventListener('pointerleave', function () { ring.classList.remove('is-grow'); });
    });
    (function ringLoop() {
      rx = lerp(rx, tx, 0.18); ry = lerp(ry, ty, 0.18);
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(ringLoop);
    })();

    /* ---- magnetic buttons ---- */
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (mx * 0.25).toFixed(1) + 'px,' + (my * 0.35).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });

    /* ---- hero depth parallax (cursor) ---- */
    var stage = document.getElementById('stage');
    if (stage) {
      var layers = stage.querySelectorAll('[data-depth]');
      var hx = 0, hy = 0, chx = 0, chy = 0;
      stage.parentElement.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        hx = (e.clientX - (r.left + r.width / 2)) / r.width;
        hy = (e.clientY - (r.top + r.height / 2)) / r.height;
      });
      stage.parentElement.addEventListener('pointerleave', function () { hx = 0; hy = 0; });
      (function stageLoop() {
        chx = lerp(chx, hx, 0.08); chy = lerp(chy, hy, 0.08);
        layers.forEach(function (l) {
          var d = parseFloat(l.getAttribute('data-depth')) || 1;
          var base = l.getAttribute('data-base') || '';
          l.style.transform = base + ' translate(' + (chx * d * 18).toFixed(2) + 'px,' + (chy * d * 18).toFixed(2) + 'px)';
        });
        requestAnimationFrame(stageLoop);
      })();
    }

    /* ---- card tilt ---- */
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateY(' + (px * 3).toFixed(2) + 'deg) rotateX(' +
          (-py * 3).toFixed(2) + 'deg)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });

    /* ---- case media scroll parallax ---- */
    var medias = Array.prototype.slice.call(document.querySelectorAll('.parallax-media .frame'));
    if (medias.length) {
      var ticking = false;
      function parallaxScroll() {
        var vh = window.innerHeight;
        medias.forEach(function (m) {
          var r = m.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var prog = (r.top + r.height / 2 - vh / 2) / vh; // -0.5..0.5 through viewport
          m.style.transform = 'translateY(' + (prog * -26).toFixed(1) + 'px)';
        });
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(parallaxScroll); ticking = true; }
      }, { passive: true });
      parallaxScroll();
    }
  }

  /* ---- contact form ---- */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');

  function setStatus(msg, type) {
    status.textContent = msg;
    status.className = 'form__status' + (type ? ' ' + type : '');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var fields = form.querySelectorAll('[required]');
      var firstInvalid = null;
      fields.forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        f.classList.toggle('invalid', bad);
        if (bad && !firstInvalid) firstInvalid = f;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('Please fill in the highlighted fields.', 'err');
        return;
      }

      /* No backend yet — hand off to a prefilled email so the message actually reaches me.
         To use a real endpoint later: POST this data to your Formspree/API URL instead. */
      var data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        type: form.type.value,
        budget: form.budget.value || 'Not specified',
        message: form.message.value.trim()
      };

      var subject = 'New project inquiry — ' + data.name;
      var body =
        'Name: ' + data.name + '\n' +
        'Email: ' + data.email + '\n' +
        'Needs: ' + data.type + '\n' +
        'Budget: ' + data.budget + '\n\n' +
        data.message + '\n';

      var mailto = 'mailto:brenden.wallner@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      setStatus('Opening your email app… if nothing happens, write to brenden.wallner@gmail.com', 'ok');
      window.location.href = mailto;
    });

    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    });
  }
})();
