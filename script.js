const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(pointer:fine)').matches;
const canRunRichMotion = !prefersReducedMotion && supportsFinePointer;

const loader = document.querySelector('.loader');
const header = document.querySelector('.site-header');
const scrollProgressBar = document.querySelector('.scroll-progress__bar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-menu a, .header-cta');
const revealItems = document.querySelectorAll('.reveal');
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const counterElements = document.querySelectorAll('.counter');
const heroVisual = document.querySelector('.hero__visual[data-depth]');
const contactForm = document.querySelector('.contact-form');
const CONTACT_EMAIL = 'm.argareksapati21@gmail.com';

let latestPointerEvent = null;
let latestParallaxEvent = null;

window.addEventListener('load', () => {
  window.setTimeout(() => loader?.classList.add('is-hidden'), 320);
});

const updateScrollUI = () => {
  const scrollTop = window.scrollY;
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(scrollTop / maxScroll, 1);

  header?.classList.toggle('is-scrolled', scrollTop > 24);
  if (scrollProgressBar) {
    scrollProgressBar.style.transform = `scaleX(${progress})`;
  }
};

window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

navToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

revealItems.forEach((item, index) => {
  item.style.setProperty('--delay', `${Math.min(index * 0.035, 0.22)}s`);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealItems.forEach((item) => revealObserver.observe(item));

if (canRunRichMotion && cursorDot && cursorRing) {
  let cursorX = 0;
  let cursorY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener('pointermove', (event) => {
    latestPointerEvent = event;
    cursorX = event.clientX;
    cursorY = event.clientY;
    cursorDot.style.opacity = 1;
    cursorRing.style.opacity = 1;
    cursorDot.style.left = `${cursorX}px`;
    cursorDot.style.top = `${cursorY}px`;
  }, { passive: true });

  const cursorLoop = () => {
    ringX += (cursorX - ringX) * 0.16;
    ringY += (cursorY - ringY) * 0.16;
    cursorRing.style.left = `${ringX}px`;
    cursorRing.style.top = `${ringY}px`;
    requestAnimationFrame(cursorLoop);
  };

  cursorLoop();

  document.querySelectorAll('a, button, .tilt-card, input, textarea').forEach((el) => {
    el.addEventListener('pointerenter', () => cursorRing.classList.add('is-hovering'));
    el.addEventListener('pointerleave', () => cursorRing.classList.remove('is-hovering'));
  });
}

if (canRunRichMotion) {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    let frameRequested = false;

    card.addEventListener('pointermove', (event) => {
      latestPointerEvent = event;
      if (frameRequested) return;
      frameRequested = true;

      requestAnimationFrame(() => {
        frameRequested = false;
        const rect = card.getBoundingClientRect();
        const x = latestPointerEvent.clientX - rect.left;
        const y = latestPointerEvent.clientY - rect.top;
        const rotateY = ((x / rect.width) - 0.5) * 8;
        const rotateX = ((y / rect.height) - 0.5) * -8;
        card.style.setProperty('--mx', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--my', `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
    });
  });

  document.querySelectorAll('.magnetic').forEach((item) => {
    let frameRequested = false;

    item.addEventListener('pointermove', (event) => {
      latestPointerEvent = event;
      if (frameRequested) return;
      frameRequested = true;

      requestAnimationFrame(() => {
        frameRequested = false;
        const rect = item.getBoundingClientRect();
        const x = latestPointerEvent.clientX - rect.left - rect.width / 2;
        const y = latestPointerEvent.clientY - rect.top - rect.height / 2;
        item.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
      });
    });

    item.addEventListener('pointerleave', () => {
      item.style.transform = '';
    });
  });
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const element = entry.target;
    const target = Number(element.dataset.target || 0);
    const duration = 1100;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(target * eased).toLocaleString('id-ID');
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    counterObserver.unobserve(element);
  });
}, { threshold: 0.6 });

counterElements.forEach((counter) => counterObserver.observe(counter));

