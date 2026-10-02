// Quadnova site: header, menu, scroll reveals and animations.
(function () {
  var root = document.documentElement;
  root.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Header style + scroll progress bar
  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.progress');
  function onScroll() {
    if (header && !header.classList.contains('solid')) header.classList.toggle('scrolled', window.scrollY > 20);
    if (bar) {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      if (open && header) header.classList.add('scrolled');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
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

  // Reveal on scroll (also triggers count-ups and dashboard bars inside)
  var items = document.querySelectorAll('.reveal');
  function show(el) {
    el.classList.add('in');
    el.querySelectorAll('[data-count]').forEach(countUp);
  }
  if (!('IntersectionObserver' in window)) {
    items.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
      io.observe(el);
    });
  }

  // Dashboard: rows light up one after another
  var rows = document.querySelectorAll('.dash .row');
  if (rows.length && !reduce) {
    var r = 0;
    setInterval(function () {
      rows.forEach(function (row) { row.classList.remove('flash'); });
      rows[r % rows.length].classList.add('flash');
      r++;
    }, 1800);
  }

  // Cursor spotlight + gentle tilt on cards
  if (finePointer && !reduce) {
    document.querySelectorAll('.feature, .sector, .value, .ccard').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var b = card.getBoundingClientRect();
        var x = e.clientX - b.left, y = e.clientY - b.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        var rx = ((y / b.height) - 0.5) * -6, ry = ((x / b.width) - 0.5) * 6;
        card.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  // Pause the hero's looping effects while it is scrolled out of view
  var hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      hero.classList.toggle('paused', !entries[0].isIntersecting);
    }).observe(hero);
  }

  if (reduce) return;

  // Rotating headline word
  var rot = document.querySelector('.rotator');
  if (rot) {
    var words = rot.getAttribute('data-words').split('|');
    var w = 0;
    setInterval(function () {
      var cur = rot.querySelector('.grad');
      cur.classList.add('out');
      setTimeout(function () {
        w = (w + 1) % words.length;
        var next = document.createElement('span');
        next.className = 'grad in';
        next.textContent = words[w];
        rot.replaceChild(next, cur);
      }, 300);
    }, 2200);
  }

  // Live WhatsApp chat loop
  var chat = document.getElementById('chat');
  var status = document.querySelector('.wa-top small');
  if (!chat) return;
  var scripts = [
    [
      ['in', 'Good afternoon. Do you have the 20-litre emulsion in white?'],
      ['out', 'Good afternoon! 👋 Yes, the 20-litre white emulsion is in stock. Would you like a quote with delivery?'],
      ['in', 'Yes, 3 buckets to Zaria'],
      ['out', 'Here is your quote for 3 × 20L white emulsion, delivered to Zaria. Reply ORDER to confirm. ✅'],
      ['in', 'ORDER'],
      ['out', 'Order confirmed! 🎉 Our team will call you shortly to arrange delivery.']
    ],
    [
      ['in', 'Abeg, how much be the 4 litre gloss?'],
      ['out', 'No wahala! The 4-litre gloss dey available. You wan make I send you quote with delivery?'],
      ['in', 'Yes o, send am'],
      ['out', 'I don send the quote. Reply ORDER make we confirm am for you. 👍']
    ],
    [
      ['in', 'Sannu, ina son farashin fenti lita 20.'],
      ['out', 'Sannu! Fenti lita 20 yana nan. Kuna son farashi tare da kai kaya?'],
      ['in', 'Eh, don Allah.'],
      ['out', 'Na aiko muku da farashin. Ku rubuta ORDER don tabbatarwa. ✅']
    ],
    [
      ['in', 'My delivery has not arrived and I am not happy.'],
      ['out', 'I am sorry about that. 🙏 I have passed this to our customer care team as top priority.'],
      ['out', 'Amina from our team will message you here in a few minutes.']
    ]
  ];
  var minute = 2;
  function stamp() { minute = (minute + 1) % 60; return '14:' + (minute < 10 ? '0' : '') + minute; }
  function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
  function add(el) {
    chat.appendChild(el);
    while (chat.children.length > 6) chat.removeChild(chat.firstChild);
  }
  function bubble(dir, text) {
    var m = document.createElement('div');
    m.className = 'msg ' + dir;
    m.appendChild(document.createTextNode(text));
    var t = document.createElement('time');
    t.textContent = stamp();
    if (dir === 'out') {
      var ticks = document.createElement('span');
      ticks.className = 'ticks';
      ticks.textContent = '✓✓';
      t.appendChild(ticks);
    }
    m.appendChild(t);
    return m;
  }
  function typing() {
    var m = document.createElement('div');
    m.className = 'msg out typing';
    for (var i = 0; i < 3; i++) m.appendChild(document.createElement('i'));
    return m;
  }

  async function play() {
    await wait(700);
    chat.classList.add('live');
    var s = 0;
    for (;;) {
      Array.prototype.forEach.call(chat.children, function (c) { c.classList.add('leaving'); });
      await wait(350);
      chat.textContent = '';
      for (var i = 0; i < scripts[s].length; i++) {
        var step = scripts[s][i];
        if (step[0] === 'in') {
          await wait(550);
          add(bubble('in', step[1]));
        } else {
          await wait(250);
          var t = typing();
          add(t);
          if (status) { status.textContent = 'typing…'; status.classList.add('typing-label'); }
          await wait(600 + Math.min(step[1].length * 6, 600));
          if (t.parentNode) chat.removeChild(t);
          if (status) { status.textContent = 'online'; status.classList.remove('typing-label'); }
          add(bubble('out', step[1]));
        }
      }
      await wait(2400);
      s = (s + 1) % scripts.length;
    }
  }
  play();
})();
