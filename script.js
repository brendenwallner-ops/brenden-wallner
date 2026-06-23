/* Brenden Wallner — portfolio interactions */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- current year ---- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---- nav: add border once scrolled ---- */
  var nav = document.querySelector('.nav');
  function onScroll() {
    if (window.scrollY > 8) nav.classList.add('is-stuck');
    else nav.classList.remove('is-stuck');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- hero load reveal ---- */
  window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.hero .reveal').forEach(function (el) {
      el.classList.add('in');
    });
  });

  /* ---- scroll reveal for sections ---- */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('io-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    document.querySelectorAll('.case, .mini, .svc, .process li, .about__inner > *')
      .forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.case, .mini, .svc, .process li, .about__inner > *')
      .forEach(function (el) { el.classList.add('io-in'); });
  }

  /* ---- subtle pointer tilt on cards ---- */
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      card.addEventListener('pointermove', function (ev) {
        var r = card.getBoundingClientRect();
        var px = (ev.clientX - r.left) / r.width - 0.5;
        var py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateY(' + (px * 3.2).toFixed(2) + 'deg) rotateX(' +
          (-py * 3.2).toFixed(2) + 'deg) translateY(-2px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transform = '';
      });
    });
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

    /* clear invalid state as the user fixes a field */
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    });
  }
})();
