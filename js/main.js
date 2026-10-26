/* Trazadores ambientales · Water Congress 2026 — scrollytelling */
(function () {
  'use strict';

  if (window.lucide) lucide.createIcons();

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = (v, d) => v.toFixed(d).replace('.', ',');

  /* ---------- static geometry built in JS ---------- */
  // Methodology river through 5 nodes
  const STAGES = [
    ['Caracterizar', 'database', 'Integrar hidroquímica histórica, fuentes de agua, condiciones hidrogeológicas, direcciones de flujo y estaciones de monitoreo.'],
    ['Discriminar', 'filter', 'Comparar el agua subterránea natural, el agua asociada al relave y las muestras de monitoreo. Evaluar contraste, solubilidad y comportamiento conservativo.'],
    ['Cuantificar', 'scale', 'Aplicar conservación de masa mediante un modelo de mezcla de dos componentes, usando extremos representativos y una muestra observada.'],
    ['Validar', 'shield-check', 'Contrastar la interpretación con el modelo conceptual, la evolución temporal, evidencia isotópica independiente y posibles procesos geoquímicos secundarios.'],
    ['Operacionalizar', 'cog', 'Automatizar la carga, selección, cálculo, visualización y reporte de resultados en Fraktal System.']
  ];
  const NODE_COL = ['#0e2a7a', '#0e4d9c', '#0b7a83', '#14a3a8', '#f2b134'];
  const riverY = x => 110 + 34 * Math.sin(Math.PI * (x - 120) / 240);
  let d = '';
  for (let x = 20; x <= 1180; x += 10) d += (x === 20 ? 'M' : 'L') + x + ' ' + riverY(x).toFixed(1) + ' ';
  $('#river').setAttribute('d', d);
  $('#river-bg').setAttribute('d', d);
  const ng = $('#river-nodes');
  const NS = 'http://www.w3.org/2000/svg';
  STAGES.forEach((s, i) => {
    const cx = 120 + i * 240;
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'stage-node');
    g.innerHTML =
      `<circle class="halo" cx="${cx}" cy="110" r="66" fill="${NODE_COL[i]}" opacity=".25"/>` +
      `<circle class="core" cx="${cx}" cy="110" r="46" fill="#06164a" stroke="${NODE_COL[i]}" stroke-width="4"/>` +
      `<text x="${cx}" y="122" text-anchor="middle" font-family="Oswald" font-weight="700" font-size="34" fill="#fff">0${i + 1}</text>` +
      `<text x="${cx}" y="205" text-anchor="middle" font-family="Oswald" font-weight="600" font-size="20" letter-spacing="1.5" fill="#cfdcea">${s[0].toUpperCase()}</text>`;
    ng.appendChild(g);
  });
  const nodes = $$('.stage-node');
  const setStage = i => {
    nodes.forEach((n, k) => {
      n.classList.toggle('on', k <= i);
      n.querySelector('.core').setAttribute('fill', k <= i ? NODE_COL[k] : '#06164a');
    });
    $('#sp-num').textContent = '0' + (i + 1);
    $('#sp-title').textContent = STAGES[i][0];
    $('#sp-text').textContent = STAGES[i][2];
  };
  setStage(0);

  // Contours for conceptual map
  const cg = $('#contours');
  for (let k = 1; k <= 5; k++) {
    let p = '';
    for (let j = 0; j <= 72; j++) {
      const a = 2 * Math.PI * j / 72, r = 28 * k * (1 + .12 * Math.sin(3 * a + k) + .07 * Math.cos(5 * a));
      p += (j ? 'L' : 'M') + (240 + r * 1.15 * Math.cos(a)).toFixed(1) + ' ' + (190 + r * .7 * Math.sin(a)).toFixed(1);
    }
    const e = document.createElementNS(NS, 'path'); e.setAttribute('d', p + 'Z'); cg.appendChild(e);
  }

  // Sankey bands (widths proportional to 11 % / 89 %)
  const band = (x0, t0, b0, x1, t1, b1) => {
    const m = (x0 + x1) / 2;
    return `M${x0} ${t0}C${m} ${t0} ${m} ${t1} ${x1} ${t1}L${x1} ${b1}C${m} ${b1} ${m} ${b0} ${x0} ${b0}Z`;
  };
  $('#sk-tl').setAttribute('d', band(36, 22, 55, 420, 70, 103));
  $('#sk-gw').setAttribute('d', band(36, 118, 385, 420, 103, 370));

  /* ---------- calculator ---------- */
  const cr = $('#cr'), cn = $('#cn'), cm = $('#cm');
  const SD = { r: .2, n: .01, m: .03 };
  function calc() {
    const R = +cr.value, N = +cn.value, M = +cm.value;
    $('#o-cr').textContent = fmt(R, 2); $('#o-cn').textContent = fmt(N, 3); $('#o-cm').textContent = fmt(M, 3);
    const warn = $('#warn');
    if (R - N <= 0.01) { $('#o-f').textContent = '—'; $('#o-s').textContent = 'EXTREMOS NO DIFERENCIABLES'; warn.textContent = 'El relave debe superar claramente al fondo natural.'; return; }
    let f = (M - N) / (R - N);
    const dm = 1 / (R - N), dn = (M - R) / (R - N) ** 2, dr = -(M - N) / (R - N) ** 2;
    const s = Math.sqrt((dm * SD.m) ** 2 + (dn * SD.n) ** 2 + (dr * SD.r) ** 2);
    warn.textContent = f < 0 ? 'La muestra está por debajo del fondo natural: no indica aporte de relave.'
      : f > 1 ? 'La muestra supera al extremo relave: revisar extremos o fuentes adicionales.' : '';
    const fc = Math.min(Math.max(f, 0), 1);
    $('#o-f').textContent = fmt(f * 100, 1);
    $('#o-s').textContent = '± ' + fmt(s * 100, 1) + ' PUNTOS PORCENTUALES';
    $('#o-gw').style.flex = (1 - fc) * 100; $('#o-tl').style.flex = fc * 100;
    $('#o-gw').textContent = Math.round((1 - fc) * 100) + ' %';
    $('#o-tl').textContent = Math.round(fc * 100);
    $('#lv-m').setAttribute('transform', `translate(${30 + 540 * fc} 0)`);
  }
  [cr, cn, cm].forEach(i => i.addEventListener('input', calc));
  $('#reset').addEventListener('click', () => { cr.value = 1.2; cn.value = .03; cm.value = .15; calc(); });
  calc();

  /* ---------- topbar / progress (always) ---------- */
  const topbar = $('#topbar'), bar = $('.progress span');
  const onScroll = () => {
    const h = document.documentElement;
    const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    bar.style.transform = `scaleX(${p})`;
    topbar.classList.toggle('solid', h.scrollTop > 40);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- tracker (stage sections) ---------- */
  const tracker = $('#tracker');
  const tLinks = $$('#tracker a');
  const staged = $$('[data-stage]');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { e.target._vis = e.isIntersecting; });
    const cur = staged.find(s => s._vis);
    tracker.classList.toggle('on', !!cur);
    if (cur) {
      const st = +cur.dataset.stage;
      tLinks.forEach(a => { const k = +a.dataset.s; a.classList.toggle('active', k === st); a.classList.toggle('done', k < st); });
    }
  }, { rootMargin: '-45% 0px -45% 0px' });
  staged.forEach(s => io.observe(s));

  /* ---------- motion ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) {
    document.documentElement.classList.remove('js');
    $$('.step').forEach(s => s.classList.add('on'));
    setStage(4);
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); lenis.scrollTo(a.getAttribute('href'), { offset: -10 }); }));
  }

  const prep = el => { const L = el.getTotalLength(); gsap.set(el, { strokeDasharray: L, strokeDashoffset: L }); return el; };

  // Hero intro + parallax
  gsap.from('.hero h1 .line > span', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: .1, delay: .15 });
  gsap.from('.hero .kicker, .hero-fade', { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: .15, delay: .6 });
  gsap.to('.hero .bg', { yPercent: 12, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero .wrap', { opacity: 0, y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });

  // Generic reveals
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: els => gsap.to(els, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1 })
  });

  // Counters
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } })
    });
  });

  const mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 901px)', mob: '(max-width: 900px)' }, ctx => {
    const desk = ctx.conditions.desk;
    // Pin only when the scene fits the viewport; otherwise scrub with normal scrolling.
    const scene = (sel, k, extra = {}) => {
      const el = $(sel);
      return el.offsetHeight <= innerHeight + 2
        ? Object.assign({ trigger: el, start: 'top top', end: '+=' + Math.round((desk ? k : k * .7) * 100) + '%', pin: true, scrub: 1 }, extra)
        : Object.assign({ trigger: el, start: 'top 70%', end: 'bottom 75%', scrub: 1 }, extra);
    };

    // 1 · Challenge
    const chArrows = $$('#desafio path.draw').map(prep);
    gsap.timeline({ scrollTrigger: scene('#desafio', 1.4) })
      .from('#ch-gw .bars rect, #ch-tl .bars rect', { scaleY: 0, transformOrigin: '50% 100%', stagger: .05, duration: .6 })
      .from('#ch-gw, #ch-tl', { opacity: .25, duration: .3 }, 0)
      .to(chArrows, { strokeDashoffset: 0, duration: .5, stagger: .1 })
      .from('#ch-pz', { opacity: 0, scale: .8, transformOrigin: '50% 50%', duration: .4 })
      .fromTo('#ch-callout', { borderColor: 'rgba(242,177,52,0)', boxShadow: '0 0 0 rgba(242,177,52,0)' }, { borderColor: '#f2b134', boxShadow: '0 0 40px rgba(242,177,52,.35)', duration: .3 });

    // 2 · Objectives wave
    const wave = prep($('#obj-wave'));
    gsap.to(wave, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.objectives', start: 'top 85%', end: 'top 35%', scrub: 1 } });
    gsap.from('.obj .node', { scale: 0, rotate: -90, stagger: .15, duration: .8, ease: 'back.out(1.7)', scrollTrigger: { trigger: '.objectives', start: 'top 75%' } });

    // 3 · Methodology river (pinned)
    const river = prep($('#river'));
    let last = -1;
    gsap.timeline({
      scrollTrigger: scene('#metodologia', 3, {
        scrub: .6,
        onUpdate: st => {
          const i = Math.min(4, Math.floor(st.progress * 5.2));
          if (i !== last) {
            last = i; setStage(i);
            gsap.fromTo('.stage-panel > *', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .35, stagger: .05, overwrite: true });
          }
        }
      })
    }).to(river, { strokeDashoffset: 0, ease: 'none' });

    // 4 · Conventional tracers
    const sch = $$('#schoeller .draw').map(prep);
    gsap.timeline({ scrollTrigger: { trigger: '#schoeller', start: 'top 80%', end: 'bottom 55%', scrub: 1 } })
      .to(sch, { strokeDashoffset: 0, duration: 1 })
      .from('#schoeller .dots circle', { scale: 0, transformOrigin: '50% 50%', stagger: .03, duration: .3 }, .2)
      .from('#schoeller .env', { opacity: 0, duration: .6 }, .5)
      .from('#overlap', { opacity: 0, y: 10, duration: .4 })
      .from('#qcol', { opacity: 0, scale: .85, transformOrigin: '50% 50%', duration: .5 });

    // 5 · Molybdenum (pinned)
    gsap.timeline({ scrollTrigger: scene('#molibdeno', 1.6) })
      .from('.mo-pt', { y: i => (i === 1 ? 60 : -60), opacity: 0, stagger: .25, duration: .5 })
      .from('.mo-pt .eb', { scaleX: 0, transformOrigin: '50% 50%', duration: .3 }, '<')
      .from('#mo-bracket', { scaleX: 0, transformOrigin: '50% 50%', opacity: 0, duration: .4 })
      .from('.cbar .fill', { scaleX: 0, stagger: .2, duration: .6 })
      .from('.cbar .val', { opacity: 0, x: -20, stagger: .2, duration: .3 }, '<.2')
      .from('.crit', { opacity: 0, x: 40, stagger: .15, duration: .4 }, .2);

    // 6 · Spatial / temporal
    gsap.from('#map .pin-g > g', { y: -30, opacity: 0, stagger: .12, duration: .6, ease: 'bounce.out', scrollTrigger: { trigger: '#map', start: 'top 70%' } });
    gsap.from('#bands .band', { scaleX: 0, transformOrigin: '0% 50%', stagger: .15, ease: 'none', scrollTrigger: { trigger: '#bands', start: 'top 80%', end: 'center 50%', scrub: 1 } });
    gsap.from('.chain span', { opacity: 0, y: 20, stagger: .08, scrollTrigger: { trigger: '.chain', start: 'top 92%' } });

    // 7 · Quantification (pinned)
    gsap.timeline({ scrollTrigger: scene('#cuantificacion', 1.5) })
      .fromTo('#sk-rect', { attr: { width: 40 } }, { attr: { width: 540 }, duration: 1, ease: 'none' })
      .from('#res-num', { scale: .4, opacity: 0, transformOrigin: '0% 60%', duration: .5 }, .55)
      .from('.pp, .formula', { opacity: 0, y: 20, stagger: .1, duration: .3 })
      .from('#stack div', { scaleX: 0, stagger: .15, duration: .4 });

    // 8 · Validation triangle
    const tri = prep($('#tri .draw'));
    gsap.timeline({ scrollTrigger: { trigger: '#tri', start: 'top 75%', end: 'center 45%', scrub: 1 } })
      .to(tri, { strokeDashoffset: 0, duration: 1 })
      .from('#tri .tnode', { scale: 0, stagger: .15, duration: .3 }, .1)
      .from('#tri .tlabel', { opacity: 0, y: 12, stagger: .15, duration: .3 }, .3);

    // 9 · Fraktal
    gsap.fromTo('#browser', { rotateX: 28, rotateY: -14, scale: .86, opacity: .4 }, {
      rotateX: 0, rotateY: 0, scale: 1, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '#browser', start: 'top 95%', end: 'center 55%', scrub: 1 }
    });
    const steps = $$('#steps .step');
    ScrollTrigger.create({
      trigger: '#steps', start: 'top 90%', end: 'top 45%', scrub: true,
      onUpdate: st => steps.forEach((s, i) => s.classList.toggle('on', st.progress >= i / steps.length + .02)),
      onLeave: () => steps.forEach(s => s.classList.add('on'))
    });

    // 10 · Closing parallax
    gsap.fromTo('.closing .bg', { yPercent: -8, scale: 1.1 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.closing', start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
