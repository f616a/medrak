/* مِدراك | common.js — يشترك بين كل صفحات الموقع
   • نظام تفضيلات موحّد (medrakPrefs): لوحة الألوان، الوضع الفاتح/الداكن، تصميم الصفحة،
     اللغة (RTL/LTR)، صيغة المخاطبة (مذكر/مؤنث)، دائرة الضوء، الأصوات — مع معاينة قبل الاعتماد.
   • نصوص ثنائية اللغة والصيغة عبر data-ar/data-en/data-m/data-f (+ aria/title/placeholder).
   • تتبّع النشاط، النسبة العامة، الأصوات المولّدة، الاحتفال، التبويبات والأكورديون.
   كل خطوة تهيئة مغلّفة بدالة safe() مستقلة — فشل جزء واحد ما يوقف الباقي. */
(function(){
  "use strict";
  function safe(fn, label){
    try { fn(); } catch(err){ console.error('common.js: "'+label+'" failed:', err); }
  }

  const root = document.getElementById('medrak-root');
  if (!root) return;
  const html = document.documentElement;
  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function LS(key, fallback){ try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch(e){ return fallback; } }
  function LSset(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }
  function LSdel(key){ try { localStorage.removeItem(key); } catch(e){} }

  /* ============================================================
     التفضيلات
     ============================================================ */
  const KEYS = { theme:'medrak_theme', lang:'medrak_lang', gender:'medrak_gender', palette:'medrak_palette', layout:'medrak_layout', spotlight:'medrak_spotlight', muted:'medrak_muted' };
  const PALETTE_IDS = ['classic','rose','emerald','ocean','lavender','sand'];
  const LAYOUT_IDS = ['sidebar','compact','wide','sequential'];
  const DEFAULTS = { theme:'light', lang:'ar', isFemale:false, palette:null, layout:'sidebar', spotlight:true, muted:true };

  function readSaved(){
    const pal = LS(KEYS.palette, null);
    const lay = LS(KEYS.layout, 'sidebar');
    return {
      theme: LS(KEYS.theme, 'light') === 'dark' ? 'dark' : 'light',
      lang: LS(KEYS.lang, 'ar') === 'en' ? 'en' : 'ar',
      isFemale: !!LS(KEYS.gender, false),
      palette: PALETTE_IDS.indexOf(pal) >= 0 ? pal : null,          /* null = تلقائي حسب الصيغة */
      layout: LAYOUT_IDS.indexOf(lay) >= 0 ? lay : 'sidebar',
      spotlight: LS(KEYS.spotlight, true) !== false,
      muted: LS(KEYS.muted, true) !== false,
    };
  }
  const state = readSaved();
  window.medrakState = state;

  function resolvedPalette(s){ return s.palette || (s.isFemale ? 'rose' : 'classic'); }

  function applyToDom(s){
    html.setAttribute('data-theme', s.theme);
    html.setAttribute('data-palette', resolvedPalette(s));
    html.setAttribute('data-layout', s.layout);
    html.setAttribute('data-spotlight', s.spotlight ? 'on' : 'off');
    html.setAttribute('data-gender', s.isFemale ? 'female' : 'male');
    html.setAttribute('lang', s.lang);
    html.setAttribute('dir', s.lang === 'en' ? 'ltr' : 'rtl');
    root.classList.toggle('fem', s.isFemale);
  }

  /** يطبّق كل النصوص (لغة/صيغة) على كل العناصر الموسومة — يعيد الاستعلام كل مرة ليشمل العناصر المضافة ديناميكيًا */
  function applyAllText(){
    const lang = state.lang, fem = state.isFemale, en = lang === 'en';
    document.querySelectorAll('[data-ar][data-en]:not([data-m])').forEach(function(el){ el.textContent = en ? el.dataset.en : el.dataset.ar; });
    document.querySelectorAll('[data-m][data-f]').forEach(function(el){
      if (en && el.dataset.en) el.textContent = el.dataset.en;
      else el.textContent = fem ? el.dataset.f : el.dataset.m;
    });
    document.querySelectorAll('[data-ph-m], [data-ph-ar]').forEach(function(el){
      const d = el.dataset;
      if (en && d.phEn) el.placeholder = d.phEn;
      else if (d.phM && d.phF) el.placeholder = fem ? d.phF : d.phM;
      else if (d.phAr) el.placeholder = d.phAr;
    });
    document.querySelectorAll('[data-aria-ar]').forEach(function(el){
      const v = en ? el.dataset.ariaEn : (fem && el.dataset.ariaF ? el.dataset.ariaF : el.dataset.ariaAr);
      if (v) el.setAttribute('aria-label', v);
    });
    document.querySelectorAll('[data-title-ar]').forEach(function(el){
      const v = en ? el.dataset.titleEn : el.dataset.titleAr;
      if (v) el.setAttribute('title', v);
    });
    const meta = document.querySelector('meta[name="description"][data-en]');
    if (meta) meta.setAttribute('content', en ? meta.dataset.en : meta.dataset.ar);
  }
  window.medrakApplyText = applyAllText;

  function savePrefs(s){
    LSset(KEYS.theme, s.theme); LSset(KEYS.lang, s.lang); LSset(KEYS.gender, s.isFemale);
    if (s.palette) LSset(KEYS.palette, s.palette); else LSdel(KEYS.palette);
    LSset(KEYS.layout, s.layout); LSset(KEYS.spotlight, s.spotlight); LSset(KEYS.muted, s.muted);
  }

  window.medrakPrefs = {
    defaults: DEFAULTS,
    paletteIds: PALETTE_IDS,
    layoutIds: LAYOUT_IDS,
    resolvedPalette: function(){ return resolvedPalette(state); },
    get: function(){ return Object.assign({}, state); },
    saved: readSaved,
    /** يطبّق تفضيلات (جزئية) فورًا. persist=true يحفظها، وبدونها تبقى معاينة فقط */
    apply: function(partial, persist){
      const prev = Object.assign({}, state);
      Object.keys(partial || {}).forEach(function(k){
        if (!(k in state)) return;
        const v = partial[k];
        if (k === 'theme') state.theme = v === 'dark' ? 'dark' : 'light';
        else if (k === 'lang') state.lang = v === 'en' ? 'en' : 'ar';
        else if (k === 'palette') state.palette = PALETTE_IDS.indexOf(v) >= 0 ? v : null;
        else if (k === 'layout') state.layout = LAYOUT_IDS.indexOf(v) >= 0 ? v : 'sidebar';
        else if (k === 'isFemale' || k === 'spotlight' || k === 'muted') state[k] = !!v;
      });
      applyToDom(state);
      applyAllText();
      if (persist) savePrefs(state);
      if (prev.isFemale !== state.isFemale && typeof window.onGenderChange === 'function') {
        try { window.onGenderChange(state.isFemale); } catch(e){ console.error(e); }
      }
      window.dispatchEvent(new CustomEvent('medrak:prefs', { detail: { state: Object.assign({}, state), prev: prev } }));
    },
    commit: function(){ savePrefs(state); },
    revert: function(){ this.apply(readSaved(), false); },
    reload: function(){ this.apply(readSaved(), false); },
  };
  /* متوافق مع الكود القديم */
  window.medrakSetGender = function(isFemale){ window.medrakPrefs.apply({ isFemale: !!isFemale }, true); };
  window.medrakSetLanguage = function(lang){ window.medrakPrefs.apply({ lang: lang }, true); };

  safe(function(){ applyToDom(state); applyAllText(); }, 'initPrefs');

  /* ============================================================
     النشاط والتقدم والاسم
     ============================================================ */
  function todayKey(d){
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  window.medrakTodayKey = todayKey;

  /** يسجّل أن المستخدم نشط اليوم (لشريط الأسبوع والتتابع بالرئيسية) */
  window.medrakLogActivity = function(){
    if (!window.MedrakStore) return;
    const days = MedrakStore.get('activityDays', []) || [];
    const k = todayKey();
    if (days.indexOf(k) < 0) { days.push(k); MedrakStore.set('activityDays', days.slice(-120)); }
  };

  safe(function trackLastVisited(){
    if (!window.MedrakStore) return;
    const pageLabels = {
      'index.html': 'الرئيسية', 'study-plan.html': 'الخطة الدراسية', 'education.html': 'التعليم',
      'articles.html': 'المقالات', 'decision-lab.html': 'مختبر القرار', 'communication.html': 'التواصل والتفاوض',
      'research-lab.html': 'البحث والتحليل', 'world-institutions.html': 'العالم والمؤسسات',
      'media-literacy.html': 'الوعي المعلوماتي', 'career.html': 'مستقبلك المهني', 'alumni.html': 'خريجو مِدراك',
      'profile.html': 'ملفي في مِدراك',
    };
    let page = location.pathname.split('/').pop() || 'index.html';
    if (!pageLabels[page]) page = 'index.html';
    window.medrakLogActivity();
    if (page === 'index.html') return; /* ما نسجل الرئيسية نفسها كـ"آخر صفحة" */
    MedrakStore.set('lastVisited', { page: page, label: pageLabels[page], at: new Date().toISOString() });
  }, 'trackLastVisited');

  /** يسجّل آخر إنجاز لعرضه بالرئيسية — تستدعيه أي صفحة عند لحظة إنجاز حقيقية */
  window.medrakRecordAchievement = function(text){
    if (!window.MedrakStore) return;
    MedrakStore.set('lastAchievement', { text: text, at: new Date().toISOString() });
    window.medrakLogActivity();
  };

  /** ينظّف الاسم المستعار: يمنع HTML/أكواد، يقص المسافات الزائدة، يحدد الطول */
  window.medrakSanitizeName = function(raw){
    if (!raw) return '';
    let s = String(raw).replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
    s = s.replace(/\s+/g, ' ').trim();
    return s.slice(0, 30);
  };

  /** أول حرف من الاسم (للصورة الرمزية عند عدم رفع صورة) */
  window.medrakInitial = function(name){
    const s = String(name || '').trim();
    const m = s.match(/\p{L}/u);
    return (m ? m[0] : (s[0] || '؟')).toUpperCase();
  };

  /** نسبة تقدم تقريبية: كم من ميزات الموقع القابلة للتتبع جرّبها المستخدم فعليًا */
  window.medrakComputeProgress = function(){
    if (!window.MedrakStore) return 0;
    const keys = ['crisisLab','policySim','nationBuilder','mediaLiteracy','careerQuiz','pressConference','negotiationRoom','diplomaticLanguage','researchMethodsPlan'];
    let done = keys.filter(function(k){ return !!MedrakStore.get(k); }).length;
    if (((MedrakStore.get('studyPlanProgress', { completedCodes: [] }) || {}).completedCodes || []).length > 0) done++;
    if ((MedrakStore.get('semesterTasks', []) || []).length > 0) done++;
    if ((MedrakStore.get('interviewAnswers', []) || []).length > 0) done++;
    return Math.round((done / (keys.length + 3)) * 100);
  };

  /* ============================================================
     عناصر الصفحة العامة
     ============================================================ */
  safe(function initBackTop(){
    const backTop = document.getElementById('backTop');
    if (!backTop) return;
    window.addEventListener('scroll', function(){ backTop.classList.toggle('show', window.scrollY > 500); }, { passive: true });
    backTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }); });
  }, 'initBackTop');

  safe(function initScrollProgress(){
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update(){
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      bar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }, 'initScrollProgress');

  safe(function initParticleField(){
    const field = document.getElementById('particle-field');
    if (!field || reducedMotion) return;
    const count = window.innerWidth < 700 ? 14 : 26;
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.style.top = Math.random() * 100 + '%';
      span.style.insetInlineStart = Math.random() * 100 + '%';
      span.style.animationDuration = (10 + Math.random() * 10) + 's';
      span.style.animationDelay = (Math.random() * 8) + 's';
      field.appendChild(span);
    }
  }, 'initParticleField');

  safe(function initReveal(){
    const sections = document.querySelectorAll('#medrak-root main > section');
    if (!sections.length) return;
    sections.forEach(function(s){ s.classList.add('reveal'); });
    if (reducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach(function(s){ s.classList.add('in'); });
      return;
    }
    const observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    sections.forEach(function(s){ observer.observe(s); });
    /* شبكة أمان: أي قسم ما انكشف خلال 3 ثواني يظهر تلقائيًا */
    setTimeout(function(){ sections.forEach(function(s){ s.classList.add('in'); }); }, 3000);
  }, 'initReveal');

  /* ===== أكورديون وتبويبات عامة ===== */
  window.medrakWireAccordion = function(container){
    container.querySelectorAll('.accordion-item').forEach(function(item){
      const head = item.querySelector('.accordion-head');
      const body = item.querySelector('.accordion-body');
      if (!head || !body || head.dataset.wired) return;
      head.dataset.wired = '1';
      head.setAttribute('aria-expanded', 'false');
      head.addEventListener('click', function(){
        const isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
        head.setAttribute('aria-expanded', String(!isOpen));
        body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : '0px';
      });
    });
  };
  safe(function(){ window.medrakWireAccordion(document); }, 'accordionInit');

  window.medrakWireTabs = function(container){
    container.querySelectorAll('.tab-btn').forEach(function(btn){
      if (btn.dataset.wired || btn.disabled) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', function(){
        const group = this.closest('.tabs').dataset.group || 'default';
        container.querySelectorAll('.tab-btn').forEach(function(b){ if ((b.closest('.tabs').dataset.group || 'default') === group) b.classList.remove('active'); });
        container.querySelectorAll('.tab-panel').forEach(function(p){ if ((p.dataset.group || 'default') === group) p.classList.remove('active'); });
        this.classList.add('active');
        const panel = container.querySelector('.tab-panel[data-group="' + group + '"][data-panel="' + this.dataset.tab + '"]') ||
                      container.querySelector('.tab-panel[data-panel="' + this.dataset.tab + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  };
  safe(function(){ window.medrakWireTabs(document); }, 'tabsInit');

  /* ===== إغلاق النوافذ القديمة بالضغط خارجها أو بـ Esc ===== */
  safe(function(){
    document.querySelectorAll('.modal-overlay').forEach(function(overlay){
      overlay.addEventListener('click', function(e){ if (e.target === this) this.classList.remove('show'); });
    });
    document.addEventListener('keydown', function(e){
      if (e.key !== 'Escape') return;
      const m = document.querySelector('.modal-overlay.show');
      if (m) m.classList.remove('show');
    });
  }, 'modalClose');

  /* ============================================================
     محرك أصوات مولّدة عبر Web Audio API — بدون أي ملفات صوتية خارجية
     ============================================================ */
  safe(function initSound(){
    let ctx = null;
    function ensureCtx(){ if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } return ctx; }
    function tone(freq, dur, type, gainPeak, delay){
      const c = ensureCtx(); if (!c) return;
      if (c.state === 'suspended' && c.resume) c.resume();
      const osc = c.createOscillator(); const gain = c.createGain();
      osc.type = type || 'sine'; osc.frequency.value = freq;
      const start = c.currentTime + (delay || 0);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(gainPeak || 0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain); gain.connect(c.destination);
      osc.start(start); osc.stop(start + dur + 0.05);
    }
    function play(name){
      if (state.muted) return;
      if (name === 'click') tone(600, 0.08, 'sine', 0.08, 0);
      else if (name === 'success') { tone(660, 0.14, 'sine', 0.12, 0); tone(880, 0.18, 'sine', 0.12, 0.12); }
      else if (name === 'error') tone(220, 0.22, 'sawtooth', 0.10, 0);
      else if (name === 'achievement') { tone(523, 0.12, 'sine', 0.12, 0); tone(659, 0.12, 'sine', 0.12, 0.1); tone(784, 0.22, 'sine', 0.14, 0.2); }
    }
    window.medrakSound = { play: play };
  }, 'initSound');

  /* ============================================================
     الاحتفال (Confetti) — يُستدعى عند إنجاز حقيقي. ألوانه من لوحة الموقع الحالية
     ============================================================ */
  window.medrakConfetti = function(){
    if (reducedMotion) return;
    const cs = getComputedStyle(html);
    const colors = ['--purple', '--teal', '--purple-soft', '--yellow', '--purple-text'].map(function(v){ return cs.getPropertyValue(v).trim() || '#C9A24B'; });
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2500';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx2d = canvas.getContext('2d');
    const pieces = [];
    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: canvas.width / 2, y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 11, vy: -Math.random() * 11 - 4,
        size: 5 + Math.random() * 5, rot: Math.random() * 360, vr: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    let frame = 0;
    function step(){
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(function(p){
        p.vy += 0.18; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx2d.save(); ctx2d.translate(p.x, p.y); ctx2d.rotate(p.rot * Math.PI / 180);
        ctx2d.fillStyle = p.color; ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx2d.restore();
      });
      frame++;
      if (frame < 100) requestAnimationFrame(step); else canvas.remove();
    }
    requestAnimationFrame(step);
  };

})();