function createCanvasAnimator(canvas, options) {
  if (!canvas || prefersReducedMotion) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  let width = 0;
  let height = 0;
  let isActive = !document.hidden;
  let rafId = 0;
  let lastTime = 0;

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(Math.round(rect.width || window.innerWidth), 1);
    height = Math.max(Math.round(rect.height || window.innerHeight), 1);
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    options.onResize?.({ ctx, width, height });
  };

  const frameDuration = 1000 / options.fps;

  const loop = (time) => {
    if (!isActive) {
      rafId = 0;
      return;
    }

    if (time - lastTime >= frameDuration) {
      lastTime = time;
      options.draw({ ctx, width, height, time });
    }

    rafId = requestAnimationFrame(loop);
  };

  const start = () => {
    if (rafId || !isActive) return;
    lastTime = 0;
    rafId = requestAnimationFrame(loop);
  };

  const stop = () => {
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const setActive = (nextState) => {
    isActive = nextState && !document.hidden;
    if (isActive) start();
    else stop();
  };

  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    setActive(isActive);
  });

  resize();

  return { start, stop, setActive, resize };
}

function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || prefersReducedMotion) return;

  const particles = [];

  const animator = createCanvasAnimator(canvas, {
    fps: 24,
    onResize: ({ width, height }) => {
      particles.length = 0;
      const density = window.innerWidth < 900 ? 22000 : 18000;
      const count = Math.min(48, Math.floor((width * height) / density));

      for (let i = 0; i < count; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          size: Math.random() * 1.4 + 0.4,
        });
      }
    },
    draw: ({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(216, 195, 255, .54)';
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(185, 140, 255, ${0.11 * (1 - distance / 110)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
    },
  });

  animator?.start();
}

function initMountain() {
  const canvas = document.getElementById('mountainCanvas');
  if (!canvas || prefersReducedMotion) return;

  let t = 0;

  const animator = createCanvasAnimator(canvas, {
    fps: 18,
    draw: ({ ctx, width, height }) => {
      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(width * 0.6, height * 0.45, 0, width * 0.6, height * 0.45, width * 0.52);
      gradient.addColorStop(0, 'rgba(185, 140, 255, .24)');
      gradient.addColorStop(1, 'rgba(185, 140, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const drawRidge = (offset, alpha, amplitude) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const normalized = x / width;
          const peak = Math.exp(-Math.pow((normalized - 0.58) * 3.2, 2));
          const wave = Math.sin(normalized * Math.PI * 8 + t + offset) * 16
            + Math.cos(normalized * Math.PI * 5 + t * 0.7) * 10;
          const y = height * 0.78 - peak * amplitude + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(216, 195, 255, ${alpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      };

      for (let i = 0; i < 34; i += 1) {
        drawRidge(i * 0.24, 0.035 + i * 0.003, 78 + i * 2.9);
      }

      ctx.beginPath();
      ctx.moveTo(width * 0.16, height * 0.82);
      ctx.lineTo(width * 0.36, height * 0.58);
      ctx.lineTo(width * 0.48, height * 0.72);
      ctx.lineTo(width * 0.63, height * 0.24);
      ctx.lineTo(width * 0.78, height * 0.79);
      ctx.lineTo(width * 0.9, height * 0.58);
      ctx.strokeStyle = 'rgba(255,255,255,.18)';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      t += 0.01;
    },
  });

  if (!animator) return;

  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      animator.setActive(entry.isIntersecting);
    });
  }, { threshold: 0.15 });

  visibilityObserver.observe(canvas);
  animator.start();
}

initParticles();
initMountain();

if (heroVisual && canRunRichMotion) {
  let frameRequested = false;

  window.addEventListener('pointermove', (event) => {
    latestParallaxEvent = event;
    if (frameRequested) return;
    frameRequested = true;

    requestAnimationFrame(() => {
      frameRequested = false;
      const depth = Number(heroVisual.dataset.depth || 0);
      const x = (latestParallaxEvent.clientX / window.innerWidth - 0.5) * 100 * depth;
      const y = (latestParallaxEvent.clientY / window.innerHeight - 0.5) * 100 * depth;
      heroVisual.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }, { passive: true });
}

contactForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = contactForm.querySelector('.form-status');
  const formData = new FormData(contactForm);
  const entries = Array.from(formData.entries())
    .filter(([, value]) => String(value).trim().length > 0)
    .map(([key, value]) => `${key}: ${value}`);

  if (!CONTACT_EMAIL) {
    if (status) {
      status.textContent = 'Request belum terkirim. Isi CONTACT_EMAIL di script.js atau sambungkan form ke backend sebelum deploy production.';
    }
    return;
  }

  const company = formData.get('company') || 'Request Scope Pentest';
  const subject = encodeURIComponent(`[Jaspen] Request Scope Pentest - ${company}`);
  const body = encodeURIComponent(entries.join('\n'));

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  if (status) {
    status.textContent = 'Draft email request dibuka. Silakan kirim melalui aplikasi email Anda.';
  }
  contactForm.reset();
});
