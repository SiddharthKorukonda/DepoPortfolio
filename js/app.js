/* ═══════════════════════════════════════════════════════
   MOHADEB HALDER — PORTFOLIO ENGINE
   Routing · Particles · Animations · Interactions
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const loader      = document.getElementById('loader');
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const canvas      = document.getElementById('particles');
  const ctx         = canvas.getContext('2d');
  const pages       = document.querySelectorAll('.page');
  const navLinks    = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-link');
  const contactForm = document.getElementById('contact-form');

  let loaderDone = false;

  /* ── 1. LOADER ── */
  document.body.style.overflow = 'hidden';

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      loaderDone = true;
      initAnimations();

      const activePage = document.querySelector('.page.active');
      if (activePage) {
        activePage.classList.add('visible');
        triggerPageAnimations(activePage);
      }
    }, 2200);
  });

  /* ── 2. PARTICLES — warm copper/amber constellation ── */
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  const COUNT = 500;
  const LINK_DIST = 95;
  const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
  const MOUSE_R = 170;
  const MOUSE_R_SQ = MOUSE_R * MOUSE_R;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.r  = Math.random() * 1.6 + 0.4;
      this.alpha = Math.random() * 0.4 + 0.15;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < MOUSE_R_SQ && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (MOUSE_R - dist) / MOUSE_R * 0.012;
        this.vx += dx * force;
        this.vy += dy * force;
      }

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1) {
        this.vx *= 0.97;
        this.vy *= 0.97;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 149, 108, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    resizeCanvas();
    particles = [];
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());
  }

  function drawLinks() {
    const w = canvas.width;
    const h = canvas.height;
    const cell = LINK_DIST;
    const cols = Math.max(1, Math.ceil(w / cell));
    const rows = Math.max(1, Math.ceil(h / cell));
    const gridSize = cols * rows;
    const grid = new Array(gridSize);
    for (let g = 0; g < gridSize; g++) grid[g] = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const cx = Math.min(Math.floor(p.x / cell), cols - 1);
      const cy = Math.min(Math.floor(p.y / cell), rows - 1);
      grid[cy * cols + cx].push(i);
    }

    for (let i = 0; i < particles.length; i++) {
      const pi = particles[i];
      const cx = Math.min(Math.floor(pi.x / cell), cols - 1);
      const cy = Math.min(Math.floor(pi.y / cell), rows - 1);

      for (let oy = -1; oy <= 1; oy++) {
        const ny = cy + oy;
        if (ny < 0 || ny >= rows) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const nx = cx + ox;
          if (nx < 0 || nx >= cols) continue;
          const cellList = grid[ny * cols + nx];
          for (let k = 0; k < cellList.length; k++) {
            const j = cellList[k];
            if (j <= i) continue;
            const pj = particles[j];
            const dx = pi.x - pj.x;
            const dy = pi.y - pj.y;
            const dSq = dx * dx + dy * dy;
            if (dSq >= LINK_DIST_SQ) continue;
            const dist = Math.sqrt(dSq);
            const alpha = (1 - dist / LINK_DIST) * 0.09;
            ctx.beginPath();
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.strokeStyle = `rgba(200, 149, 108, ${alpha})`;
            ctx.lineWidth = 0.45;
            ctx.stroke();
          }
        }
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLinks();
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

  initParticles();
  tick();

  /* ── 3. ROUTER ── */
  const validPages = [
    'home', 'projects', 'project-1', 'project-2', 'project-3', 'resume', 'contact'
  ];

  function getPage() {
    const h = window.location.hash.replace('#', '') || 'home';
    return validPages.includes(h) ? h : 'home';
  }

  function navigateTo(id) {
    pages.forEach(p => p.classList.remove('active', 'visible'));

    const target = document.getElementById('page-' + id);
    if (!target) return;
    target.classList.add('active');

    if (loaderDone) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => target.classList.add('visible'));
      });
      triggerPageAnimations(target);
    }

    updateNav(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function updateNav(id) {
    const base = id.startsWith('project-') ? 'projects' : id;
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === base));
  }

  window.addEventListener('hashchange', () => { navigateTo(getPage()); closeMobile(); });
  navigateTo(getPage());

  /* ── 4. NAV SCROLL & MOBILE ── */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  function closeMobile() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }

  mobileLinks.forEach(l => l.addEventListener('click', closeMobile));

  document.addEventListener('click', e => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) closeMobile();
  });

  /* ── 5. ANIMATIONS ── */
  function initAnimations() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.anim-fade-up').forEach(el => obs.observe(el));
  }

  function triggerPageAnimations(page) {
    const els = page.querySelectorAll('.anim-fade-up');
    els.forEach(el => el.classList.remove('in-view'));
    setTimeout(() => {
      els.forEach((el, i) => setTimeout(() => el.classList.add('in-view'), i * 90));
    }, 200);
  }

  /* ── 6. TILT ── */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = (e.clientY - r.top - r.height / 2) / (r.height / 2) * -4;
      const ry = (e.clientX - r.left - r.width / 2) / (r.width / 2) * 4;
      card.style.transform = `translateY(-5px) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ── 7. CONTACT FORM ── */
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const span = contactForm.querySelector('.btn-fill span');
      const orig = span.textContent;
      span.textContent = 'Message Sent!';
      contactForm.reset();
      setTimeout(() => { span.textContent = orig; }, 3000);
    });
  }

  /* ── 8. KEYBOARD ── */
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobile(); });

})();
