/* Brenden Wallner — portfolio interactions (calm, professional) */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* current year */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* respect reduced motion: swap the animated globe for a still */
  var globe = document.getElementById('globe');
  if (globe && reduceMotion && globe.dataset.still) globe.src = globe.dataset.still;

  /* hero entrance */
  function playHero() {
    document.querySelectorAll('.hero .reveal').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('in'); }, reduceMotion ? 0 : i * 90);
    });
  }
  if (document.readyState !== 'loading') playHero();
  else window.addEventListener('DOMContentLoaded', playHero);

  /* scroll reveal */
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('io-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.case, .mini, .svc, .process li, .faq__list > div')
      .forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.case, .mini, .svc, .process li, .faq__list > div')
      .forEach(function (el) { el.classList.add('io-in'); });
  }

  /* contact form — validates, hands off to a prefilled email (no backend needed) */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  function setStatus(msg, type) { status.textContent = msg; status.className = 'form__status' + (type ? ' ' + type : ''); }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
        f.classList.toggle('invalid', bad);
        if (bad && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) { firstInvalid.focus(); setStatus('Please fill in the highlighted fields.', 'err'); return; }

      var d = {
        name: form.name.value.trim(), email: form.email.value.trim(),
        type: form.type.value, budget: form.budget.value || 'Not specified',
        message: form.message.value.trim()
      };
      var body = 'Name: ' + d.name + '\nEmail: ' + d.email + '\nNeeds: ' + d.type +
        '\nBudget: ' + d.budget + '\n\n' + d.message + '\n';
      var mailto = 'mailto:brenden.wallner@gmail.com?subject=' +
        encodeURIComponent('New project inquiry — ' + d.name) + '&body=' + encodeURIComponent(body);

      setStatus('Opening your email app… if nothing happens, write to brenden.wallner@gmail.com', 'ok');
      window.location.href = mailto;
    });
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    });
  }
})();
