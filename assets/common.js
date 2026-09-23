/* مِدراك | common.js — يشترك بين كل صفحات الموقع
   طلاب/طالبات + عربي/إنجليزي + الوضع الداكن (كلها محفوظة بـlocalStorage)،
   حقل الجزيئات، شريط تقدّم القراءة، الكشف عند التمرير، محرك أصوات مولّدة، الاحتفال (Confetti).
   كل خطوة تهيئة مغلّفة بدالة safe() مستقلة — فشل جزء واحد ما يوقف الباقي. */
(function(){
  "use strict";
  function safe(fn, label){
    try { fn(); } catch(err){ console.error('common.js: "'+label+'" failed:', err); }
  }

  const root = document.getElementById('medrak-root');
  if (!root) return;
  const html = document.documentElement;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function LS(key, fallback){ try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch(e){ return fallback; } }
  function LSset(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }

  window.medrakState = {
    isFemale: LS('medrak_gender', false),
    lang: LS('medrak_lang', 'ar'),
    theme: LS('medrak_theme', 'light'),
    muted: LS('medrak_muted', true),
  };

  /* ===== تتبع آخر صفحة تمت زيارتها (لزر "أكمل من حيث توقفت") ===== */
  safe(function trackLastVisited(){
    if (!window.MedrakStore) return;
    const pageLabels = {
      'index.html': 'الرئيسية', 'study-plan.html': 'الخطة الدراسية', 'education.html': 'التعليم',
      'articles.html': 'المقالات', 'decision-lab.html': 'مختبر القرار', 'world-institutions.html': 'العالم والمؤسسات',
      'media-literacy.html': 'الوعي المعلوماتي', 'career.html': 'مستقبلك المهني', 'alumni.html': 'خريجو مِدراك',
      'profile.html': 'ملفي في مِدراك',
    };
    let page = location.pathname.split('/').pop() || 'index.html';
    if (!pageLabels[page]) page = 'index.html';
    if (page === 'index.html') return; /* ما نسجل الرئيسية نفسها كـ"آخر صفحة" */
    MedrakStore.set('lastVisited', { page, label: pageLabels[page], at: new Date().toISOString() });
  }, 'trackLastVisited');

  /** يسجّل آخر إنجاز لعرضه ببطاقة الترحيب بالرئيسية — تستدعيه أي صفحة عند لحظة إنجاز حقيقية */
  window.medrakRecordAchievement = function(text){
    if (!window.MedrakStore) return;
    MedrakStore.set('lastAchievement', { text, at: new Date().toISOString() });
  };

  /** ينظّف الاسم المستعار: يمنع HTML/أكواد، يقص المسافات الزائدة، يحدد الطول */
  window.medrakSanitizeName = function(raw){
    if (!raw) return '';
    let s = String(raw).replace(/<[^>]*>/g, '').replace(/[<>]/g, '');
    s = s.replace(/\s+/g, ' ').trim();
    return s.slice(0, 30);
  };

  /** نسبة تقدم تقريبية: كم من الميزات القابلة للتتبع جرّبها المستخدم فعليًا */
  window.medrakComputeProgress = function(){
    if (!window.MedrakStore) return 0;
    const keys = ['crisisLab','policySim','nationBuilder','mediaLiteracy','careerQuiz'];
    let done = keys.filter(k => !!MedrakStore.get(k)).length;
    if ((MedrakStore.get('studyPlanProgress', {completedCodes:[]}).completedCodes||[]).length > 0) done++;
    if ((MedrakStore.get('semesterTasks', [])||[]).length > 0) done++;
    return Math.round((done / (keys.length + 2)) * 100);
  };

  /* ===== طلاب/طالبات + عربي/إنجليزي + نصوص ثنائية اللغة ===== */
  safe(function initToggles(){
    const genderMale = document.getElementById('genderMale');
    const genderFemale = document.getElementById('genderFemale');
    const langToggleBtn = document.getElementById('langToggle');
    const genderTextEls = document.querySelectorAll('[data-m][data-f]');
    const langOnlyEls = document.querySelectorAll('[data-ar][data-en]:not([data-m])');
    const placeholderEls = document.querySelectorAll('[data-ph-m], [data-ph-ar]');

    function applyAllText(){
      langOnlyEls.forEach(el => { el.textContent = window.medrakState.lang === 'en' ? el.dataset.en : el.dataset.ar; });
      genderTextEls.forEach(el => {
        if (window.medrakState.lang === 'en' && el.dataset.en) { el.textContent = el.dataset.en; }
        else { el.textContent = window.medrakState.isFemale ? el.dataset.f : el.dataset.m; }
      });
      placeholderEls.forEach(el => {
        const d = el.dataset;
        if (window.medrakState.lang === 'en' && d.phEn) { el.placeholder = d.phEn; }
        else if (d.phM && d.phF) { el.placeholder = window.medrakState.isFemale ? d.phF : d.phM; }
        else if (d.phAr) { el.placeholder = d.phAr; }
      });
    }
    window.medrakApplyText = applyAllText;

    function applyGenderVisual(isFemale){
      root.classList.toggle('fem', isFemale);
      html.setAttribute('data-gender', isFemale ? 'female' : 'male');
      if (genderMale && genderFemale) {
        genderMale.classList.toggle('active', !isFemale);
        genderFemale.classList.toggle('active', isFemale);
        genderMale.setAttribute('aria-pressed', String(!isFemale));
        genderFemale.setAttribute('aria-pressed', String(isFemale));
      }
    }
    function setGender(isFemale){
      window.medrakState.isFemale = isFemale;
      LSset('medrak_gender', isFemale);
      applyGenderVisual(isFemale);
      applyAllText();
      if (typeof window.onGenderChange === 'function') window.onGenderChange(isFemale);
    }
    window.medrakSetGender = setGender;
    applyGenderVisual(window.medrakState.isFemale);
    if (genderMale) genderMale.addEventListener('click', function(){ setGender(false); });
    if (genderFemale) genderFemale.addEventListener('click', function(){ setGender(true); });

    function setLanguage(lang){
      window.medrakState.lang = lang;
      LSset('medrak_lang', lang);
      html.setAttribute('lang', lang);
      html.setAttribute('dir', 'rtl'); /* التخطيط يبقى RTL دومًا، النص فقط يتبدّل */
      if (langToggleBtn) langToggleBtn.textContent = lang === 'en' ? 'AR' : 'EN';
      applyAllText();
    }
    window.medrakSetLanguage = setLanguage;
    setLanguage(window.medrakState.lang);
    if (langToggleBtn) langToggleBtn.addEventListener('click', function(){ setLanguage(window.medrakState.lang === 'en' ? 'ar' : 'en'); });
  }, 'initToggles');

  /* ===== الوضع الداكن (محفوظ، ومطبّق قبل أول رسم عبر سكربت head) ===== */
  safe(function initTheme(){
    const darkToggle = document.getElementById('darkToggle');
    function applyTheme(theme){
      window.medrakState.theme = theme;
      LSset('medrak_theme', theme);
      html.setAttribute('data-theme', theme);
      if (darkToggle) darkToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    applyTheme(window.medrakState.theme);
    if (darkToggle) {
      darkToggle.addEventListener('click', function(){
        applyTheme(window.medrakState.theme === 'dark' ? 'light' : 'dark');
      });
    }
  }, 'initTheme');

  /* ===== قائمة الجوال (Hamburger) ===== */
  safe(function initMobileMenu(){
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('#medrak-root nav.links');
    if (!menuToggle || !navLinks) return;
    menuToggle.addEventListener('click', function(){
      const isOpen = navLinks.classList.toggle('open');
      this.setAttribute('aria-expanded', String(isOpen));
      this.textContent = isOpen ? '✕' : '☰';
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', function(){
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = '☰';
      });
    });
  }, 'initMobileMenu');

  /* ===== العودة للأعلى ===== */
  safe(function initBackTop(){
    const backTop = document.getElementById('backTop');
    if (!backTop) return;
    window.addEventListener('scroll', function(){ backTop.classList.toggle('show', window.scrollY > 500); });
    backTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior: reducedMotion ? 'auto' : 'smooth'}); });
  }, 'initBackTop');

  /* ===== شريط تقدّم القراءة ===== */
  safe(function initScrollProgress(){
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    function update(){
      const h = document.documentElement;
      const scrolled = h.scrollTop || document.body.scrollTop;
      const height = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      bar.style.width = (height > 0 ? (scrolled / height) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update);
    update();
  }, 'initScrollProgress');

  /* ===== حقل الجزيئات الزخرفي ===== */
  safe(function initParticleField(){
    const field = document.getElementById('particle-field');
    if (!field || reducedMotion) return;
    const count = window.innerWidth < 700 ? 14 : 26;
    for (let i = 0; i < count; i++) {
      const span = document.createElement('span');
      span.style.top = Math.random() * 100 + '%';
      span.style.left = Math.random() * 100 + '%';
      span.style.animationDuration = (10 + Math.random() * 10) + 's';
      span.style.animationDelay = (Math.random() * 8) + 's';
      field.appendChild(span);
    }
  }, 'initParticleField');

  /* ===== الكشف عند التمرير (Reveal) ===== */
  safe(function initReveal(){
    const sections = document.querySelectorAll('#medrak-root main > section');
    if (!sections.length) return;
    sections.forEach(s => s.classList.add('reveal'));
    if (reducedMotion || !('IntersectionObserver' in window)) {
      sections.forEach(s => s.classList.add('in'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    sections.forEach(s => observer.observe(s));
    /* شبكة أمان: أي قسم ما انكشف خلال 3 ثواني (فشل المراقبة) يظهر تلقائيًا */
    setTimeout(() => sections.forEach(s => s.classList.add('in')), 3000);
  }, 'initReveal');

  /* ===== مساعد الأكورديون العام ===== */
  window.medrakWireAccordion = function(container){
    container.querySelectorAll('.accordion-item').forEach(item => {
      const head = item.querySelector('.accordion-head');
      const body = item.querySelector('.accordion-body');
      if (!head || !body || head.dataset.wired) return;
      head.dataset.wired = '1';
      head.addEventListener('click', function(){
        const isOpen = item.classList.contains('open');
        item.classList.toggle('open', !isOpen);
        body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : '0px';
      });
    });
  };
  safe(function(){ medrakWireAccordion(document); }, 'accordionInit');

  /* ===== تبويبات عامة ===== */
  window.medrakWireTabs = function(container){
    container.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.wired || btn.disabled) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', function(){
        const group = this.closest('.tabs').dataset.group || 'default';
        container.querySelectorAll('.tab-btn').forEach(b => { if ((b.closest('.tabs').dataset.group||'default') === group) b.classList.remove('active'); });
        container.querySelectorAll('.tab-panel').forEach(p => { if ((p.dataset.group||'default') === group) p.classList.remove('active'); });
        this.classList.add('active');
        const panel = container.querySelector('.tab-panel[data-group="'+group+'"][data-panel="'+this.dataset.tab+'"]') ||
                      container.querySelector('.tab-panel[data-panel="'+this.dataset.tab+'"]');
        if (panel) panel.classList.add('active');
      });
    });
  };
  safe(function(){ medrakWireTabs(document); }, 'tabsInit');

  /* ===== إغلاق أي نافذة منبثقة بالضغط خارجها ===== */
  safe(function(){
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', function(e){ if (e.target === this) this.classList.remove('show'); });
    });
  }, 'modalOutsideClick');

  /* ============================================================
     محرك أصوات مولّدة عبر Web Audio API — بدون أي ملفات صوتية خارجية
     ============================================================ */
  safe(function initSound(){
    const muteBtn = document.getElementById('muteToggle');
    let ctx = null;
    function ensureCtx(){ if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) ctx = new AC(); } return ctx; }
    function tone(freq, dur, type, gainPeak, delay){
      const c = ensureCtx(); if (!c) return;
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
      if (window.medrakState.muted) return;
      if (name === 'click') tone(600, 0.08, 'sine', 0.08, 0);
      else if (name === 'success') { tone(660, 0.14, 'sine', 0.12, 0); tone(880, 0.18, 'sine', 0.12, 0.12); }
      else if (name === 'error') tone(220, 0.22, 'sawtooth', 0.10, 0);
      else if (name === 'achievement') { tone(523, 0.12, 'sine', 0.12, 0); tone(659, 0.12, 'sine', 0.12, 0.1); tone(784, 0.22, 'sine', 0.14, 0.2); }
    }
    window.medrakSound = { play };
    function applyMuteIcon(){ if (muteBtn) muteBtn.textContent = window.medrakState.muted ? '🔇' : '🔊'; }
    applyMuteIcon();
    if (muteBtn) {
      muteBtn.addEventListener('click', function(){
        window.medrakState.muted = !window.medrakState.muted;
        LSset('medrak_muted', window.medrakState.muted);
        applyMuteIcon();
        if (!window.medrakState.muted) play('click');
      });
    }
  }, 'initSound');

  /* ============================================================
     زر الإعدادات العام (⚙️) — يظهر بكل صفحات الموقع تلقائيًا،
     ويحتوي على تصدير/استيراد بيانات الطالب لنقلها بين الأجهزة.
     ============================================================ */
  safe(function initSettings(){
    const navActions = document.querySelector('.nav-actions');
    if (!navActions || !window.MedrakStore) return;

    const btn = document.createElement('button');
    btn.className = 'icon-btn';
    btn.id = 'settingsToggle';
    btn.setAttribute('aria-label', 'الإعدادات');
    btn.textContent = '⚙️';
    navActions.appendChild(btn);

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'settingsModal';
    modal.innerHTML =
      '<div class="modal-box" style="max-width:440px;max-height:85vh;overflow-y:auto">' +
        '<h3 style="color:var(--purple);margin:0 0 10px">⚙️ الإعدادات</h3>' +
        '<p style="font-size:13px;color:var(--text-soft);margin:0 0 16px">كل بياناتك (تقدمك بالاختبارات، خطتك الدراسية، مهامك، ملاحظاتك) محفوظة على هذا الجهاز فقط، وما توصل لأي خادم.</p>' +
        '<div style="background:var(--surface-2);border-radius:var(--radius-sm);padding:14px;margin-bottom:16px">' +
          '<h4 style="margin:0 0 8px;font-size:13.5px;color:var(--purple)">📱 كيف أنقل بياناتي لجهاز ثاني؟</h4>' +
          '<ol style="margin:0;padding-inline-start:18px;font-size:12.5px;color:var(--text-soft);line-height:1.9">' +
            '<li>اضغط "تصدير بياناتي" هنا — بينزّل ملف صغير (JSON) على جهازك الحالي.</li>' +
            '<li>انقل الملف للجهاز الثاني بأي طريقة تناسبك (إيميل لنفسك، واتساب، تخزين سحابي، أو USB).</li>' +
            '<li>افتح مِدراك بالجهاز الثاني، اضغط ⚙️ الإعدادات ← "استيراد بيانات" ← اختر نفس الملف.</li>' +
            '<li>خلاص! تقدمك وخطتك ومهامك تظهر بنفس الجهاز الجديد فورًا.</li>' +
          '</ol>' +
        '</div>' +
        '<label style="display:flex;align-items:center;gap:8px;font-size:12.5px;margin-bottom:10px"><input type="checkbox" id="settingsIncludePhoto" style="width:auto"> تضمين صورتي الشخصية بالنسخة (يكبّر حجم الملف)</label>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">' +
          '<button class="btn btn-primary" id="settingsExportBtn">⬇️ تصدير بياناتي</button>' +
          '<button class="btn btn-outline" id="settingsImportBtn">⬆️ استيراد بيانات</button>' +
          '<input type="file" id="settingsImportFile" accept=".json" style="display:none">' +
        '</div>' +
        '<p id="settingsMsg" style="display:none;font-size:12.5px;color:var(--teal-deep);margin:0 0 12px"></p>' +
        '<a href="profile.html" class="source-link">فتح لوحة "ملفي في مِدراك" الكاملة ↗</a>' +
        '<div style="margin-top:16px"><button class="btn btn-outline modal-close" id="settingsCloseBtn">إغلاق</button></div>' +
      '</div>';
    root.appendChild(modal);

    function showMsg(text){ const m = document.getElementById('settingsMsg'); m.textContent = text; m.style.display = 'block'; }

    btn.addEventListener('click', function(){ modal.classList.add('show'); });
    document.getElementById('settingsCloseBtn').addEventListener('click', function(){ modal.classList.remove('show'); });
    modal.addEventListener('click', function(e){ if (e.target === modal) modal.classList.remove('show'); });

    document.getElementById('settingsExportBtn').addEventListener('click', function(){
      const includePhoto = document.getElementById('settingsIncludePhoto').checked;
      MedrakStore.exportJSON(includePhoto, function(){
        showMsg('تم تنزيل ملف بياناتك ✅ — انقله للجهاز الثاني وبعدين استورده من هناك.');
      });
    });
    document.getElementById('settingsImportBtn').addEventListener('click', function(){
      document.getElementById('settingsImportFile').click();
    });
    document.getElementById('settingsImportFile').addEventListener('change', function(e){
      const file = e.target.files[0];
      if (!file) return;
      MedrakStore.importJSON(file, function(){
        showMsg('تم استيراد بياناتك بنجاح ✅ — حدّث الصفحة عشان تشوف كل شي منعكس.');
      }, function(){
        showMsg('⚠️ الملف غير صالح، تأكد إنه نفس الملف اللي صدّرته من مِدراك.');
      });
      this.value = '';
    });
  }, 'initSettings');

  /* ============================================================
     الاحتفال (Confetti) — يُستدعى عند إنجاز حقيقي (إكمال اختبار مثلاً)
     ============================================================ */
  window.medrakConfetti = function(){
    if (reducedMotion) return;
    const colors = ['#4C2E9E', '#0F9B8E', '#F2600A', '#F0B93E', '#F472B6'];
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1500';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx2d = canvas.getContext('2d');
    const pieces = [];
    for (let i = 0; i < 60; i++) {
      pieces.push({
        x: canvas.width/2, y: canvas.height/2,
        vx: (Math.random()-0.5)*10, vy: -Math.random()*10-4,
        size: 5+Math.random()*5, rot: Math.random()*360, vr: (Math.random()-0.5)*10,
        color: colors[Math.floor(Math.random()*colors.length)],
      });
    }
    let frame = 0;
    function step(){
      ctx2d.clearRect(0,0,canvas.width,canvas.height);
      pieces.forEach(p => {
        p.vy += 0.18; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx2d.save(); ctx2d.translate(p.x,p.y); ctx2d.rotate(p.rot*Math.PI/180);
        ctx2d.fillStyle = p.color; ctx2d.fillRect(-p.size/2,-p.size/2,p.size,p.size);
        ctx2d.restore();
      });
      frame++;
      if (frame < 100) requestAnimationFrame(step); else canvas.remove();
    }
    requestAnimationFrame(step);
  };

})();
