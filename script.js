const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('open', open);
}

toggle.addEventListener('click', () => {
  setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});

nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});

document.getElementById('year').textContent = new Date().getFullYear();

// Background motion: speed streaks and embers rushing out from the lead rider,
// so it feels like the pack is barreling toward the viewer.
// To save battery, the streaks and the engine rumble run only while the hero is on
// screen and the tab is visible; the rest of the page keeps the slow surge only.
const fx = document.querySelector('.motion-fx');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (fx && !reduceMotion.matches) {
  const ctx = fx.getContext('2d');
  const dpr = 1; // streaks are soft and blurry by design; full phone resolution only costs battery
  let w = 0, h = 0, cx = 0, cy = 0, reach = 0;
  let particles = [];

  function spawn(p, fresh) {
    p.ember = Math.random() < 0.35;
    p.angle = Math.random() * Math.PI * 2;
    // start some mid-flight on first load so the screen isn't empty
    p.dist = reach * (fresh ? Math.random() * 0.9 : 0.04 + Math.random() * 0.12);
    p.speed = (p.ember ? 60 : 140) + Math.random() * 160;
    p.width = p.ember ? 1.5 + Math.random() * 2 : 0.8 + Math.random() * 1.4;
    return p;
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    fx.width = Math.round(w * dpr);
    fx.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // vanishing point sits on the lead rider's headlight
    cx = w * 0.5;
    cy = h * 0.42;
    reach = Math.hypot(w, h) * 0.6;
    const count = Math.round(Math.min(70, (w * h) / 14000));
    particles = Array.from({ length: count }, () => spawn({}, true));
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    for (const p of particles) {
      // accelerate as they get closer, like objects rushing past
      const t = p.dist / reach;
      p.dist += p.speed * (0.4 + t * 2.2) * dt;
      if (p.dist > reach) { spawn(p, false); continue; }

      const fade = Math.min(1, t * 3) * (1 - Math.max(0, t - 0.75) * 4);
      const tail = (p.ember ? 10 : 40) * (0.3 + t * 2.5);
      const cos = Math.cos(p.angle), sin = Math.sin(p.angle);
      const x1 = cx + cos * p.dist, y1 = cy + sin * p.dist;
      const x0 = cx + cos * (p.dist - tail), y0 = cy + sin * (p.dist - tail);

      ctx.lineWidth = p.width * (0.5 + t * 1.5);
      ctx.strokeStyle = p.ember
        ? `rgba(255, 138, 61, ${0.85 * fade})`
        : `rgba(225, 228, 220, ${0.34 * fade})`;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    if (running) requestAnimationFrame(frame);
  }

  let running = false, heroOnScreen = true;
  function update() {
    const go = heroOnScreen && !document.hidden;
    document.body.classList.toggle('in-hero', go);
    fx.style.visibility = go ? 'visible' : 'hidden';
    if (go && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    if (!go) running = false;
  }

  resize();
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });
  document.addEventListener('visibilitychange', update);
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { heroOnScreen = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(hero);
  }
  update();
}
