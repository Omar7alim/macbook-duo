const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const laptop = $('#laptop');

/* ---- 3D laptop: drag to rotate, view buttons, model switch ---- */
let ry = -14, rx = -4, drag = null, idle = true;
const apply = () => laptop.style.transform = `scale(var(--s,1)) rotateX(${rx}deg) rotateY(${ry}deg)`;
const stage = $('#stage');
stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, ry, rx }; idle = false; laptop.classList.add('drag'); stage.setPointerCapture(e.pointerId); });
stage.addEventListener('pointermove', e => {
  if (!drag) return;
  ry = drag.ry + (e.clientX - drag.x) * .4;
  rx = Math.max(-40, Math.min(15, drag.rx - (e.clientY - drag.y) * .2));
  apply(); markPorts();
});
['pointerup', 'pointercancel'].forEach(t => stage.addEventListener(t, () => { drag = null; laptop.classList.remove('drag'); }));
function markPorts() { const a = ((ry % 360) + 360) % 360; laptop.classList.toggle('ports-view', a > 40 && a < 110); }
$$('#views button').forEach(b => b.onclick = () => {
  const [y, x] = b.dataset.r.split(',').map(Number);
  ry = y; rx = x; idle = false; apply(); markPorts();
  $$('#views button').forEach(o => o.classList.toggle('on', o === b));
});
setInterval(() => { if (idle && !drag) { ry = -14 + Math.sin(Date.now() / 1500) * 12; apply(); } }, 60);

function setModel(duo) {
  laptop.classList.toggle('duo', duo);
  $$('#ver button').forEach(b => b.classList.toggle('on', (b.dataset.v === 'duo') === duo));
  $$('#pick button').forEach(b => b.classList.toggle('on', (b.dataset.p === '2,499') === duo));
  $('.price-from').textContent = '$1,999';
}
$$('#ver button').forEach(b => b.onclick = () => setModel(b.dataset.v === 'duo'));
$('#seeduo').onclick = () => { setModel(true); window.scrollTo({ top: 0 }); };
$$('#pick button').forEach(b => b.onclick = () => setModel(b.dataset.p === '2,499'));

/* ---- Animated bars (speed + IR) ---- */
function fillBars(root, max) {
  root.querySelectorAll('.bar').forEach(b => b.style.width = (b.dataset.w / max * 100) + '%');
  root.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count, t0 = performance.now();
    (function tick(t) { const p = Math.min((t - t0) / 1400, 1); el.textContent = Math.round(end * p); if (p < 1) requestAnimationFrame(tick); })(t0);
  });
}
[['.bars', 130], ['.ir', 100]].forEach(([sel, max]) => {
  const el = $(sel);
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { fillBars(el, max); o.disconnect(); } }, { threshold: .4 }).observe(el);
});

/* ---- Notch comparison ---- */
const nshape = $('#nshape');
function setNotch(w) {
  nshape.style.width = w + 'px';
  $$('#ncmp button').forEach(b => b.classList.toggle('on', +b.dataset.w === w));
}
$$('#ncmp button').forEach(b => b.onclick = () => setNotch(+b.dataset.w));
setNotch(200);
new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { setTimeout(() => setNotch(110), 500); o.disconnect(); } }, { threshold: .6 }).observe(nshape);

/* ---- Fake pre-order ---- */
$('#go').onclick = () => {
  const ok = /^\S+@\S+\.\S+$/.test($('#email').value.trim());
  const duo = laptop.classList.contains('duo');
  $('#msg').textContent = ok ? `Thanks! Your ${duo ? 'M6 Duo' : 'M6'} pre-order is a concept, so nothing was sent.` : 'Enter a valid email address.';
};
