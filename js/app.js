/* ═══════════════════════════════════════════════════════
   MOHADEB HALDER — PORTFOLIO ENGINE
   Handles routing, particles, animations & interactions
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── DOM References ── */
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

  /* ═══════════════════════════════════════════════════════
     1. LOADING SCREEN
     ═══════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════
     2. PARTICLE CONSTELLATION SYSTEM
     ═══════════════════════════════════════════════════════ */
  let particles = [];
  let mouse = { x: -1000, y: -1000 };
  const PARTICLE_COUNT = 80;
  const CONNECTION_DIST = 140;
  const MOUSE_RADIUS = 180;

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.r  = Math.random() * 1.8 + 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < MOUSE_RADIUS) {
        const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.015;
        this.vx += dx * force;
        this.vy += dy * force;
      }

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.2) {
        this.vx *= 0.98;
        this.vy *= 0.98;
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    resizeCanvas();
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }

  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  initParticles();
  animateParticles();

  /* ═══════════════════════════════════════════════════════
     3. HASH-BASED ROUTER
     ═══════════════════════════════════════════════════════ */
  const validPages = [
    'home', 'projects', 'project-1', 'project-2', 'project-3', 'resume', 'contact'
  ];

  function getPageFromHash() {
    const hash = window.location.hash.replace('#', '') || 'home';
    return validPages.includes(hash) ? hash : 'home';
  }

  function navigateTo(pageId) {
    pages.forEach(page => {
      page.classList.remove('active', 'visible');
    });

    const target = document.getElementById('page-' + pageId);
    if (!target) return;

    target.classList.add('active');

    if (loaderDone) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          target.classList.add('visible');
        });
      });
      triggerPageAnimations(target);
    }

    updateNavActive(pageId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function updateNavActive(pageId) {
    const baseId = pageId.startsWith('project-') ? 'projects' : pageId;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === baseId);
    });
  }

  window.addEventListener('hashchange', () => {
    navigateTo(getPageFromHash());
    closeMobileMenu();
  });

  navigateTo(getPageFromHash());

  /* ═══════════════════════════════════════════════════════
     4. NAVIGATION
     ═══════════════════════════════════════════════════════ */
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
  });

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMobileMenu();
    }
  });

  /* ═══════════════════════════════════════════════════════
     5. SCROLL / INTERSECTION ANIMATIONS
     ═══════════════════════════════════════════════════════ */
  function initAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.anim-fade-up').forEach(el => {
      observer.observe(el);
    });
  }

  function triggerPageAnimations(page) {
    const elements = page.querySelectorAll('.anim-fade-up');
    elements.forEach(el => el.classList.remove('in-view'));

    setTimeout(() => {
      elements.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('in-view');
        }, i * 100);
      });
    }, 250);
  }

  /* ═══════════════════════════════════════════════════════
     6. 3D TILT EFFECT ON PROJECT CARDS
     ═══════════════════════════════════════════════════════ */
  document.querySelectorAll('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / centerY * -5;
      const rotateY = (x - centerX) / centerX * 5;

      card.style.transform =
        `translateY(-6px) perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ═══════════════════════════════════════════════════════
     7. CONTACT FORM
     ═══════════════════════════════════════════════════════ */
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = contactForm.querySelector('.btn-submit span');
      const original = btn.textContent;
      btn.textContent = 'Message Sent!';
      contactForm.reset();

      setTimeout(() => {
        btn.textContent = original;
      }, 3000);
    });
  }

  /* ═══════════════════════════════════════════════════════
     8. KEYBOARD NAVIGATION
     ═══════════════════════════════════════════════════════ */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

})();
