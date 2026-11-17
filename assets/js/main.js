/* Web demo · configuración en window.SITE (index.html) */
(() => {
  const C = window.SITE;
  const html = document.documentElement;
  let lang = 'es';

  /* ---------- Idioma ES / EN ---------- */
  const tx = [...document.querySelectorAll('[data-en]')];
  tx.forEach(e => { e.dataset.es = e.innerHTML; });
  const ph = [...document.querySelectorAll('[data-en-ph]')];
  ph.forEach(e => { e.dataset.esPh = e.placeholder; });
  const setLang = l => {
    lang = l; html.lang = l;
    tx.forEach(e => { e.innerHTML = e.dataset[l]; });
    ph.forEach(e => { e.placeholder = l === 'en' ? e.dataset.enPh : e.dataset.esPh; });
    document.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === l));
    document.querySelectorAll('[data-wa-link]').forEach(a => {
      a.href = `https://wa.me/${C.wa}?text=${encodeURIComponent(C.hola[l])}`;
    });
    pinta();
    try { localStorage.setItem(C.key + '-lang', l); } catch (_) {}
  };
  document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- Abierto / cerrado (hora de España) ---------- */
  const fmt = m => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
  const T = {
    es: { open: h => `Abierto · hasta las ${h}`, opens: h => `Cerrado · abre a las ${h}`, opensDay: (d, h) => `Cerrado · abre ${d} a las ${h}`, tomorrow: 'mañana', days: ['el domingo', 'el lunes', 'el martes', 'el miércoles', 'el jueves', 'el viernes', 'el sábado'] },
    en: { open: h => `Open now · until ${h}`, opens: h => `Closed · opens at ${h}`, opensDay: (d, h) => `Closed · opens ${d} at ${h}`, tomorrow: 'tomorrow', days: ['on Sunday', 'on Monday', 'on Tuesday', 'on Wednesday', 'on Thursday', 'on Friday', 'on Saturday'] }
  };
  const ahoraES = () => {
    const p = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
    const g = t => p.find(x => x.type === t).value;
    const dias = { dom: 0, lun: 1, mar: 2, mié: 3, jue: 4, vie: 5, sáb: 6 };
    return { d: dias[g('weekday').replace('.', '')] ?? new Date().getDay(), m: +g('hour') * 60 + +g('minute') };
  };
  function pinta() {
    const H = C.horario, t = T[lang];
    const { d, m } = ahoraES();
    const ab = (H[d] || []).find(([a, b]) => m >= a && m < b);
    let s;
    if (ab) s = t.open(fmt(ab[1]));
    else {
      const luego = (H[d] || []).find(([a]) => a > m);
      if (luego) s = t.opens(fmt(luego[0]));
      else for (let i = 1; i <= 7; i++) { const dd = (d + i) % 7; if ((H[dd] || []).length) { s = t.opensDay(i === 1 ? t.tomorrow : t.days[dd], fmt(H[dd][0][0])); break; } }
    }
    document.querySelectorAll('[data-estado]').forEach(e => { e.textContent = s; });
    document.querySelectorAll('[data-dot]').forEach(e => e.classList.toggle('is-open', !!ab));
    document.querySelectorAll('[data-d]').forEach(e => e.classList.toggle('is-today', +e.dataset.d === d));
  }
  pinta(); setInterval(pinta, 60000);

  /* ---------- Formulario -> WhatsApp ---------- */
  document.querySelectorAll('form[data-wa]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const v = n => {
      const el = f.elements[n]; if (!el) return '';
      if (el instanceof RadioNodeList) { const r = [...el].find(x => x.checked); return r ? r.nextElementSibling.textContent.trim() : ''; }
      if (el.tagName === 'SELECT') return el.options[el.selectedIndex].textContent.trim();
      return el.value.trim();
    };
    const err = f.querySelector('.form__err');
    if (!v('nombre')) { err.hidden = false; f.elements.nombre.focus(); return; }
    err.hidden = true;
    window.open(`https://wa.me/${C.wa}?text=${encodeURIComponent(C.msg(v, lang))}`, '_blank', 'noopener');
  }));

  /* ---------- Cabecera, revelado, menú ---------- */
  const top = document.querySelector('.top');
  const onScroll = () => top && top.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---------- Selector de color ---------- */
  const meta = document.querySelector('meta[name=theme-color]');
  const pon = t => {
    html.dataset.tema = t;
    document.querySelectorAll('.temas button').forEach(b => b.setAttribute('aria-pressed', b.dataset.set === t));
    if (meta && C.temas[t]) meta.content = C.temas[t];
    try { localStorage.setItem(C.key + '-tema', t); } catch (_) {}
  };
  document.querySelectorAll('.temas button').forEach(b => b.addEventListener('click', () => pon(b.dataset.set)));

  /* ---------- Recuerdo de preferencias ---------- */
  try {
    const t = localStorage.getItem(C.key + '-tema'); if (t && C.temas[t]) pon(t);
    const l = localStorage.getItem(C.key + '-lang'); if (l === 'en') setLang('en'); else setLang('es');
  } catch (_) { setLang('es'); }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
})();
