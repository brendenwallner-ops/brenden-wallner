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

  /* live previews: play the clip on hover (desktop) / in-view (touch) */
  (function () {
    var figs = document.querySelectorAll('.has-video');
    if (!figs.length) return;
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    figs.forEach(function (fig) {
      var v = fig.querySelector('.shot-video');
      if (!v) return;
      var play = function () { fig.classList.add('playing'); var p = v.play(); if (p && p.catch) p.catch(function () {}); };
      var stop = function () { fig.classList.remove('playing'); v.pause(); };
      if (canHover) {
        var card = fig.closest('.mini') || fig;
        card.addEventListener('mouseenter', play);
        card.addEventListener('mouseleave', function () { stop(); try { v.currentTime = 0; } catch (e) {} });
      } else if ('IntersectionObserver' in window && !reduceMotion) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
        }, { threshold: 0.6 }).observe(fig);
      }
    });
  })();

  /* contact form — POSTs to the /api/contact serverless function (nodemailer/Gmail).
     Falls back to a prefilled email only if the request can't be made. */
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  function setStatus(msg, type) { status.textContent = msg; status.className = 'form__status' + (type ? ' ' + type : ''); }

  if (form) {
    var submitBtn = form.querySelector('.form__submit');
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
        message: form.message.value.trim(), company: form.company ? form.company.value : ''
      };

      var origLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      setStatus('Sending…', '');

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d)
      }).then(function (r) {
        if (!r.ok) throw new Error('bad status ' + r.status);
        return r.json();
      }).then(function () {
        form.reset();
        setStatus('Thanks — your message is on its way. I’ll reply within a day.', 'ok');
      }).catch(function () {
        // Network/endpoint unavailable (e.g. static preview) — fall back to email.
        var body = 'Name: ' + d.name + '\nEmail: ' + d.email + '\nNeeds: ' + d.type +
          '\nBudget: ' + d.budget + '\n\n' + d.message + '\n';
        var mailto = 'mailto:brenden.wallner@gmail.com?subject=' +
          encodeURIComponent('New project inquiry — ' + d.name) + '&body=' + encodeURIComponent(body);
        setStatus('Couldn’t send automatically — opening your email app instead.', 'err');
        window.location.href = mailto;
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
      });
    });
    form.addEventListener('input', function (e) {
      if (e.target.classList.contains('invalid')) e.target.classList.remove('invalid');
    });
  }
})();
