// Utility: select
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Year in footer
(() => { const y = new Date().getFullYear(); const yearEl = $('#year'); if (yearEl) yearEl.textContent = y; })();

// Drawer nav toggle with overlay + scroll lock
(() => {
  const toggle = $('.nav-toggle');
  const menu = $('#nav-menu');
  const overlay = $('#drawer-overlay');
  if (!toggle || !menu || !overlay) return;
  const openDrawer = () => {
    menu.classList.add('open');
    overlay.classList.add('show');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('drawer-open');
  };
  const closeDrawer = () => {
    menu.classList.remove('open');
    overlay.classList.remove('show');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.documentElement.classList.remove('drawer-open');
  };
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    isOpen ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  $$('#nav-menu a').forEach((a) => a.addEventListener('click', closeDrawer));
})();

// Sticky header shadow on scroll
(() => {
  const header = $('#header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Smooth scroll offset for sticky header (enhanced behavior)
(() => {
  const header = $('#header');
  const headerHeight = () => (header ? header.offsetHeight : 0);
  const handleClick = (e) => {
    const anchor = e.currentTarget;
    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight() - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  };
  $$('.nav-menu a[href^="#"], .brand[href^="#"]').forEach((link) => link.addEventListener('click', handleClick));
})();

// Animated counters using IntersectionObserver
(() => {
  const counters = $$('.stat-value, .impact-number');
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.getAttribute('data-target') || '0');
    const durationMs = 1200;
    const startTs = performance.now();
    const startVal = 0;

    const formatter = new Intl.NumberFormat('en-US');

    const tick = (now) => {
      const progress = Math.min(1, (now - startTs) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = formatter.format(value);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => io.observe(el));
})();

// Basic client-side validation + toasts (simple)
(() => {
  const forms = ['#contact-form'].map((s) => $(s)).filter(Boolean);
  const showToast = (msg) => {
    const toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'fixed';
    toast.style.left = '50%';
    toast.style.bottom = '24px';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(21,101,192,0.95)';
    toast.style.color = '#fff';
    toast.style.padding = '10px 14px';
    toast.style.borderRadius = '10px';
    toast.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
    toast.style.zIndex = '2000';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const valid = form.checkValidity();
      if (!valid) {
        showToast('Please fill in the required fields correctly.');
        form.reportValidity();
        return;
      }
      form.reset();
      showToast('Thank you! Your submission has been received.');
    });
  });
})();

// Force dark mode
(() => { document.documentElement.classList.add('theme-dark'); localStorage.setItem('theme', 'dark'); })();

// Scroll progress bar and back-to-top
(() => {
  const bar = $('.scroll-progress span');
  const backTop = $('#back-to-top');
  if (!bar || !backTop) return;
  const update = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = pct + '%';
    if (h.scrollTop > 300) backTop.classList.add('show');
    else backTop.classList.remove('show');
  };
  document.addEventListener('scroll', update, { passive: true });
  update();
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

// Active section highlighting
(() => {
  const sections = $$('main section[id]');
  const navLinks = $$('#nav-menu a[href^="#"]');
  if (!sections.length || !navLinks.length) return;
  const map = new Map(navLinks.map((a) => [a.getAttribute('href'), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = '#' + entry.target.id;
      const link = map.get(id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.6 });
  sections.forEach((s) => io.observe(s));
})();

// Reveal on scroll
(() => {
  const reveals = $$('.reveal');
  if (!reveals.length) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  reveals.forEach((el) => io.observe(el));
})();

// Projects filter + modal
(() => {
  const chips = $$('.filters .chip');
  const cards = $$('.project-card');
  const grid = $('.projects-grid');
  if (!grid) return;
  // filter
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.getAttribute('data-filter');
    cards.forEach((card) => {
      const status = card.getAttribute('data-status');
      const show = f === 'all' || f === status;
      card.style.display = show ? '' : 'none';
    });
  }));
  // modal
  const modal = $('#project-modal');
  const modalImg = $('.modal-img', modal);
  const modalTitle = $('.modal-title', modal);
  const modalDesc = $('.modal-desc', modal);
  const modalStatus = $('.modal-status', modal);
  const close = () => { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); };
  $('.modal-close', modal).addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      modalImg.src = img ? img.src : '';
      modalTitle.textContent = card.getAttribute('data-title') || '';
      modalDesc.textContent = card.getAttribute('data-desc') || '';
      const status = card.getAttribute('data-status') || '';
      modalStatus.textContent = status.toUpperCase();
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
    });
  });
})();

// FAQ accordion
(() => {
  const items = $$('.faq-item');
  items.forEach((item) => {
    const q = $('.faq-q', item);
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', String(open));
    });
  });
})();


// Credit watchdog - preserves developer credit link in footer
(() => {
  const buildFooterBottom = () => {
    const footer = document.querySelector('footer.footer');
    if (!footer) return null;
    let bottom = footer.querySelector('.footer-bottom');
    if (!bottom) {
      bottom = document.createElement('div');
      bottom.className = 'footer-bottom';
      footer.appendChild(bottom);
    }
    let inner = bottom.querySelector('.footer-bottom-inner');
    if (!inner) {
      inner = document.createElement('div');
      inner.className = 'container footer-bottom-inner';
      bottom.appendChild(inner);
    }
    return inner;
  };

  const ensureCredit = () => {
    const inner = buildFooterBottom();
    if (!inner) return;
    const creditExists = Array.from(inner.querySelectorAll('a')).some((a) => (a.href || '').includes('rohitks.com.np'));
    if (!creditExists) {
      const span = document.createElement('span');
      span.innerHTML = 'Made with care for our community • Made by <a href="https://rohitks.com.np" target="_blank" rel="noopener noreferrer">rohitks</a>';
      inner.appendChild(span);
    }
  };

  ensureCredit();

  const footer = document.querySelector('footer.footer');
  if (!footer) return;
  const mo = new MutationObserver(() => ensureCredit());
  mo.observe(footer, { childList: true, subtree: true });

  // periodic recheck as fallback
  setInterval(ensureCredit, 3000);
})();


