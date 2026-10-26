// QuadNova site: header, menu, scroll reveals, glass highlights and the AI scene.
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Header gets a hairline once the page scrolls and turns dark over dark sections; aurora fields drift (parallax)
  var header = document.querySelector('.site-header');
  var darks = Array.prototype.slice.call(document.querySelectorAll('.dark'));
  var auroras = Array.prototype.slice.call(document.querySelectorAll('.hero .aurora, .legal-hero .aurora'));
  var ticking = false;
  function onScroll() {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 8);
      var line = header.offsetHeight / 2;
      header.classList.toggle('on-dark', darks.some(function (d) { var r = d.getBoundingClientRect(); return r.top <= line && r.bottom >= line; }));
    }
    if (!reduce) auroras.forEach(function (a) { a.style.setProperty('--py', Math.min(window.scrollY * 0.25, 240) + 'px'); });
    ticking = false;
  }
  onScroll();
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  // Mobile menu
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) { setMenu(false); burger.focus(); } });
  }

  // Count-up numbers
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !target) { el.textContent = target; return; }
    var start = null, dur = 1400;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }

  // Reveal on scroll: siblings stagger by 80 ms; count-ups and chart bars start inside
  var items = document.querySelectorAll('.reveal');
  function show(el) {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
  }
  if (!('IntersectionObserver' in window) || reduce) {
    items.forEach(show);
  } else {
    items.forEach(function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
      el.style.setProperty('--rd', Math.min(sibs.indexOf(el), 5) * 80 + 'ms');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // Glass catches the light where the pointer is
  if (finePointer && !reduce) {
    document.querySelectorAll('.glass').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var b = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
        card.style.setProperty('--my', (e.clientY - b.top) + 'px');
      });
    });
  }

  if (reduce) return;

  // Dashboard: rows light up one after another
  var rows = document.querySelectorAll('.dash .row');
  if (rows.length) {
    var r = 0;
    setInterval(function () {
      rows.forEach(function (row) { row.classList.remove('flash'); });
      rows[r % rows.length].classList.add('flash');
      r++;
    }, 1800);
  }

  // Rotating headline word
  var rot = document.querySelector('.rotator');
  if (rot) {
    var words = rot.getAttribute('data-words').split('|');
    var w = 0;
    setInterval(function () {
      var cur = rot.querySelector('.word');
      cur.classList.add('out');
      setTimeout(function () {
        w = (w + 1) % words.length;
        var next = document.createElement('span');
        next.className = 'word in';
        next.textContent = words[w];
        rot.replaceChild(next, cur);
      }, 300);
    }, 2400);
  }

  // AI scene: a scroll-driven story (GSAP + ScrollTrigger). Desktop pins the section and scrubs the timeline
  // with the scroll; phones autoplay it in a loop while it is on screen. Without GSAP the finished state shows.
  var scene = document.getElementById('ai-scene');
  if (!scene || !window.gsap) return;
  var gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);
  root.classList.add('motion');
  var q = function (sel) { return scene.querySelector(sel); };
  var qa = function (sel) { return Array.prototype.slice.call(scene.querySelectorAll(sel)); };
  var phone = q('.phone'), tilt = q('.tilt'), ring = q('.ring'), order = q('.fc-order'), status = q('.wa-status'), ctr = q('.ctr');
  var steps = qa('.ai-steps li'), stepsList = q('.ai-steps');
  var msg = function (i) { return q('[data-m="' + i + '"]'); };
  var typ = function (i) { return q('[data-t="' + i + '"]'); };
  var chip = function (i) { return q('.c' + i); };
  var beam = function (i) { return q('.beam.b' + i); };
  var desktop = window.matchMedia('(min-width: 1001px)').matches && !!window.ScrollTrigger;

  // Collapsed state for every bubble; beams drawn from zero length
  var shown = { height: 'auto', opacity: 1, marginTop: 8, paddingTop: 7, paddingBottom: 6, scale: 1, y: 0 };
  var hidden = { height: 0, opacity: 0, marginTop: 0, paddingTop: 0, paddingBottom: 0, scale: .94, y: 10 };
  qa('.msg').forEach(function (m) { gsap.set(m, hidden); });
  qa('.beam').forEach(function (b) { var L = b.getTotalLength(); gsap.set(b, { strokeDasharray: L, strokeDashoffset: L, opacity: 0 }); });
  gsap.set(qa('.chip'), { opacity: .35, scale: .94 });
  gsap.set(order, { opacity: 0, scale: .6, x: 120, y: -220 });
  var count = { v: 22 };

  function bubble(tl, el, at) { return tl.to(el, Object.assign({ duration: .5, ease: 'power3.out', transformOrigin: el.classList.contains('out') ? '100% 100%' : '0% 100%' }, shown), at); }
  function think(tl, i, at) {
    tl.to(typ(i), Object.assign({ duration: .3, ease: 'power2.out', transformOrigin: '100% 100%' }, { height: 'auto', opacity: 1, marginTop: 8, paddingTop: 10, paddingBottom: 10, scale: 1, y: 0 }), at)
      .call(function () { if (status) status.textContent = 'typing…'; }, null, '<')
      .to(typ(i), Object.assign({ duration: .25, ease: 'power2.in' }, hidden), '>+=.7')
      .call(function () { if (status) status.textContent = 'online'; }, null, '<');
    return tl;
  }
  function link(tl, i, at) {
    return tl.to(beam(i), { opacity: 1, strokeDashoffset: 0, duration: .6, ease: 'power2.inOut' }, at)
      .to(chip(i), { opacity: 1, scale: 1, duration: .4, ease: 'back.out(1.6)', onStart: function () { chip(i).classList.add('on'); }, onReverseComplete: function () { chip(i).classList.remove('on'); } }, '<+=.35');
  }

  var tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  tl.addLabel('s0')
    // The iPhone arrives showing its camera plateau, then turns to face you (no opacity here: it would flatten the 3D)
    .fromTo(tilt, { rotateY: 200, rotateX: 12, rotateZ: -6, scale: .78, y: 80 }, { rotateY: 0, rotateX: 0, rotateZ: 0, scale: 1, y: 0, duration: 1.8, ease: 'power3.inOut' })
    .fromTo(ring, { scale: .5, opacity: 0 }, { scale: 1, opacity: .5, duration: 1.4 }, '<+=.2')
    .add(function () {}, '+=.1');
  bubble(tl, msg(0), '>');
  tl.addLabel('s1', '>+=.3');
  link(tl, 0, 's1');
  think(tl, 0, '<');
  bubble(tl, msg(1), '>');
  bubble(tl, msg(2), '>+=.35');
  tl.addLabel('s2', '>+=.2');
  link(tl, 1, 's2');
  think(tl, 1, '<');
  bubble(tl, msg(3), '>');
  bubble(tl, msg(4), '>+=.35');
  tl.addLabel('s3', '>+=.1');
  think(tl, 2, 's3');
  bubble(tl, msg(5), '>');
  tl.to(order, { opacity: 1, scale: 1, x: 0, y: 0, duration: .8, ease: 'expo.out' }, '<');
  link(tl, 2, '<+=.1');
  link(tl, 3, '<+=.15');
  tl.to(count, { v: 23, duration: .4, ease: 'none', onUpdate: function () { if (ctr) ctr.textContent = Math.round(count.v); } }, '<+=.2')
    .to(ring, { opacity: .75, duration: .6 }, '<')
    .to({}, { duration: .6 });

  var labels = ['s0', 's1', 's2', 's3'];
  function syncSteps() {
    var t = tl.time(), cur = 0;
    labels.forEach(function (l, i) { if (t >= tl.labels[l] - .01) cur = i; });
    steps.forEach(function (li, i) { li.classList.toggle('on', i === cur); });
    if (stepsList) stepsList.style.setProperty('--p', Math.min(1, tl.progress() * 1.05).toFixed(3));
  }
  tl.eventCallback('onUpdate', syncSteps);
  syncSteps();

  if (desktop) {
    window.ScrollTrigger.create({ trigger: scene, start: 'center center', end: '+=' + Math.round(window.innerHeight * 2.4), pin: true, scrub: .8, animation: tl, anticipatePin: 1 });
    // The phone leans toward the pointer
    var stage = q('.ai-stage');
    var rx = gsap.quickTo(phone, 'rotationX', { duration: .8, ease: 'power3.out' }), ry = gsap.quickTo(phone, 'rotationY', { duration: .8, ease: 'power3.out' });
    stage.addEventListener('pointermove', function (e) { var b = stage.getBoundingClientRect(); ry(((e.clientX - b.left) / b.width - .5) * 14); rx(-((e.clientY - b.top) / b.height - .5) * 10); });
    stage.addEventListener('pointerleave', function () { rx(0); ry(0); });
  } else {
    // Phones: play through while visible, hold the finished conversation, rewind softly and repeat
    var loop = gsap.timeline({ paused: true, repeat: -1, repeatDelay: .4 });
    loop.add(tl.tweenFromTo(0, tl.duration(), { ease: 'none' })).to({}, { duration: 2.4 }).add(tl.tweenTo(0, { duration: .6, ease: 'power2.in' }));
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) loop.play(); else loop.pause(); }, { threshold: .25 }).observe(scene);
  }
})();
