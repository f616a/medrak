/* مِدراك | shell.js — واجهة "الحساب": ترحيب أول زيارة، قائمة جانبية، جولة التعريف،
   نافذة «تخصيص صفحتي» (ألوان/وضع/تصميم/لغة/صيغة/نقل التقدم)، بطاقة الحساب بالرئيسية، دائرة الضوء.
   كل البيانات محلية على الجهاز (localStorage + IndexedDB للصورة) — لا خادم ولا حسابات حقيقية. */
(function(){
  "use strict";
  function safe(fn, label){ try { fn(); } catch(err){ console.error('shell.js: "' + label + '" failed:', err); } }

  const root = document.getElementById('medrak-root');
  if (!root || !window.medrakPrefs || !window.MedrakStore) return;
  const html = document.documentElement;
  const prefs = window.medrakPrefs;
  const state = window.medrakState;
  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const ICON_PATHS = {"home": "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z", "landmark": "M3 21h18 M5 21V10 M9.5 21V10 M14.5 21V10 M19 21V10 M12 3 3 8h18z", "calendar": "M7 3v4 M17 3v4 M4 8h16 M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z", "book": "M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2z M12 6.5v13", "file": "M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z M14 3v5h5 M9 13h6 M9 17h6", "compass": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5z", "message": "M21 12a8 8 0 0 1-11.5 7.2L4 20l1.1-4.3A8 8 0 1 1 21 12z", "flask": "M9 3h6 M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3 M7.5 15h9", "globe": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M3 12h18 M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z", "shield": "M12 3 4 6v6c0 4.4 3.4 8.3 8 9 4.6-.7 8-4.6 8-9V6z M9 12l2 2 4-4", "briefcase": "M4 8h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3 M3 13h18", "grad": "M2 9l10-5 10 5-10 5z M6 11.5V16c0 1.2 2.7 3 6 3s6-1.8 6-3v-4.5 M22 9v6", "user": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21a8 8 0 0 1 16 0", "info": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M12 11v5 M12 8h.01", "palette": "M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.5-1.9-.4-1.2.4-2.1 1.6-2.1H17a4 4 0 0 0 4-4c0-5-4-10-9-10z M7.5 11.5h.01 M10 7.5h.01 M14.5 7.5h.01", "help": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7 M12 17h.01", "mail": "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 7l9 6 9-6", "menu": "M4 7h16 M4 12h16 M4 17h16", "close": "M6 6l12 12 M18 6L6 18", "camera": "M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "check": "M5 12.5l4.5 4.5L19 7.5", "spark": "M12 3l1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8z M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z", "lock": "M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z M8 11V8a4 4 0 0 1 8 0v3", "download": "M12 4v11 M7 11l5 5 5-5 M5 20h14", "upload": "M12 16V5 M7 9l5-5 5 5 M5 20h14", "pencil": "M4 20h4L19 9l-4-4L4 16z M13.5 6.5l4 4", "chevron": "M6 9l6 6 6-6"};
  const PALETTES = {"classic": {"ar": "كلاسيكي", "en": "Classic", "desc_ar": "كحلي وذهبي", "desc_en": "Navy & gold", "light": {"bg": "#F7F2E8", "surface": "#FFFDF9", "fill": "#10233F", "teal": "#C9A24B", "soft": "#E4C878", "text": "#10233F"}, "dark": {"bg": "#0D1626", "surface": "#121D30", "fill": "#2D5A9E", "teal": "#C9A24B", "soft": "#ECD89D", "text": "#8FB3F0"}}, "rose": {"ar": "عنابي وردي", "en": "Burgundy rose", "desc_ar": "عنابي مع وردي ذهبي", "desc_en": "Burgundy with rose gold", "light": {"bg": "#FBF0F1", "surface": "#FFFAFA", "fill": "#6B1626", "teal": "#D98BA0", "soft": "#F0B8C8", "text": "#6B1626"}, "dark": {"bg": "#1E0E12", "surface": "#2A1319", "fill": "#B03A5B", "teal": "#D98BA0", "soft": "#F3E6EC", "text": "#F0B8C8"}}, "emerald": {"ar": "زمردي", "en": "Emerald", "desc_ar": "أخضر زمردي مع رملي", "desc_en": "Emerald with sand", "light": {"bg": "#F1F7F3", "surface": "#FAFDFB", "fill": "#0F5C4B", "teal": "#C8A24A", "soft": "#BFE8D6", "text": "#0F5C4B"}, "dark": {"bg": "#0C1A15", "surface": "#10241D", "fill": "#1A755E", "teal": "#C8A24A", "soft": "#DCF3E7", "text": "#7FD9B8"}}, "ocean": {"ar": "أزرق ناعم", "en": "Soft blue", "desc_ar": "أزرق هادئ مع تركواز", "desc_en": "Calm blue with teal", "light": {"bg": "#F1F6FB", "surface": "#FAFCFF", "fill": "#245682", "teal": "#2E9C95", "soft": "#BCD6EE", "text": "#1F4A72"}, "dark": {"bg": "#0B1622", "surface": "#101F30", "fill": "#346AA2", "teal": "#2E9C95", "soft": "#E3EFF3", "text": "#8CC3F0"}}, "lavender": {"ar": "لافندر", "en": "Lavender", "desc_ar": "بنفسجي هادئ مع وردي", "desc_en": "Soft purple with pink", "light": {"bg": "#F6F2FC", "surface": "#FFFFFF", "fill": "#5B3FA0", "teal": "#B8559C", "soft": "#D9CCF5", "text": "#4A3290"}, "dark": {"bg": "#130E22", "surface": "#1A1330", "fill": "#7352CC", "teal": "#B8559C", "soft": "#F3EEF5", "text": "#BBA8F2"}}, "sand": {"ar": "رملي", "en": "Sand", "desc_ar": "برونزي رملي دافئ", "desc_en": "Warm bronze sand", "light": {"bg": "#FBF4E8", "surface": "#FFFCF6", "fill": "#7E5220", "teal": "#B8863B", "soft": "#F1D9B0", "text": "#6E451A"}, "dark": {"bg": "#1A130B", "surface": "#231A10", "fill": "#8E5E24", "teal": "#B8863B", "soft": "#F3EFDD", "text": "#E8C58C"}}};

  /* ---------------- أدوات صغيرة ---------------- */
  const $ = function(sel, ctx){ return (ctx || document).querySelector(sel); };
  const $$ = function(sel, ctx){ return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  const isEn = function(){ return state.lang === 'en'; };
  const isF = function(){ return !!state.isFemale; };
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function icon(name){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + (ICON_PATHS[name] || '') + '"/></svg>'; }
  /** نص يتبع اللغة (وصيغة المخاطبة إن وُجد f) الآن */
  function txt(ar, en, f){ return isEn() ? en : (f && isF() ? f : ar); }
  /** سمات ثنائية اللغة/الصيغة يفهمها محرك النصوص بـ common.js */
  function bi(ar, en, f){
    return f ? ' data-m="' + esc(ar) + '" data-f="' + esc(f) + '" data-en="' + esc(en) + '"'
             : ' data-ar="' + esc(ar) + '" data-en="' + esc(en) + '"';
  }
  function S(ar, en, f, tag, extra){
    tag = tag || 'span';
    return '<' + tag + (extra ? ' ' + extra : '') + bi(ar, en, f) + '>' + esc(txt(ar, en, f)) + '</' + tag + '>';
  }
  /** مجموعة سمات aria-label ثنائية */
  function aria(ar, en, f){ return ' data-aria-ar="' + esc(ar) + '"' + (f ? ' data-aria-f="' + esc(f) + '"' : '') + ' data-aria-en="' + esc(en) + '" aria-label="' + esc(txt(ar, en, f)) + '"'; }
  function applyText(){ if (window.medrakApplyText) window.medrakApplyText(); }

  /* ---------------- الملف الشخصي والصورة ---------------- */
  function getProfile(){ return MedrakStore.get('profile', null) || null; }
  function hasAccount(){ const p = getProfile(); return !!(p && p.nickname); }
  function accountVisible(){ const p = getProfile(); return !!(p && p.nickname && !p.hidden); }
  function setProfile(patch){ MedrakStore.set('profile', Object.assign({}, getProfile() || {}, patch)); }

  let photoURL = null, photoLoaded = false;
  function loadPhotoURL(){
    return MedrakStore.getPhoto().then(function(blob){
      if (photoURL) { try { URL.revokeObjectURL(photoURL); } catch(e){} }
      photoURL = blob ? URL.createObjectURL(blob) : null; photoLoaded = true; return photoURL;
    }).catch(function(){ photoLoaded = true; return null; });
  }
  function resetPhotoCache(){ photoLoaded = false; }
  /** يملأ عنصر .avatar: صورة، إيموجي، أو أول حرف من الاسم */
  function fillAvatar(el, profile, forceGeneric){
    if (!el) return;
    el.innerHTML = '';
    if (forceGeneric || !profile || !profile.nickname || profile.sharedDevice) { el.innerHTML = icon('user'); return; }
    const initial = window.medrakInitial(profile.nickname);
    if (profile.avatarType === 'photo') {
      el.textContent = initial;
      const put = function(url){ if (url) { el.textContent = ''; const img = new Image(); img.alt = ''; img.src = url; el.appendChild(img); } };
      if (photoLoaded) put(photoURL); else loadPhotoURL().then(put);
    } else if (profile.avatarType === 'emoji' && profile.avatarEmoji) {
      el.textContent = profile.avatarEmoji;
    } else {
      el.textContent = initial;
    }
  }
  /** يصغّر الصورة ويقصّها مربعة ويصحّح اتجاهها (محليًا بالمتصفح) */
  function processPhoto(file){
    return new Promise(function(resolve, reject){
      const okTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (okTypes.indexOf(file.type) < 0) return reject('type');
      if (file.size > 5 * 1024 * 1024) return reject('size');
      const viaBitmap = window.createImageBitmap ? createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function(){ return createImageBitmap(file); }) : Promise.reject();
      viaBitmap.catch(function(){
        return new Promise(function(res, rej){ const img = new Image(); img.onload = function(){ res(img); }; img.onerror = rej; img.src = URL.createObjectURL(file); });
      }).then(function(src){
        const size = 256, c = document.createElement('canvas'); c.width = c.height = size;
        const ctx = c.getContext('2d'); const sw = src.width, sh = src.height, s = Math.min(sw, sh);
        ctx.drawImage(src, (sw - s) / 2, (sh - s) / 2, s, s, 0, 0, size, size);
        c.toBlob(function(b){ b ? resolve(b) : reject('blob'); }, 'image/jpeg', 0.85);
      }).catch(function(){ reject('decode'); });
    });
  }
  window.medrakProcessPhoto = processPhoto;

  /* ---------------- إشعار قصير ---------------- */
  let toastEl = null, toastTimer = 0;
  function toast(ar, en, f){
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'mk-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); root.appendChild(toastEl); }
    toastEl.textContent = txt(ar, en, f);
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toastEl.classList.remove('show'); }, 2600);
  }

  /* ---------------- نظام النوافذ (حوارات) ---------------- */
  const openStack = [];
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function focusables(el){ return $$(FOCUSABLE, el).filter(function(n){ return n.offsetParent !== null || getComputedStyle(n).position === 'fixed'; }); }
  function makeDialog(opts){
    const overlay = document.createElement('div');
    overlay.className = 'mk-overlay ' + (opts.overlayCls || '');
    overlay.setAttribute('aria-hidden', 'true');
    const dlg = document.createElement('div');
    dlg.className = 'mk-dialog ' + (opts.cls || '');
    dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true');
    if (opts.label) dlg.setAttribute('aria-labelledby', opts.label);
    dlg.tabIndex = -1;
    overlay.appendChild(dlg); root.appendChild(overlay);
    let lastFocus = null;
    const api = { overlay: overlay, dlg: dlg, isOpen: false, dismissible: opts.dismissible !== false };
    api.open = function(){
      if (api.isOpen) return;
      lastFocus = document.activeElement;
      overlay.classList.add('show'); overlay.setAttribute('aria-hidden', 'false');
      api.isOpen = true; openStack.push(api); document.body.style.overflow = 'hidden';
      setTimeout(function(){
        const target = (opts.initialFocus && $(opts.initialFocus, dlg)) || focusables(dlg)[0] || dlg;
        try { target.focus({ preventScroll: true }); } catch(e){}
      }, 80);
    };
    api.close = function(reason){
      if (!api.isOpen) return;
      overlay.classList.remove('show'); overlay.setAttribute('aria-hidden', 'true');
      api.isOpen = false;
      const i = openStack.indexOf(api); if (i >= 0) openStack.splice(i, 1);
      if (!openStack.length) document.body.style.overflow = '';
      if (lastFocus && lastFocus.focus && document.contains(lastFocus)) { try { lastFocus.focus({ preventScroll: true }); } catch(e){} }
      if (opts.onClose) opts.onClose(reason || 'close');
    };
    api.requestClose = function(reason){ if (opts.onRequestClose) opts.onRequestClose(reason); else api.close(reason); };
    overlay.addEventListener('mousedown', function(e){ if (e.target === overlay && api.dismissible) api.requestClose('backdrop'); });
    return api;
  }
  document.addEventListener('keydown', function(e){
    const top = openStack[openStack.length - 1];
    if (!top) return;
    if (e.key === 'Escape') { if (top.dismissible) { e.preventDefault(); top.requestClose('escape'); } return; }
    if (e.key === 'Tab') {
      const f = focusables(top.dlg); if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || !top.dlg.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (document.activeElement === last || !top.dlg.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
    }
  });

  /** نافذة تأكيد بسيطة تُرجع Promise<boolean>. تستخدمها store.importJSON قبل الدمج مع بيانات موجودة */
  function confirmDialog(titleAr, titleEn, bodyAr, bodyEn, okAr, okEn){
    return new Promise(function(resolve){
      let settled = false;
      const dlg = makeDialog({ id: 'confirm', cls: 'confirm-dialog', label: 'cfTitle', initialFocus: '#cfOk',
        onRequestClose: function(){ if (!settled) { settled = true; resolve(false); } dlg.close('cancel'); }, onClose: function(){ setTimeout(function(){ dlg.overlay.remove(); }, 400); } });
      dlg.dlg.style.setProperty('--dlg-w', '460px');
      dlg.dlg.innerHTML =
        '<div class="mk-head"><h2 id="cfTitle">' + esc(txt(titleAr, titleEn)) + '</h2></div>' +
        '<div class="mk-body"><p class="mk-note" style="font-size:14px">' + esc(txt(bodyAr, bodyEn)) + '</p></div>' +
        '<div class="mk-foot"><button type="button" class="btn btn-primary" id="cfOk">' + esc(txt(okAr, okEn)) + '</button>' +
        '<button type="button" class="btn btn-outline" id="cfNo">' + esc(txt('إلغاء', 'Cancel')) + '</button></div>';
      $('#cfOk', dlg.dlg).addEventListener('click', function(){ settled = true; resolve(true); dlg.close('ok'); });
      $('#cfNo', dlg.dlg).addEventListener('click', function(){ settled = true; resolve(false); dlg.close('no'); });
      dlg.open();
    });
  }
  window.medrakConfirm = function(summary){
    summary = summary || {};
    const names = (summary.universities || []).map(function(id){ const m = window.MedrakUniversity && window.MedrakUniversity.meta(id); return m ? (isEn() ? m.nameEn : m.nameAr) : id; });
    const who = summary.name ? (isEn() ? ' (profile: ' + summary.name + ')' : ' (الملف: ' + summary.name + ')') : '';
    const uniAr = names.length ? ' يحتوي بيانات: ' + names.join('، ') + '.' : '';
    const uniEn = names.length ? ' It contains data for: ' + names.join(', ') + '.' : '';
    return confirmDialog('استيراد نسخة احتياطية؟', 'Import a backup?',
      'يوجد بيانات محفوظة على هذا الجهاز. سيُدمج ملف النسخة الاحتياطية معها دون تكرار' + who + '.' + uniAr + ' عند التعارض في نتائج الأدوات يُعتمد ما في الملف، ولن تتغير جامعتك الحالية تلقائيًا. هل تريد المتابعة؟',
      'This device already has saved data. The backup will be merged with it without duplicates' + who + '.' + uniEn + ' Where tool results conflict the file wins, and your current university will not change automatically. Continue?',
      'متابعة الاستيراد', 'Continue import');
  };

  /* ============================================================
     القائمة الجانبية والشريط العلوي
     ============================================================ */
  function pageName(){ return location.pathname.split('/').pop() || 'index.html'; }
  function updateNavCurrent(){
    const page = pageName(), hash = location.hash || '';
    $$('.sidebar .nav-item, .topnav a').forEach(function(a){
      const p = a.getAttribute('data-page'), h = a.getAttribute('data-hash') || '';
      let cur = false;
      if (p === page) cur = h ? (h === hash) : (page !== 'index.html' || !hash || !$$('.nav-item[data-page="index.html"][data-hash="' + hash + '"]').length);
      if (cur) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function navLabelFor(page){
    const a = $('.sidebar .nav-item[data-page="' + page + '"]:not([data-hash]) .label') || $('.sidebar .nav-item[data-page="' + page + '"] .label');
    return a ? (isEn() ? a.dataset.en : a.dataset.ar) : page;
  }

  safe(function initSidebar(){
    const sidebar = $('#sidebar'), backdrop = $('#sidebarBackdrop'), toggle = $('#navToggle');
    if (!sidebar) return;
    function setOpen(open){
      sidebar.classList.toggle('open', open);
      if (backdrop) backdrop.classList.toggle('show', open);
      document.body.classList.toggle('nav-open', open);
      if (toggle) toggle.setAttribute('aria-expanded', String(open));
      if (open) { const f = $('.nav-item', sidebar); if (f) setTimeout(function(){ f.focus({ preventScroll: true }); }, 80); }
    }
    if (toggle) toggle.addEventListener('click', function(){ setOpen(!sidebar.classList.contains('open')); });
    if (backdrop) backdrop.addEventListener('click', function(){ setOpen(false); });
    const closeBtn = $('#sidebarClose'); if (closeBtn) closeBtn.addEventListener('click', function(){ setOpen(false); if (toggle) toggle.focus(); });
    $$('.nav-item', sidebar).forEach(function(a){ a.addEventListener('click', function(){ setOpen(false); }); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && sidebar.classList.contains('open') && !openStack.length) { setOpen(false); if (toggle) toggle.focus(); } });
    window.addEventListener('resize', function(){ if (window.innerWidth >= 980 && sidebar.classList.contains('open')) setOpen(false); });
    window.addEventListener('hashchange', updateNavCurrent);
    updateNavCurrent();
  }, 'initSidebar');

  function renderTopbarAccount(){
    const chip = $('#acctChip'), av = $('#acctAvatar'), nm = $('#acctName');
    if (!chip || !av || !nm) return;
    const p = getProfile();
    if (accountVisible()) {
      fillAvatar(av, p);
      if (p.sharedDevice) { nm.textContent = txt('حسابي', 'My account'); chip.setAttribute('aria-label', txt('ملفي', 'My profile')); }
      else { nm.textContent = p.nickname; chip.setAttribute('aria-label', txt('ملفي — ', 'My profile — ') + p.nickname); }
      chip.setAttribute('href', 'profile.html'); chip.dataset.mode = 'account';
    } else {
      fillAvatar(av, null, true);
      nm.textContent = txt('دخول', 'Sign in');
      chip.setAttribute('aria-label', txt('تسجيل الدخول', 'Sign in'));
      chip.setAttribute('href', '#'); chip.dataset.mode = 'signin';
    }
  }

  /* ============================================================
     الترحيب الأول (Onboarding)
     ============================================================ */
  let obDialog = null;
  function openOnboarding(){
    if (obDialog && obDialog.isOpen) return;
    if (obDialog) { obDialog.overlay.remove(); obDialog = null; }
    const existing = getProfile();
    const canResume = !!(existing && existing.nickname && existing.hidden);
    let selGender = canResume ? (existing.role === 'student_f' ? 'f' : 'm') : null;
    let photoBlob = null, photoPreviewURL = null;

    obDialog = makeDialog({ id: 'onboarding', cls: 'ob-card', overlayCls: 'ob-overlay', label: 'obTitle', dismissible: canResume || hasAccount(), initialFocus: '#obName',
      onRequestClose: function(){ obDialog.close('dismiss'); } });
    const d = obDialog.dlg;
    d.innerHTML =
      '<div class="ob-top"><button type="button" class="tb-btn" id="obLang"' + bi('English', 'العربية') + aria('Switch to English', 'التبديل إلى العربية') + '>' + esc(txt('English', 'العربية')) + '</button></div>' +
      '<form class="ob-inner" id="obForm" novalidate>' +
        '<div class="ob-brand"><span class="brand-mark" aria-hidden="true">م</span><span>مِدراك</span></div>' +
        S('أهلًا بك في مِدراك 👋', 'Welcome to Medrak 👋', null, 'h1', 'id="obTitle"') +
        S('قبل ما نبدأ، عرّفنا على نفسك. ملفك وتقدمك يبقيان على جهازك فقط — بدون حسابات، ولا نرسل بياناتك الشخصية لأي خادم.', 'Before we begin, tell us a little about you. Your profile and progress stay on your device — no accounts, and we never send your personal data to any server.', null, 'p', 'class="ob-sub"') +
        (canResume ? '<div class="ob-resume"><span class="avatar" id="obResumeAv"></span><span class="grow">' + esc(existing.nickname) + '</span><button type="button" class="btn btn-primary" id="obResume" style="padding:9px 16px;font-size:13px"' + '>' + S('متابعة', 'Continue') + '</button></div>' : '') +
        '<div class="ob-avatar-row">' +
          '<div class="avatar" id="obAvatar"></div>' +
          '<div class="ob-avatar-actions">' +
            '<button type="button" class="btn btn-outline" id="obPhotoBtn" style="padding:9px 16px;font-size:13px">' + icon('camera').replace('<svg', '<svg width="18" height="18"') + S('إضافة صورة (اختياري)', 'Add a photo (optional)') + '</button>' +
            '<button type="button" class="link-btn" id="obPhotoRemove" hidden>' + S('إزالة الصورة', 'Remove photo') + '</button>' +
            '<input type="file" id="obPhotoInput" accept="image/jpeg,image/png,image/webp" hidden>' +
            S('لو تركتها فاضية نستخدم أول حرف من اسمك.', 'If you skip it, we use the first letter of your name.', null, 'p', 'class="ob-hint" style="margin:0"') +
          '</div>' +
        '</div>' +
        '<div class="ob-field"><label for="obName">' + S('اسمك الأول', 'Your first name') + '</label>' +
          '<input type="text" id="obName" maxlength="20" autocomplete="off" autocapitalize="words" spellcheck="false" data-ph-ar="مثلًا: فارس" data-ph-en="e.g. Alex" placeholder="' + esc(txt('مثلًا: فارس', 'e.g. Alex')) + '"></div>' +
        '<div class="ob-field"><label id="obGenderLbl">' + S('الجنس', 'Gender') + '</label>' +
          '<div class="gender-choice" role="group" aria-labelledby="obGenderLbl">' +
            '<button type="button" data-g="m" aria-pressed="false"><span class="gc-ic" aria-hidden="true">👨‍🎓</span>' + S('ذكر', 'Male') + '</button>' +
            '<button type="button" data-g="f" aria-pressed="false"><span class="gc-ic" aria-hidden="true">👩‍🎓</span>' + S('أنثى', 'Female') + '</button>' +
          '</div>' +
          S('نستخدمه لنخاطبك بالصيغة المناسبة (مذكر أو مؤنث) في كل صفحات الموقع.', 'We use it to address you in the right form throughout the site.', null, 'p', 'class="ob-hint"') +
        '</div>' +
        '<p class="ob-error" id="obError" role="alert" aria-live="assertive"></p>' +
        '<button type="submit" class="btn btn-primary ob-cta" id="obSubmit">' + S('ابدأ رحلتي', 'Start my journey') + '</button>' +
        '<div class="ob-links"><button type="button" class="link-btn" id="obImport">' + S('عندي نسخة احتياطية — استيراد تقدمي', 'I have a backup — import my progress') + '</button><input type="file" id="obImportFile" accept=".json,application/json" hidden></div>' +
        (obDialog.dismissible ? '<div class="ob-links"><button type="button" class="link-btn" id="obClose">' + S('إغلاق', 'Close') + '</button></div>' : '') +
      '</form>';

    const nameInput = $('#obName', d), avatarEl = $('#obAvatar', d), errEl = $('#obError', d);
    function showError(ar, en){
      if (!ar) { errEl.textContent = ''; errEl.removeAttribute('data-ar'); errEl.removeAttribute('data-en'); return; }
      errEl.setAttribute('data-ar', ar); errEl.setAttribute('data-en', en); errEl.textContent = txt(ar, en);
    }
    function paintAvatar(){
      avatarEl.innerHTML = '';
      if (photoPreviewURL) { const img = new Image(); img.alt = ''; img.src = photoPreviewURL; avatarEl.appendChild(img); }
      else { const n = nameInput.value.trim(); avatarEl.textContent = n ? window.medrakInitial(n) : '?'; }
    }
    function paintGender(){
      $$('.gender-choice button', d).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.g === selGender)); });
    }
    if (canResume) fillAvatar($('#obResumeAv', d), existing);
    paintAvatar(); paintGender();
    nameInput.addEventListener('input', function(){ paintAvatar(); if (errEl.textContent) showError(); });

    $$('.gender-choice button', d).forEach(function(b){
      b.addEventListener('click', function(){
        selGender = b.dataset.g; paintGender(); showError();
        prefs.apply({ isFemale: selGender === 'f' }, false);  /* معاينة فورية للصيغة */
      });
    });
    $('#obLang', d).addEventListener('click', function(){
      prefs.apply({ lang: isEn() ? 'ar' : 'en' }, true);
      paintAvatar();
    });

    /* الصورة (اختيارية) */
    const photoInput = $('#obPhotoInput', d), photoRemove = $('#obPhotoRemove', d);
    $('#obPhotoBtn', d).addEventListener('click', function(){ photoInput.click(); });
    photoInput.addEventListener('change', function(){
      const file = photoInput.files && photoInput.files[0]; if (!file) return;
      processPhoto(file).then(function(blob){
        photoBlob = blob; if (photoPreviewURL) URL.revokeObjectURL(photoPreviewURL);
        photoPreviewURL = URL.createObjectURL(blob); photoRemove.hidden = false; paintAvatar(); showError();
      }).catch(function(reason){
        if (reason === 'size') showError('حجم الصورة كبير (الحد الأقصى 5 ميجا).', 'The photo is too large (max 5 MB).');
        else if (reason === 'type') showError('الصيغ المسموحة: JPG أو PNG أو WEBP.', 'Allowed formats: JPG, PNG or WEBP.');
        else showError('ما قدرنا نقرأ هذي الصورة، جرّب صورة ثانية.', 'We could not read this photo. Please try another one.');
      });
      photoInput.value = '';
    });
    photoRemove.addEventListener('click', function(){
      photoBlob = null; if (photoPreviewURL) { URL.revokeObjectURL(photoPreviewURL); photoPreviewURL = null; }
      photoRemove.hidden = true; paintAvatar();
    });

    /* متابعة بحساب مخفي سابقًا (بعد تسجيل خروج محلي) */
    const resumeBtn = $('#obResume', d);
    if (resumeBtn) resumeBtn.addEventListener('click', function(){
      setProfile({ hidden: false });
      prefs.apply({ isFemale: existing.role === 'student_f' }, true);
      obDialog.close('resume'); renderAll(); toast('أهلًا بعودتك ' + existing.nickname + ' 👋', 'Welcome back ' + existing.nickname + ' 👋');
    });

    /* استيراد نسخة احتياطية */
    const impFile = $('#obImportFile', d);
    $('#obImport', d).addEventListener('click', function(){ impFile.click(); });
    impFile.addEventListener('change', function(){
      const f = impFile.files && impFile.files[0]; if (!f) return;
      MedrakStore.importJSON(f, function(){
        if (MedrakStore.hasAccount()) {
          const p = getProfile(); if (p.hidden) setProfile({ hidden: false });
          resetPhotoCache(); obDialog.close('imported'); renderAll();
          toast('تم استيراد تقدمك بنجاح ✓', 'Your progress was imported ✓');
        } else showError('الملف سليم لكنه ما يحتوي على ملف شخصي.', 'The file is valid but contains no profile.');
      }, function(){ showError('الملف غير صالح — تأكد إنه نسخة صدّرتها من مِدراك.', 'Invalid file — make sure it is a backup exported from Medrak.'); });
      impFile.value = '';
    });
    const closeBtn = $('#obClose', d); if (closeBtn) closeBtn.addEventListener('click', function(){ obDialog.close('dismiss'); });

    /* الإرسال */
    $('#obForm', d).addEventListener('submit', function(e){
      e.preventDefault();
      const name = window.medrakSanitizeName(nameInput.value).slice(0, 20);
      if (!/\p{L}/u.test(name)) { showError('الاسم الأول مطلوب (حروف).', 'Please enter your first name (letters).'); nameInput.focus(); return; }
      if (!selGender) { showError('اختيار الجنس مطلوب.', 'Please choose an option for gender.'); const gb = $('.gender-choice button', d); if (gb) gb.focus(); return; }
      const finish = function(usePhoto){
        const prev = getProfile() || {};
        MedrakStore.set('profile', Object.assign({}, prev, {
          nickname: name, role: selGender === 'f' ? 'student_f' : 'student_m',
          avatarType: usePhoto ? 'photo' : 'initial', hidden: false, sharedDevice: false,
          createdAt: prev.createdAt || new Date().toISOString(),
        }));
        prefs.apply({ isFemale: selGender === 'f' }, true);
        resetPhotoCache(); renderAll();
        window.medrakLogActivity();
        const endOnboarding = function(){
          obDialog.close('done'); renderAll();
          if (!localStorage.getItem('medrak_tour_seen')) setTimeout(openTour, 450);
        };
        /* الخطوة الثانية: اختيار الجامعة (إن لم يخترها بعد) */
        if (state.university === null && typeof window.medrakUniStep === 'function') {
          obDialog.dlg.innerHTML = '<div class="ob-uni-wrap"></div>';
          window.medrakUniStep($('.ob-uni-wrap', obDialog.dlg), endOnboarding);
          const first = $('.uni-card', obDialog.dlg); if (first) try { first.focus({ preventScroll: true }); } catch(e){}
        } else endOnboarding();
      };
      if (photoBlob) MedrakStore.savePhoto(photoBlob).then(function(ok){ finish(!!ok); });
      else { MedrakStore.deletePhoto(); finish(false); }
    });

    applyText();
    obDialog.open();
  }

  /* ============================================================
     جولة التعريف (علامة الـ i)
     ============================================================ */
  let tourDialog = null;
  const TOUR = [
    { ic: 'spark', t: ['أهلًا {name} 👋', 'Welcome {name} 👋'], b: ['هذي جولة سريعة (أقل من دقيقة) تعرّفك على كل شيء في مِدراك. اضغط «التالي» للمتابعة أو «تخطّي» في أي وقت.', 'This quick tour (under a minute) shows you everything in Medrak. Press Next to continue or Skip at any time.', 'هذي جولة سريعة (أقل من دقيقة) تعرّفك على كل شيء في مِدراك. اضغطي «التالي» للمتابعة أو «تخطّي» في أي وقت.'] },
    { ic: 'menu', t: ['القائمة الجانبية', 'The side menu'], b: ['كل أقسام الموقع في قائمة واحدة على الجانب، وتنتقل بينها بضغطة. على الجوال تفتحها من زر ☰ بأعلى الصفحة.', 'Every section lives in one side menu, one tap away. On mobile, open it from the ☰ button at the top.'] },
    { ic: 'book', t: ['التعليم', 'Learning'], b: ['قاموس بأكثر من 400 مصطلح سياسي مع تسجيل صوتي، اختبار مصطلحات بنقاط وتحدٍّ للأصدقاء، تدريب على المقال، ومصادر لتحسين الإنجليزي.', 'A glossary of 400+ political terms with audio, a scored terms quiz you can challenge friends with, essay practice, and English-learning resources.'] },
    { ic: 'calendar', t: ['الخطة الدراسية', 'Study plan'], b: ['خريطة مقررات تفاعلية تحسب لك الوحدات المنجزة وتنبّهك للمتطلبات السابقة، مع مخطط فصل دراسي ومؤقت مذاكرة.', 'An interactive course map that counts completed units and warns about prerequisites, plus a semester planner and a study timer.'] },
    { ic: 'compass', t: ['القرار والتواصل والتفاوض', 'Decision, communication & negotiation'], b: ['سيناريوهات خيالية بالكامل: غرفة أزمات، محاكي سياسات، «ابنِ دولتك»، مؤتمر صحفي، مفاوضات، بيان رسمي، ولغة الدبلوماسيين.', 'Entirely fictional scenarios: a crisis room, policy simulator, “Build your nation”, press conference, negotiations, official statements and diplomatic language.'] },
    { ic: 'flask', t: ['البحث والوعي المعلوماتي', 'Research & media literacy'], b: ['خطة بحث خطوة بخطوة، استطلاعات محايدة، تحليل وثائق وخطابات، وتدريب على كشف المحتوى المضلل.', 'Step-by-step research plans, neutral surveys, document and speech analysis, and training to spot misleading content.'] },
    { ic: 'globe', t: ['العالم والمؤسسات', 'World & institutions'], b: ['أطلس لـ20 دولة و10 منظمات دولية بمعلومات وصفية محايدة ومصادرها الرسمية.', 'An atlas of 20 countries and 10 international organizations with neutral descriptive facts and official sources.'] },
    { ic: 'briefcase', t: ['مستقبلك المهني', 'Your career'], b: ['10 مسارات مهنية، اختبار ميول، مقابلة وظيفية تجريبية، ومنشئ سيرة ذاتية متوافق مع أنظمة ATS.', '10 career paths, an interest quiz, a mock job interview, and an ATS-friendly resume builder.'] },
    { ic: 'grad', t: ['المقالات والخريجون', 'Articles & alumni'], b: ['مقالات أعضاء هيئة التدريس، وتجارب الخريجين بعد التخرج — وتقدر تشارك تجربتك أنت كمان.', 'Faculty articles and graduates’ real post-graduation stories — and you can share yours too.', 'مقالات أعضاء هيئة التدريس، وتجارب الخريجين بعد التخرج — وتقدرين تشاركين تجربتك أنتِ كمان.'] },
    { ic: 'palette', t: ['تخصيص صفحتي', 'Customize my page'], b: ['من زر «تخصيص صفحتي» تختار الألوان والوضع الداكن وتصميم الصفحة واللغة وصيغة المخاطبة ودائرة الضوء، وتنقل تقدمك إلى جهاز ثاني.', 'From “Customize my page” choose colors, dark mode, page layout, language, address form and the cursor spotlight — and move your progress to another device.', 'من زر «تخصيص صفحتي» تختارين الألوان والوضع الداكن وتصميم الصفحة واللغة وصيغة المخاطبة ودائرة الضوء، وتنقلين تقدمك إلى جهاز ثاني.'] },
    { ic: 'lock', t: ['خصوصيتك', 'Your privacy'], b: ['ملفك وصورتك وتقدمك محفوظة على جهازك فقط — لا حسابات، ولا نرسل بياناتك الشخصية لأي خادم. احتفظ بنسخة احتياطية من «تخصيص صفحتي» لو غيّرت جهازك.', 'Your profile, photo and progress live on your device only — no accounts, and we never send your personal data to any server. Keep a backup from “Customize my page” if you change devices.', 'ملفك وصورتك وتقدمك محفوظة على جهازك فقط — لا حسابات، ولا نرسل بياناتك الشخصية لأي خادم. احتفظي بنسخة احتياطية من «تخصيص صفحتي» لو غيّرتِ جهازك.'] },
  ];
  function openTour(startAt){
    if (!tourDialog) {
      tourDialog = makeDialog({ id: 'tour', cls: 'tour-dialog', label: 'tourTitle', initialFocus: '#tourNext', onClose: function(){ try { localStorage.setItem('medrak_tour_seen', '1'); } catch(e){} } });
      tourDialog.dlg.innerHTML =
        '<div class="mk-head"><h2' + bi('جولة التعريف', 'Quick tour') + ' id="tourHead">' + esc(txt('جولة التعريف', 'Quick tour')) + '</h2><button type="button" class="mk-x" id="tourX"' + aria('إغلاق', 'Close') + '>' + icon('close') + '</button></div>' +
        '<div class="tour-body" id="tourBody" aria-live="polite"></div>' +
        '<div class="mk-foot tour-foot"><button type="button" class="link-btn" id="tourSkip">' + S('تخطّي', 'Skip') + '</button><span class="grow"></span>' +
          '<button type="button" class="btn btn-outline" id="tourPrev">' + S('السابق', 'Back') + '</button>' +
          '<button type="button" class="btn btn-primary" id="tourNext">' + S('التالي', 'Next') + '</button></div>';
      $('#tourX', tourDialog.dlg).addEventListener('click', function(){ tourDialog.close('x'); });
      $('#tourSkip', tourDialog.dlg).addEventListener('click', function(){ tourDialog.close('skip'); });
      $('#tourPrev', tourDialog.dlg).addEventListener('click', function(){ tourGo(tourIndex - 1); });
      $('#tourNext', tourDialog.dlg).addEventListener('click', function(){ if (tourIndex >= TOUR.length - 1) tourDialog.close('done'); else tourGo(tourIndex + 1); });
    }
    tourGo(typeof startAt === 'number' ? startAt : 0);
    tourDialog.open();
  }
  let tourIndex = 0;
  function tourGo(i){
    tourIndex = Math.max(0, Math.min(TOUR.length - 1, i));
    const s = TOUR[tourIndex], p = getProfile();
    const nm = (p && p.nickname && !p.sharedDevice) ? p.nickname : '';
    function nameFix(str){ return str.replace(/\s*\{name\}/g, nm ? ' ' + nm : '').replace('{name}', nm); }
    const ar = nameFix(s.t[0]), en = nameFix(s.t[1]);
    const body = $('#tourBody', tourDialog.dlg);
    let dots = ''; for (let k = 0; k < TOUR.length; k++) dots += '<i class="' + (k === tourIndex ? 'on' : '') + '"></i>';
    body.innerHTML =
      '<div class="tour-ic">' + icon(s.ic) + '</div>' +
      '<h3 id="tourTitle"' + bi(ar, en) + '>' + esc(txt(ar, en)) + '</h3>' +
      '<p' + bi(s.b[0], s.b[1], s.b[2]) + '>' + esc(txt(s.b[0], s.b[1], s.b[2])) + '</p>' +
      '<div class="tour-dots" aria-hidden="true">' + dots + '</div>';
    $('#tourPrev', tourDialog.dlg).style.visibility = tourIndex === 0 ? 'hidden' : 'visible';
    const next = $('#tourNext', tourDialog.dlg), last = tourIndex === TOUR.length - 1;
    next.innerHTML = last ? S('ابدأ الآن', 'Get started', 'ابدئي الآن') : S('التالي', 'Next');
    $('#tourSkip', tourDialog.dlg).style.visibility = last ? 'hidden' : 'visible';
    applyText();
  }

  /* ============================================================
     نافذة «تخصيص صفحتي»
     ============================================================ */
  let cuDialog = null, cuSnapshot = null;
  const LAYOUTS = [
    { id: 'wide', ar: 'بطاقات واسعة', en: 'Wide cards', dar: 'عمود واحد ومساحات مريحة، والتنقل من الشريط العلوي.', den: 'One comfortable column with top navigation.', prev: '<i class="t hl"></i><i class="c1"></i><i class="c2"></i>', cls: 'lay-wide' },
    { id: 'compact', ar: 'داشبورد مدمج', en: 'Compact dashboard', dar: 'قائمة جانبية مصغّرة وبطاقات أكثر على الشاشة.', den: 'A slim icon sidebar and denser cards.', prev: '<i class="s hl"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>', cls: 'lay-compact' },
    { id: 'sidebar', ar: 'قائمة جانبية', en: 'Side menu', dar: 'تنقّل من قائمة جانبية ثابتة تضم كل الأقسام.', den: 'A fixed side menu that holds every section.', prev: '<i class="s hl"></i><i class="c1"></i><i class="c2"></i>', cls: 'lay-sidebar' },
    { id: 'sequential', ar: 'أقسام متتابعة', en: 'Sequential sections', dar: 'أقسام بعرض الصفحة بعناوين بارزة ومسافات أوسع.', den: 'Full-width sections with bold headings and more space.', prev: '<i class="t hl"></i><i class="c1"></i><i class="c2"></i><i class="c3"></i>', cls: 'lay-seq' },
  ];
  function paletteCardHTML(id){
    const P = PALETTES[id];
    return '<span class="pal-prev" data-pid="' + id + '"><span class="pp-bar"></span><span class="pp-card"><i></i><i></i><b></b></span><span class="pp-dot"></span></span>' +
           '<span class="pal-name"' + bi(P.ar, P.en) + '>' + esc(txt(P.ar, P.en)) + '</span>' +
           '<span class="pal-desc"' + bi(P.desc_ar, P.desc_en) + '>' + esc(txt(P.desc_ar, P.desc_en)) + '</span>';
  }
  function paintPalettes(){
    const mode = state.theme === 'dark' ? 'dark' : 'light';
    $$('.pal-card', cuDialog.dlg).forEach(function(card){
      const id = card.dataset.pid, c = PALETTES[id][mode], pv = $('.pal-prev', card);
      pv.style.background = c.bg;
      $('.pp-bar', pv).style.background = c.soft;
      $('.pp-card', pv).style.background = c.surface;
      const ii = $$('.pp-card i', pv); ii[0].style.background = c.soft; ii[1].style.background = c.teal;
      $('.pp-card b', pv).style.background = c.fill;
      $('.pp-dot', pv).style.background = c.fill;
    });
  }
  function syncCustomize(){
    if (!cuDialog) return;
    const d = cuDialog.dlg, pal = prefs.resolvedPalette();
    $$('.pal-card', d).forEach(function(c){ c.setAttribute('aria-pressed', String(c.dataset.pid === pal)); });
    $$('.lay-card', d).forEach(function(c){ c.setAttribute('aria-pressed', String(c.dataset.lid === state.layout)); });
    $$('#segTheme button', d).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === state.theme)); });
    $$('#segLang button', d).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === state.lang)); });
    $$('#segGender button', d).forEach(function(b){ b.setAttribute('aria-pressed', String((b.dataset.v === 'f') === state.isFemale)); });
    $$('#segUni button', d).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.v === (state.university || 'none'))); });
    $('#cuSpot', d).checked = !!state.spotlight;
    $('#cuSound', d).checked = !state.muted;
    paintPalettes();
  }
  function cuCancel(){ prefs.revert(); cuDialog.close('cancel'); }
  function cuMsg(ar, en){
    const m = $('#cuMsg', cuDialog.dlg);
    if (!ar) { m.textContent = ''; m.removeAttribute('data-ar'); m.removeAttribute('data-en'); return; }
    m.setAttribute('data-ar', ar); m.setAttribute('data-en', en); m.textContent = txt(ar, en);
  }
  function buildCustomize(){
    cuDialog = makeDialog({ id: 'customize', cls: 'custom-dialog', label: 'cuTitle', initialFocus: '.pal-card[aria-pressed="true"]', onRequestClose: cuCancel });
    cuDialog.dlg.style.setProperty('--dlg-w', '780px');
    const d = cuDialog.dlg;
    const palCards = prefs.paletteIds.map(function(id){ return '<button type="button" class="pal-card" data-pid="' + id + '" aria-pressed="false">' + paletteCardHTML(id) + '</button>'; }).join('');
    const layCards = LAYOUTS.map(function(L){
      return '<button type="button" class="lay-card" data-lid="' + L.id + '" aria-pressed="false"><span class="lay-prev ' + L.cls + '">' + L.prev + '</span>' +
        '<span class="pal-name"' + bi(L.ar, L.en) + '>' + esc(txt(L.ar, L.en)) + '</span><span class="pal-desc"' + bi(L.dar, L.den) + '>' + esc(txt(L.dar, L.den)) + '</span></button>';
    }).join('');
    d.innerHTML =
      '<div class="mk-head"><h2 id="cuTitle"' + bi('تخصيص صفحتي', 'Customize my page') + '>' + esc(txt('تخصيص صفحتي', 'Customize my page')) + '</h2><button type="button" class="mk-x" id="cuX"' + aria('إغلاق (إلغاء المعاينة)', 'Close (cancel preview)') + '>' + icon('close') + '</button></div>' +
      '<div class="mk-body">' +
        S('التغييرات تظهر فورًا كمعاينة — اضغط «اعتماد التخصيص» لحفظها.', 'Changes appear instantly as a preview — press “Apply” to save them.', 'التغييرات تظهر فورًا كمعاينة — اضغطي «اعتماد التخصيص» لحفظها.', 'p', 'class="mk-note"') +
        '<div class="mk-sec"><h3>' + S('الألوان', 'Colors') + '</h3><div class="pal-grid" id="palGrid">' + palCards + '</div></div>' +
        '<div class="mk-sec"><div class="mk-row"><h3 style="margin:0">' + S('الوضع', 'Mode') + '</h3>' +
          '<div class="seg" id="segTheme" role="group"' + aria('الوضع', 'Mode') + '><button type="button" data-v="light" aria-pressed="false">' + S('فاتح', 'Light') + '</button><button type="button" data-v="dark" aria-pressed="false">' + S('داكن', 'Dark') + '</button></div></div>' +
          '<label class="mk-check" style="margin-top:16px"><input type="checkbox" id="cuSpot">' + S('دائرة ضوء تتبع المؤشر (على الكمبيوتر)', 'Cursor-following spotlight (desktop only)') + '</label>' +
          '<label class="mk-check" style="margin-top:12px"><input type="checkbox" id="cuSound">' + S('تفعيل الأصوات التفاعلية', 'Enable interactive sounds') + '</label></div>' +
        '<div class="mk-sec"><h3>' + S('تصميم الصفحة', 'Page layout') + '</h3><div class="lay-grid" id="layGrid">' + layCards + '</div></div>' +
        '<div class="mk-sec"><h3>' + S('اللغة والصيغة', 'Language & address form') + '</h3>' +
          '<div class="mk-row"><span>' + S('اللغة', 'Language') + '</span><div class="seg" id="segLang" role="group"' + aria('اللغة', 'Language') + '><button type="button" data-v="ar" aria-pressed="false">العربية</button><button type="button" data-v="en" aria-pressed="false">English</button></div></div>' +
          '<div class="mk-row" style="margin-top:12px"><span>' + S('صيغة المخاطبة', 'Address form') + '</span><div class="seg" id="segGender" role="group"' + aria('صيغة المخاطبة', 'Address form') + '><button type="button" data-v="m" aria-pressed="false">' + S('مذكر', 'Masculine') + '</button><button type="button" data-v="f" aria-pressed="false">' + S('مؤنث', 'Feminine') + '</button></div></div></div>' +
        '<div class="mk-sec"><h3>' + S('الجامعة', 'University') + '</h3>' +
          '<div class="mk-row"><span>' + S('الجامعة المعروضة', 'Displayed university') + '</span><div class="seg seg-wrap" id="segUni" role="group"' + aria('الجامعة المعروضة', 'Displayed university') + '>' +
            '<button type="button" data-v="kau" aria-pressed="false">' + S('جامعة الملك عبدالعزيز', 'King Abdulaziz Univ.') + '</button>' +
            '<button type="button" data-v="ksu" aria-pressed="false">' + S('جامعة الملك سعود', 'King Saud Univ.') + '</button>' +
            '<button type="button" data-v="none" aria-pressed="false">' + S('بدون جامعة', 'No university') + '</button></div></div>' +
          S('تغيير الجامعة يبدّل الخطة والمقررات والمعلومات الأكاديمية المعروضة، وبيانات كل جامعة تبقى محفوظة ومستقلة.', 'Changing the university switches the displayed plan, courses and academic info; each university’s saved data stays separate.', null, 'p', 'class="mk-note" style="margin:10px 0 0"') + '</div>' +
        '<div class="mk-sec"><h3>' + S('نقل تقدمك بين الأجهزة', 'Move your progress between devices') + '</h3>' +
          S('كل بياناتك محفوظة على هذا الجهاز فقط. لنقلها إلى جهاز ثاني:', 'All your data lives on this device only. To move it to another device:', null, 'p', 'class="mk-note" style="margin-bottom:8px"') +
          '<ol class="mk-steps">' +
            '<li>' + S('اضغط «تصدير تقدمي» — ينزل ملف صغير (JSON) على جهازك الحالي.', 'Press “Export my progress” — a small JSON file downloads to this device.', 'اضغطي «تصدير تقدمي» — ينزل ملف صغير (JSON) على جهازك الحالي.') + '</li>' +
            '<li>' + S('انقل الملف إلى الجهاز الثاني بأي طريقة (إيميل لنفسك، واتساب، تخزين سحابي، أو USB).', 'Move the file to the other device any way you like (email yourself, WhatsApp, cloud storage or USB).', 'انقلي الملف إلى الجهاز الثاني بأي طريقة (إيميل لنفسك، واتساب، تخزين سحابي، أو USB).') + '</li>' +
            '<li>' + S('افتح مِدراك على الجهاز الثاني ← «تخصيص صفحتي» ← «استيراد تقدمي» ← اختر نفس الملف.', 'Open Medrak on the other device → “Customize my page” → “Import my progress” → choose the same file.', 'افتحي مِدراك على الجهاز الثاني ← «تخصيص صفحتي» ← «استيراد تقدمي» ← اختاري نفس الملف.') + '</li>' +
            '<li>' + S('يظهر ملفك وتقدمك وتفضيلاتك فورًا على الجهاز الجديد.', 'Your profile, progress and preferences appear instantly on the new device.') + '</li>' +
          '</ol>' +
          '<label class="mk-check" style="margin:8px 0 12px"><input type="checkbox" id="cuPhoto">' + S('تضمين صورتي الشخصية بالنسخة (يكبّر حجم الملف)', 'Include my profile photo in the backup (larger file)') + '</label>' +
          '<div class="mk-row" style="justify-content:flex-start"><button type="button" class="btn btn-primary" id="cuExport">' + icon('download').replace('<svg', '<svg width="18" height="18"') + S('تصدير تقدمي', 'Export my progress') + '</button>' +
            '<button type="button" class="btn btn-outline" id="cuImport">' + icon('upload').replace('<svg', '<svg width="18" height="18"') + S('استيراد تقدمي', 'Import my progress') + '</button>' +
            '<input type="file" id="cuImportFile" accept=".json,application/json" hidden></div>' +
          '<p class="mk-note" id="cuMsg" role="status" aria-live="polite" style="margin:10px 0 0;font-weight:700"></p>' +
        '</div>' +
      '</div>' +
      '<div class="mk-foot"><button type="button" class="btn btn-primary" id="cuApply">' + icon('check').replace('<svg', '<svg width="18" height="18"') + S('اعتماد التخصيص', 'Apply') + '</button>' +
        '<button type="button" class="btn btn-outline" id="cuCancel">' + icon('close').replace('<svg', '<svg width="18" height="18"') + S('إلغاء المعاينة', 'Cancel preview') + '</button>' +
        '<span class="grow"></span><button type="button" class="link-btn" id="cuReset">' + S('الإعدادات الافتراضية', 'Reset to defaults') + '</button></div>';

    $$('.pal-card', d).forEach(function(c){ c.addEventListener('click', function(){ prefs.apply({ palette: c.dataset.pid }, false); }); });
    $$('.lay-card', d).forEach(function(c){ c.addEventListener('click', function(){ prefs.apply({ layout: c.dataset.lid }, false); }); });
    $$('#segTheme button', d).forEach(function(b){ b.addEventListener('click', function(){ prefs.apply({ theme: b.dataset.v }, false); }); });
    $$('#segLang button', d).forEach(function(b){ b.addEventListener('click', function(){ prefs.apply({ lang: b.dataset.v }, false); }); });
    $$('#segGender button', d).forEach(function(b){ b.addEventListener('click', function(){ prefs.apply({ isFemale: b.dataset.v === 'f' }, false); }); });
    $$('#segUni button', d).forEach(function(b){ b.addEventListener('click', function(){ prefs.apply({ university: b.dataset.v }, false); }); });
    $('#cuSpot', d).addEventListener('change', function(e){ prefs.apply({ spotlight: e.target.checked }, false); });
    $('#cuSound', d).addEventListener('change', function(e){ prefs.apply({ muted: !e.target.checked }, false); if (e.target.checked && window.medrakSound) window.medrakSound.play('click'); });
    $('#cuX', d).addEventListener('click', cuCancel);
    $('#cuCancel', d).addEventListener('click', cuCancel);
    $('#cuReset', d).addEventListener('click', function(){ prefs.apply({ palette: null, theme: 'light', layout: 'sidebar', spotlight: true, muted: true }, false); });
    $('#cuApply', d).addEventListener('click', function(){
      prefs.commit();
      if (hasAccount()) setProfile({ role: state.isFemale ? 'student_f' : 'student_m' });
      cuDialog.close('apply'); renderAll();
      toast('تم حفظ التخصيص ✓', 'Your customization was saved ✓');
    });

    $('#cuExport', d).addEventListener('click', function(){
      MedrakStore.exportJSON($('#cuPhoto', d).checked, function(){ cuMsg('تم تنزيل ملف تقدمك ✓ — انقله للجهاز الثاني ثم استورده من هناك.', 'Your progress file was downloaded ✓ — move it to the other device and import it there.'); });
    });
    const imp = $('#cuImportFile', d);
    $('#cuImport', d).addEventListener('click', function(){ imp.click(); });
    imp.addEventListener('change', function(){
      const f = imp.files && imp.files[0]; if (!f) return;
      MedrakStore.importJSON(f, function(merged, info){
        resetPhotoCache(); cuSnapshot = prefs.saved(); syncCustomize(); renderAll();
        const nm = function(id){ const m = window.MedrakUniversity && window.MedrakUniversity.meta(id); return m ? m : { nameAr: id, nameEn: id }; };
        let ar = 'تم استيراد تقدمك وتفضيلاتك بنجاح ✓', en = 'Your progress and preferences were imported ✓';
        if (info && info.universityIgnored) { ar += ' — لم نغيّر جامعتك الحالية (' + nm(info.universityKept).nameAr + ')، والملف يحتوي على ' + nm(info.universityIgnored).nameAr + '.'; en += ' — your current university (' + nm(info.universityKept).nameEn + ') was not changed; the file contains ' + nm(info.universityIgnored).nameEn + '.'; }
        else if (info && info.legacy) { ar += ' (ملف قديم: اعتُبرت بياناته الأكاديمية لجامعة الملك عبدالعزيز).'; en += ' (older file: its academic data was treated as King Abdulaziz University data).'; }
        cuMsg(ar, en);
      }, function(err){
        if (err && err.message === 'cancelled') cuMsg('تم إلغاء الاستيراد ولم يتغير شيء.', 'Import cancelled; nothing changed.');
        else cuMsg('⚠️ الملف غير صالح — تأكد إنه نسخة صدّرتها من مِدراك.', '⚠️ Invalid file — make sure it is a backup exported from Medrak.');
      });
      imp.value = '';
    });
  }
  function openCustomize(){
    if (!cuDialog) buildCustomize();
    cuSnapshot = prefs.saved();
    cuMsg();
    syncCustomize(); applyText();
    cuDialog.open();
  }
  window.addEventListener('medrak:prefs', function(){ if (cuDialog && cuDialog.isOpen) syncCustomize(); });

  /* ============================================================
     بطاقة الحساب بالرئيسية (الترحيب + التقدم + أسبوعك)
     ============================================================ */
  function dateLine(){
    const now = new Date(), en = isEn();
    try {
      const g = new Intl.DateTimeFormat(en ? 'en-GB-u-nu-latn' : 'ar-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory' }).format(now);
      let h = '';
      try { h = new Intl.DateTimeFormat(en ? 'en-u-ca-islamic-umalqura-nu-latn' : 'ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(now); } catch(e){}
      return h ? g + ' · ' + h : g;
    } catch(e){ return ''; }
  }
  function greetingWord(){
    const h = new Date().getHours(), en = isEn();
    if (h >= 5 && h < 12) return en ? 'Good morning' : 'صباح الخير';
    if (h >= 12 && h < 18) return en ? 'Good afternoon' : 'مساء الخير';
    if (h >= 18 && h < 23) return en ? 'Good evening' : 'مساء الخير';
    return en ? 'Welcome back' : 'أهلًا بعودتك';
  }
  function streakText(n){
    if (isEn()) return n + '-day streak';
    if (n === 1) return 'يوم واحد من النشاط';
    if (n === 2) return 'يومان متتاليان';
    if (n <= 10) return n + ' أيام متتالية';
    return n + ' يومًا متتاليًا';
  }
  function renderHero(){
    const host = $('#accountHero'); if (!host) return;
    const p = getProfile();
    if (!accountVisible()) { host.hidden = true; host.innerHTML = ''; return; }
    host.hidden = false;
    const shared = !!p.sharedDevice, name = shared ? '' : p.nickname, en = isEn();
    const pct = window.medrakComputeProgress();
    const last = MedrakStore.get('lastVisited', null);
    const ach = MedrakStore.get('lastAchievement', null);
    const days = MedrakStore.get('activityDays', []) || [];
    const loc = en ? 'en-GB-u-nu-latn' : 'ar-u-nu-latn';
    const C = 2 * Math.PI * 42;

    let week = '', streak = 0;
    const fmtWd = new Intl.DateTimeFormat(loc, { weekday: 'short' });
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(); dt.setDate(dt.getDate() - i);
      const active = days.indexOf(window.medrakTodayKey(dt)) >= 0;
      week += '<div class="day' + (i === 0 ? ' today' : '') + (active ? ' active' : '') + '" role="listitem" aria-label="' + esc(fmtWd.format(dt) + ' ' + dt.getDate() + ' — ' + (active ? txt('نشط', 'active') : txt('بدون نشاط', 'no activity'))) + '"><div class="dn" aria-hidden="true">' + esc(fmtWd.format(dt)) + '</div><div class="dd" aria-hidden="true">' + dt.getDate() + '</div><div class="ds" aria-hidden="true">' + (active ? '✓' : '—') + '</div></div>';
    }
    for (let i = 0; i < 120; i++) { const dt = new Date(); dt.setDate(dt.getDate() - i); if (days.indexOf(window.medrakTodayKey(dt)) >= 0) streak++; else break; }

    const greet = shared ? greetingWord() + ' 👋' : (en ? greetingWord() + ', ' + esc(name) + ' 👋' : greetingWord() + ' يا ' + esc(name) + ' 👋');
    const sub = en ? 'Ready to continue your Medrak journey?' : (isF() ? 'جاهزة تكملين رحلتك في مِدراك؟' : 'جاهز تكمل رحلتك في مِدراك؟');
    const contLabel = last ? (en ? 'Continue: ' + navLabelFor(last.page) : (isF() ? 'أكملي من: ' : 'أكمل من: ') + navLabelFor(last.page)) : (en ? 'Start with Learning' : (isF() ? 'ابدئي من التعليم' : 'ابدأ من التعليم'));
    const contHref = last ? last.page : 'education.html';

    host.innerHTML =
      '<div class="ah-head"><div class="ah-avatar"><div class="avatar" id="ahAv"></div>' +
        '<a class="ah-edit" href="profile.html" aria-label="' + esc(txt('تعديل ملفي', 'Edit my profile')) + '" title="' + esc(txt('تعديل ملفي', 'Edit my profile')) + '">' + icon('pencil') + '</a></div>' +
        '<div><h2 class="ah-title">' + greet + '</h2><p class="ah-sub">' + esc(sub) + '</p><p class="ah-date">' + esc(dateLine()) + '</p></div></div>' +
      '<div class="ah-card"><div class="ah-row">' +
        '<div class="ring" role="img" aria-label="' + esc(txt('تقدمك العام', 'Overall progress') + ' ' + pct + '%') + '"><svg viewBox="0 0 100 100"><circle class="ring-bg" cx="50" cy="50" r="42"/><circle class="ring-fg" id="ringFg" cx="50" cy="50" r="42" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '"/></svg><div class="ring-val">' + pct + '%</div></div>' +
        '<div class="ah-info"><p class="ah-label">' + esc(txt('تقدّمك العام', 'Your overall progress')) + '</p>' +
          '<p class="ah-big">' + esc(pct === 0 ? txt('ابدأ أول تجربة لك', 'Try your first experience', 'ابدئي أول تجربة لك') : txt('رحلتك ماشية بشكل رائع', 'Your journey is going great')) + '</p>' +
          '<div class="ah-actions"><a class="btn btn-primary" href="' + esc(contHref) + '">' + esc(contLabel) + '</a><a class="btn btn-outline" href="profile.html">' + esc(txt('فتح ملفي', 'Open my profile')) + '</a></div>' +
          (ach && ach.text ? '<p class="ah-ach">🏆 ' + esc(txt('آخر إنجاز: ', 'Latest achievement: ')) + '<bdi>' + esc(ach.text) + '</bdi></p>' : '') +
        '</div></div>' +
        '<div class="week" role="list" aria-label="' + esc(txt('نشاطك آخر 7 أيام', 'Your activity — last 7 days')) + '">' + week + '</div>' +
        (streak >= 1 ? '<span class="streak">🔥 ' + esc(streakText(streak)) + '</span>' : '') +
      '</div>';
    fillAvatar($('#ahAv', host), p);
    if (reducedMotion) { const fg = $('#ringFg', host); if (fg) fg.setAttribute('stroke-dashoffset', (C * (1 - pct / 100)).toFixed(1)); }
    else requestAnimationFrame(function(){ requestAnimationFrame(function(){ const fg = $('#ringFg', host); if (fg) fg.setAttribute('stroke-dashoffset', (C * (1 - pct / 100)).toFixed(1)); }); });
  }

  /* ============================================================
     دائرة الضوء
     ============================================================ */
  safe(function initSpotlight(){
    const el = $('#cursor-spotlight');
    if (!el || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let x = -999, y = -999, raf = 0;
    function draw(){ raf = 0; el.style.background = 'radial-gradient(circle 260px at ' + x + 'px ' + y + 'px, var(--spot), transparent 70%)'; }
    window.addEventListener('mousemove', function(e){ x = e.clientX; y = e.clientY; if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
    document.addEventListener('mouseleave', function(){ x = y = -999; draw(); });
  }, 'initSpotlight');

  /* ============================================================
     ربط الأزرار + التشغيل
     ============================================================ */
  function renderAll(resetPhoto){
    if (resetPhoto === true) resetPhotoCache();
    renderTopbarAccount(); renderHero(); updateNavCurrent(); applyText();
  }
  safe(function wireTopbar(){
    const tour = $('#tourBtn'), cu = $('#customizeBtn'), chip = $('#acctChip');
    if (tour) tour.addEventListener('click', function(){ openTour(0); });
    if (cu) cu.addEventListener('click', openCustomize);
    if (chip) chip.addEventListener('click', function(e){ if (chip.dataset.mode === 'signin') { e.preventDefault(); openOnboarding(); } });
  }, 'wireTopbar');

  window.addEventListener('medrak:prefs', function(){ renderTopbarAccount(); renderHero(); });
  window.addEventListener('medrak:imported', function(){ resetPhotoCache(); renderAll(); });
  window.medrakShell = {
    /** تستدعيها أي صفحة بعد تعديل الملف الشخصي: تحدّث الشريط العلوي وبطاقة الحساب، وتفتح الترحيب لو ما بقي حساب */
    refresh: function(resetPhoto){ renderAll(resetPhoto === true); if (!hasAccount()) openOnboarding(); },
    openCustomize: openCustomize, openTour: openTour, openOnboarding: openOnboarding, makeDialog: makeDialog, toast: toast, confirm: window.medrakConfirm };

  renderAll();
  if (!hasAccount()) openOnboarding();   /* أول زيارة على هذا الجهاز: اسمك + الجنس + صورة اختيارية */
})();
