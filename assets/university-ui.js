/* =====================================================================
   مِدراك | university-ui.js — كل ما يخص اختيار الجامعة وعرض محتواها
   • محوّل الجامعة بالهيدر + بطاقة اختيار الجامعة (الرئيسية / بوابة الخطة / خطوة الترحيب)
   • معاينة رابط المشاركة (?uni=) بدون تغيير اختيار الطالب المحفوظ
   • معلومات القسم والمصادر الرسمية والإحصاءات بحسب الجامعة المعروضة
   كل شيء محلي: لا خادم ولا حسابات. اختيار الجامعة يُحفظ ضمن التفضيلات (medrak_university).
   ===================================================================== */
(function(){
  "use strict";
  const MU = window.MedrakUniversity, prefs = window.medrakPrefs;
  if (!MU || !prefs) return;
  const html = document.documentElement;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const isEn = () => MU.isEn();
  function T(ar, en, f){ return isEn() ? en : (f && MU.female() ? f : ar); }
  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function bi(ar, en, f){ return f ? ' data-m="' + esc(ar) + '" data-f="' + esc(f) + '" data-en="' + esc(en) + '"' : ' data-ar="' + esc(ar) + '" data-en="' + esc(en) + '"'; }
  function S(ar, en, f, tag, cls){ tag = tag || 'span'; return '<' + tag + (cls ? ' class="' + cls + '"' : '') + bi(ar, en, f) + '>' + esc(T(ar, en, f)) + '</' + tag + '>'; }
  function applyText(){ if (window.medrakApplyText) window.medrakApplyText(); }
  function toast(ar, en){ if (window.medrakShell && window.medrakShell.toast) window.medrakShell.toast(ar, en); }
  const page = () => location.pathname.split('/').pop() || 'index.html';

  /* ============================================================
     بطاقتا اختيار الجامعة (قابلة لإعادة الاستخدام)
     ============================================================ */
  function cardHTML(id, selected){
    const m = MU.meta(id);
    return '<button type="button" class="uni-card" data-uni="' + id + '" aria-pressed="' + (selected === id) + '">' +
      '<span class="uc-top"><span class="uc-mark" aria-hidden="true">🎓</span><span class="uc-code">' + esc(m.code) + '</span></span>' +
      S(m.nameAr, m.nameEn, null, 'span', 'uc-name') +
      '<ul class="uc-list">' +
        '<li>📍 ' + S(m.cityAr, m.cityEn) + '</li>' +
        '<li>🏛️ ' + S(m.collegeAr, m.collegeEn) + '</li>' +
        '<li>📘 ' + S(m.programAr, m.programEn) + '</li>' +
      '</ul>' +
      '<span class="uc-picked" aria-hidden="true">' + S('✓ تم الاختيار', '✓ Selected') + '</span>' +
    '</button>';
  }
  /**
   * يبني منتقي الجامعة داخل host.
   * opts.onStart(id)    — عند الضغط على «ابدأ رحلتك»
   * opts.onExplore()    — عند «أبي أستكشف التخصص أولًا» (يُخفى لو لم تُمرَّر)
   * opts.selected       — اختيار مبدئي
   */
  function buildPicker(host, opts){
    opts = opts || {};
    let sel = opts.selected || null;
    host.innerHTML =
      '<div class="uni-cards" role="group" aria-label="' + esc(T('اختيار الجامعة', 'Choose your university')) + '" data-aria-ar="اختيار الجامعة" data-aria-en="Choose your university">' + MU.ids.map(id => cardHTML(id, sel)).join('') + '</div>' +
      '<div class="uni-actions">' +
        '<button type="button" class="btn btn-primary uni-start" disabled>' + S('ابدأ رحلتك في مِدراك', 'Start your journey in Medrak') + '</button>' +
        (opts.onExplore ? '<button type="button" class="link-btn uni-explore">' + S('أبي أستكشف التخصص أولًا', 'I want to explore the major first') + '</button>' : '') +
      '</div>' +
      '<p class="uni-hint" role="status" aria-live="polite"></p>';
    const start = $('.uni-start', host), hint = $('.uni-hint', host);
    function paint(){
      $$('.uni-card', host).forEach(c => c.setAttribute('aria-pressed', String(c.dataset.uni === sel)));
      start.disabled = !sel;
      if (sel) { hint.setAttribute('data-ar', 'الجامعة المختارة: ' + MU.meta(sel).nameAr); hint.setAttribute('data-en', 'Selected university: ' + MU.meta(sel).nameEn); hint.textContent = T(hint.dataset.ar, hint.dataset.en); }
      else { hint.textContent = ''; hint.removeAttribute('data-ar'); hint.removeAttribute('data-en'); }
    }
    $$('.uni-card', host).forEach(c => c.addEventListener('click', () => { sel = c.dataset.uni; paint(); }));
    start.addEventListener('click', () => { if (sel && opts.onStart) opts.onStart(sel); });
    const ex = $('.uni-explore', host); if (ex) ex.addEventListener('click', () => { if (opts.onExplore) opts.onExplore(); });
    paint(); applyText();
  }
  MU.buildPicker = buildPicker;

  /* خطوة اختيار الجامعة داخل نافذة الترحيب الأول: تستدعيها shell.js بعد إنشاء الحساب */
  window.medrakUniStep = function(container, done){
    container.innerHTML =
      '<div class="ob-inner uni-step">' +
        '<div class="ob-brand"><span class="brand-mark" aria-hidden="true">م</span><span>مِدراك</span></div>' +
        S('أنت من أي جامعة؟ 🎓', 'Which university are you from? 🎓', null, 'h1') +
        S('اختر جامعتك عشان نعرض لك الخطة والمقررات والمعلومات الأكاديمية المناسبة لك.', 'Pick your university so we show you the study plan, courses and academic info that fit you.', 'اختاري جامعتك عشان نعرض لك الخطة والمقررات والمعلومات الأكاديمية المناسبة لك.', 'p', 'ob-sub') +
        '<div class="uni-host"></div>' +
      '</div>';
    buildPicker($('.uni-host', container), {
      onStart: id => { MU.set(id, true); toast('اخترت ' + MU.meta(id).nameAr + ' ✓', 'You chose ' + MU.meta(id).nameEn + ' ✓'); done(id); },
      onExplore: () => { MU.set('none', true); done('none'); },
    });
    applyText();
  };

  /* ============================================================
     محوّل الجامعة بالهيدر
     ============================================================ */
  let menu = null;
  function labelFor(id){
    if (id === 'kau' || id === 'ksu') return { name: MU.name(id), code: MU.meta(id).code };
    return { name: T('اختر جامعتك', 'Choose university'), code: T('الجامعة', 'Uni') };
  }
  function renderSwitcherButton(){
    const btn = $('#uniBtn'); if (!btn) return;
    const eff = MU.effective(), l = labelFor(eff);
    $('#uniName', btn).textContent = l.name; $('#uniCode', btn).textContent = l.code;
    btn.setAttribute('aria-label', T('الجامعة: ', 'University: ') + l.name + T(' — اضغط للتغيير', ' — press to change'));
    btn.title = T('تغيير الجامعة', 'Change university');
  }
  function closeMenu(refocus){
    if (!menu) return; menu.classList.remove('show'); menu.hidden = true;
    const btn = $('#uniBtn'); if (btn) { btn.setAttribute('aria-expanded', 'false'); if (refocus) btn.focus(); }
  }
  function openMenu(){
    const btn = $('#uniBtn'); if (!btn) return;
    if (!menu) {
      menu = document.createElement('div'); menu.id = 'uniMenu'; menu.className = 'uni-menu'; menu.setAttribute('role', 'menu'); menu.hidden = true;
      (document.getElementById('medrak-root') || document.body).appendChild(menu);
      document.addEventListener('mousedown', e => { if (menu && !menu.hidden && !menu.contains(e.target) && !$('#uniBtn').contains(e.target)) closeMenu(false); });
      document.addEventListener('keydown', e => {
        if (!menu || menu.hidden) return;
        if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); const items = $$('[role="menuitemradio"]', menu); const i = items.indexOf(document.activeElement);
          items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
        }
      });
    }
    const eff = MU.saved();
    const items = MU.ids.map(id => ({ id: id, name: MU.name(id), sub: MU.city(id) + ' — ' + MU.college(id) }))
      .concat([{ id: 'none', name: T('بدون جامعة (استكشاف)', 'No university (explore)'), sub: T('تصفّح المحتوى العام فقط', 'Browse general content only') }]);
    menu.innerHTML = '<div class="um-title">' + esc(T('اختر جامعتك', 'Choose your university')) + '</div>' + items.map(it =>
      '<button type="button" role="menuitemradio" aria-checked="' + (it.id === eff) + '" data-uni="' + it.id + '"><span class="um-check" aria-hidden="true">' + (it.id === eff ? '✓' : '') + '</span><span class="um-txt"><b>' + esc(it.name) + '</b><small>' + esc(it.sub) + '</small></span></button>').join('');
    $$('button', menu).forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.uni; closeMenu(true);
      if (MU.isPreview()) window.medrakEndUniPreview();
      if (id !== MU.saved()) { MU.set(id, true); toast(id === 'none' ? 'تم الإلغاء: ستتصفح المحتوى العام فقط' : 'تم التبديل إلى ' + MU.meta(id).nameAr + ' ✓', id === 'none' ? 'Browsing general content only' : 'Switched to ' + MU.meta(id).nameEn + ' ✓'); }
    }));
    menu.hidden = false; menu.classList.add('show'); btn.setAttribute('aria-expanded', 'true');
    const r = btn.getBoundingClientRect(), w = Math.min(320, window.innerWidth - 16);
    menu.style.width = w + 'px'; menu.style.top = (r.bottom + 6) + 'px';
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
    const cur = $('[aria-checked="true"]', menu) || $('button', menu); cur.focus();
  }
  function wireSwitcher(){
    const btn = $('#uniBtn'); if (!btn) return;
    btn.addEventListener('click', () => { (menu && !menu.hidden) ? closeMenu(false) : openMenu(); });
    renderSwitcherButton();
  }

  /* ============================================================
     بطاقة معاينة رابط المشاركة
     ============================================================ */
  function renderPreviewBanner(){
    let b = $('#uniPreviewBanner');
    if (!MU.isPreview()) { if (b) b.remove(); return; }
    const eff = MU.effective(), sv = MU.saved();
    if (!b) { b = document.createElement('div'); b.id = 'uniPreviewBanner'; b.className = 'uni-preview no-print'; b.setAttribute('role', 'status'); const tb = $('.topbar'); if (tb) tb.insertAdjacentElement('afterend', b); else document.body.prepend(b); }
    const mine = (sv === 'kau' || sv === 'ksu') ? T('اختيارك المحفوظ: ', 'Your saved choice: ') + MU.name(sv) : T('لم تحدد جامعة بعد', 'You have not chosen a university yet');
    b.innerHTML = '<span class="up-txt">👀 ' + esc(T('تعرض الآن محتوى ', 'You are viewing ') + MU.name(eff) + T(' عبر رابط مشاركة (معاينة فقط). ', ' via a shared link (preview only). ') + mine + '.') + '</span>' +
      '<span class="up-actions"><button type="button" class="btn btn-primary up-keep">' + esc(T('اجعلها جامعتي', 'Make this my university')) + '</button>' +
      ((sv === 'kau' || sv === 'ksu') ? '<button type="button" class="btn btn-outline up-back">' + esc(T('العودة إلى جامعتي', 'Back to my university')) + '</button>' : '<button type="button" class="btn btn-outline up-back">' + esc(T('إغلاق المعاينة', 'Close preview')) + '</button>') + '</span>';
    $('.up-keep', b).addEventListener('click', () => { window.medrakEndUniPreview(); MU.set(eff, true); toast('تم حفظ ' + MU.meta(eff).nameAr + ' كجامعتك ✓', MU.meta(eff).nameEn + ' saved as your university ✓'); });
    $('.up-back', b).addEventListener('click', () => window.medrakEndUniPreview());
  }

  /* ============================================================
     الرئيسية: شاشة الاختيار + الإحصاءات + قسم الجامعة + المصادر
     ============================================================ */
  function renderChooserSection(){
    const sec = $('#uniChooser'); if (!sec) return;
    const sv = MU.saved(), show = !(sv === 'kau' || sv === 'ksu');
    sec.hidden = !show; if (!show) return;
    const host = $('.uni-host', sec); if (host.dataset.built === (sv || 'null')) return;
    host.dataset.built = sv || 'null';
    const note = $('#uniExploreNote', sec); if (note) note.hidden = sv !== 'none';
    buildPicker(host, {
      onStart: id => { MU.set(id, true); toast('اخترت ' + MU.meta(id).nameAr + ' ✓', 'You chose ' + MU.meta(id).nameEn + ' ✓'); },
      onExplore: () => { MU.set('none', true); const t = $('#what-is'); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); },
    });
  }

  let heroKauHTML = null;
  function renderHeroStats(){
    const card = $('#heroStats'); if (!card) return;
    if (heroKauHTML === null) heroKauHTML = card.innerHTML;
    const eff = MU.effective();
    const chip = $('#heroDisclaimer'); if (chip) MU.setText(chip, '📌 مِدراك منصة طلابية مستقلة، وليست تابعة رسميًا لأي جامعة', '📌 Medrak is an independent student platform, not officially affiliated with any university');
    if (eff === 'kau') { card.innerHTML = heroKauHTML; }
    else if (eff === 'ksu') {
      const d = MU.data('ksu') && MU.data('ksu').info;
      const cr = d ? d.totalCredits : 130;
      card.innerHTML =
        '<div class="stat">' + S('الساعات المعتمدة (وفق الخطة المعلنة)', 'Credit hours (per the announced plan)') + '<b>' + cr + '</b></div>' +
        '<div class="stat">' + S('المدة الدراسية النظامية', 'Standard duration') + '<b' + bi('4 سنوات', '4 years') + '>' + T('4 سنوات', '4 years') + '</b></div>' +
        '<div class="stat">' + S('مقررات الاختيار (جامعة + قسم)', 'Elective hours (university + dept.)') + '<b>8 + 12</b></div>' +
        '<div class="stat">' + S('الكلية التابع لها القسم', 'Parent college') + '<b' + bi('الحقوق والعلوم السياسية', 'Law & Political Science') + '>' + T('الحقوق والعلوم السياسية', 'Law & Political Science') + '</b></div>';
    } else {
      card.innerHTML = '<div class="stat uni-none-stat"><span>' + esc(T('اختر جامعتك لتظهر لك أرقام خطتك: الساعات والمدة والكلية.', 'Choose your university to see your plan numbers: hours, duration and college.')) + '</span></div>' +
        '<a href="#uniChooser" class="btn btn-light" style="margin-top:14px;align-self:flex-start">' + esc(T('اختيار الجامعة', 'Choose university')) + '</a>';
    }
    applyText();
  }

  /* قسم القسم (#kau): محتوى KAU الأصلي يبقى كما هو، ومحتوى KSU يُبنى من البيانات */
  function renderDept(){
    const sec = $('#kau'); if (!sec) return;
    const eff = MU.effective(), title = $('#deptTitle'), sub = $('#deptSub'), ksuBox = $('#deptKsu');
    if (eff === 'kau') {
      MU.setText(title, 'قسم العلوم السياسية بجامعة الملك عبدالعزيز 🎓', 'Political Science Dept. at KAU 🎓');
      MU.setText(sub, 'أهم جزء بالموقع. كل معلومة هنا مبنية على مصادر رسمية من الجامعة، مع رابط المصدر بجانبها.', 'The most important part of the site. Every fact here is based on official university sources, linked next to it.');
    } else if (eff === 'ksu') {
      MU.setText(title, 'قسم العلوم السياسية — جامعة الملك سعود 🎓', 'Political Science Department — King Saud University 🎓');
      MU.setText(sub, 'كلية الحقوق والعلوم السياسية | الرياض', 'College of Law and Political Science | Riyadh');
      const ready = MU.data('ksu');
      if (!ready) { ksuBox.innerHTML = '<p class="uni-loading">…</p>'; return; }
      if (ksuBox.dataset.lang !== MU.lang() + (MU.female() ? 'f' : 'm')) buildKsuDept(ksuBox, ready);
    } else {
      MU.setText(title, 'قسم العلوم السياسية 🎓', 'Political Science Department 🎓');
      MU.setText(sub, 'اختر جامعتك لعرض معلومات قسمها الأكاديمية.', 'Choose your university to see its department information.');
    }
    applyText();
  }
  function link(url, ar, en, cls){ return '<a class="' + (cls || 'source-link') + '" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(T(ar, en)) + ' ↗</a>'; }
  function buildKsuDept(box, d){
    const i = d.info, en = isEn();
    const ver = MU.fmtDate(i.lastVerifiedDate);
    box.dataset.lang = MU.lang() + (MU.female() ? 'f' : 'm');
    box.innerHTML =
      '<div class="tabs" data-group="ksuDept" role="tablist">' +
        '<button class="tab-btn active" data-tab="about">' + S('نبذة عن القسم', 'About the department') + '</button>' +
        '<button class="tab-btn" data-tab="goals">' + S('الأهداف والمجالات الوظيفية', 'Goals & careers') + '</button>' +
        '<button class="tab-btn" data-tab="admission">' + S('القبول والتحويل', 'Admission & transfer') + '</button>' +
      '</div>' +
      '<div class="tab-panel active" data-group="ksuDept" data-panel="about">' +
        '<div class="info-card"><p>' + esc(en ? i.introEn : i.introAr) + '</p>' +
        '<p class="dept-note">' + esc(T('هذه صياغة تعريفية مبسطة من مِدراك تستند إلى أهداف البرنامج الواردة في دليل الجامعة، وليست نقلًا حرفيًا عنه.', 'This is a simplified introduction written by Medrak, based on the program goals in the university guide — not a verbatim quote.')) + '</p>' +
        '<div class="fact-grid">' +
          '<div class="fact"><span>' + esc(T('الدرجة', 'Degree')) + '</span><b>' + esc(T('بكالوريوس العلوم السياسية', 'Bachelor of Political Science')) + '</b></div>' +
          '<div class="fact"><span>' + esc(T('المدة الدراسية', 'Duration')) + '</span><b>' + esc(T('4 سنوات', '4 years')) + '</b></div>' +
          '<div class="fact"><span>' + esc(T('الساعات المعتمدة', 'Credit hours')) + '</span><b>' + esc(T('130 ساعة وفق الخطة المشار إليها', '130 hours per the referenced plan')) + '</b></div>' +
          '<div class="fact"><span>' + esc(T('الكلية', 'College')) + '</span><b>' + esc(T('الحقوق والعلوم السياسية', 'Law & Political Science')) + '</b></div>' +
        '</div>' +
        '<h3 class="dept-h">' + esc(T('نبذة تاريخية', 'Brief history')) + '</h3><p>' + esc(en ? i.historyEn : i.historyAr) + '</p>' +
        '<div class="dept-links">' + link('https://clps.ksu.edu.sa/ar/node/2901', 'المصدر الرسمي', 'Official source', 'btn btn-outline') + ' ' + link('https://clps.ksu.edu.sa/ar/node/1218', 'مصدر النبذة التاريخية', 'History source') + '</div>' +
        '<p class="dept-note">' + esc(T('آخر تحقق من المصادر: ', 'Sources last checked: ') + ver) + '</p></div>' +
      '</div>' +
      '<div class="tab-panel" data-group="ksuDept" data-panel="goals">' +
        '<div class="info-card"><h3 class="dept-h">' + esc(T('أهداف البرنامج', 'Program goals')) + '</h3><ul class="dept-list">' + (en ? i.goalsEn : i.goalsAr).map(g => '<li>' + esc(g) + '</li>').join('') + '</ul>' +
        '<p class="dept-note">' + esc(T('صياغة مختصرة من مِدراك مستندة إلى الدليل الرسمي للبرنامج.', 'A short wording by Medrak based on the official program guide.')) + ' ' + link('https://clps.ksu.edu.sa/sites/clps.ksu.edu.sa/files/2024-04/ss.pdf', 'الدليل الرسمي (PDF)', 'Official guide (PDF)') + '</p>' +
        '<h3 class="dept-h">' + esc(T('وين ممكن تشتغل بعد التخرج؟', 'Where could you work after graduating?')) + '</h3><ul class="dept-list chips">' + (en ? i.careersEn : i.careersAr).map(g => '<li>' + esc(g) + '</li>').join('') + '</ul>' +
        '<p class="dept-warn">⚠️ ' + esc(T('هذه مجالات مهنية محتملة وليست ضمانًا للتوظيف، وقد تتطلب بعض الوظائف شروطًا أو مؤهلات إضافية.', 'These are possible professional fields, not a guarantee of employment; some jobs may require additional conditions or qualifications.')) + '</p></div>' +
      '</div>' +
      '<div class="tab-panel" data-group="ksuDept" data-panel="admission">' + admissionHTML(d) + '</div>' +
      '<p class="acad-note">' + esc(T('المعلومات الأكاديمية لأغراض إرشادية؛ تحقق منها دائمًا من جامعتك. مِدراك منصة مستقلة وليست تابعة للجامعة.', 'Academic information is for guidance only; always verify it with your university. Medrak is independent and not affiliated with the university.')) + '</p>';
    if (window.medrakWireTabs) window.medrakWireTabs(box);
  }
  function admissionHTML(d){
    const L = d.admission.links;
    const block = (n, ar, en, bodyAr, bodyEn) => '<div class="adm-block"><h4><span class="adm-n">' + n + '</span>' + esc(T(ar, en)) + '</h4><p>' + esc(T(bodyAr, bodyEn)) + '</p></div>';
    return '<div class="info-card">' +
      '<h3 class="dept-h">' + esc(T('القبول والتحويل إلى العلوم السياسية', 'Admission & transfer to Political Science')) + '</h3>' +
      '<p class="dept-warn">⚠️ ' + esc(T('قد تختلف شروط القبول والتحويل بحسب العام الجامعي والطاقة الاستيعابية واللوائح المعتمدة. يُرجى الرجوع إلى جامعة الملك سعود للتحقق من الشروط الحالية.', 'Admission and transfer conditions may vary by academic year, capacity and approved regulations. Please refer to King Saud University to verify the current conditions.')) + '</p>' +
      block('1', 'الالتحاق بالتخصص', 'Joining the major', 'بحسب دليل البرنامج (إصدار 2024)، يكون الالتحاق بعد إكمال السنة الأولى المشتركة وفق معدل وعدد مقاعد تحددها الجامعة كل عام. لا نعرض أي معدل أو نسبة لأنها تتغير وتُعلن من الجامعة.', 'According to the program guide (2024 edition), joining follows the common first year, subject to a GPA and a number of seats set by the university each year. We show no GPA or percentage figures because they change and are announced by the university.') +
      block('2', 'التحويل من تخصص آخر داخل الجامعة', 'Transfer from another major inside the university', 'تحدد الجامعة شروط التحويل الداخلي (مثل المعدل التراكمي وإنهاء فصل بعد التخصص) في لوائحها وتعلنها كل عام. راجع عمادة القبول والتسجيل أو القسم.', 'The university sets internal-transfer conditions (such as GPA and completing a term after the major) in its regulations and announces them every year. Check with the Deanship of Admission & Registration or the department.') +
      block('3', 'التحويل من خارج الجامعة', 'Transfer from outside the university', 'تعلن عمادة القبول والتسجيل مواعيد التحويل من خارج الجامعة وضوابطه ومستنداته ومعادلة المقررات، ويحتاج الطلب إلى موافقة الجهات المختصة. وبحسب صفحة العمادة تُدرج العلوم السياسية ضمن البرامج المتاح التحويل إليها.', 'The Deanship of Admission & Registration announces the dates, rules, documents and course-equivalency process for transfers from outside the university, and the request needs the approval of the competent bodies. According to the Deanship page, Political Science is among the programs open for transfer.') +
      block('4', 'الاستفسار من القسم أو العمادة', 'Asking the department or the Deanship', 'للتأكد من الشروط الحالية تواصل مباشرة مع قسم العلوم السياسية أو عمادة شؤون القبول والتسجيل.', 'To confirm the current conditions, contact the Political Science Department or the Deanship of Admission & Registration directly.') +
      '<div class="dept-links">' + L.map(l => link(l.url, l.titleAr, l.titleEn, 'btn btn-outline')).join(' ') + '</div>' +
      '<p class="dept-note">' + esc(T('الإشارة إلى هذه الروابط لا تعني أي شراكة أو اعتماد من الجامعة لمنصة مِدراك.', 'Linking to these pages does not imply any partnership or endorsement of Medrak by the university.')) + '</p></div>';
  }

  /* المصادر الرسمية: قابلة للتوسعة، تبدأ بمصادر الجامعة المختارة */
  const TYPE = { page: ['صفحة رسمية', 'Official page'], pdf: ['دليل PDF', 'PDF guide'] };
  function renderSources(){
    const box = $('#sourcesBox'); if (!box) return;
    const order = MU.ids.slice(); const cur = MU.effective(); if (cur !== 'none') order.sort((a, b) => (a === cur ? -1 : b === cur ? 1 : 0));
    box.innerHTML = order.map(id => {
      const d = MU.data(id), m = MU.meta(id); if (!d) return '';
      const items = d.sources.map(s =>
        '<li class="src-item"><div class="src-main"><b>' + esc(T(s.titleAr, s.titleEn)) + '</b>' +
        '<span class="src-meta">' + esc(T(m.nameAr, m.nameEn)) + ' · ' + esc(T(TYPE[s.type][0], TYPE[s.type][1])) + '</span>' +
        (s.noteAr ? '<small class="src-note">' + esc(T(s.noteAr, s.noteEn)) + '</small>' : '') +
        '<small class="src-ver">' + esc(s.verified ? T('آخر تحقق من المصدر: ', 'Last checked: ') + MU.fmtDate(s.verified) : T('لم يُفحص الرابط آليًا', 'Link not checked automatically')) + '</small></div>' +
        '<a class="btn btn-outline src-open" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(T('فتح المصدر', 'Open source')) + ' ↗</a></li>').join('');
      return '<details class="src-group"' + (id === cur || (cur === 'none' && id === order[0]) ? ' open' : '') + '><summary><span>🎓 ' + esc(T('مصادر ', 'Sources — ') + T(m.nameAr, m.nameEn)) + '</span><span class="src-count">' + d.sources.length + '</span></summary><ul class="src-list">' + items + '</ul></details>';
    }).join('');
  }

  /* ============================================================
     تشغيل وتحديث
     ============================================================ */
  function refresh(){
    renderSwitcherButton(); renderPreviewBanner(); renderChooserSection(); renderHeroStats(); renderDept(); renderSources();
    if (page() === 'study-plan.html') {
      const eff = MU.effective(), tt = $('title');
      if (tt) { if (eff !== 'none') MU.setText(tt, 'الخطة الدراسية — ' + MU.meta(eff).nameAr + ' | مِدراك', 'Study Plan — ' + MU.meta(eff).nameEn + ' | Medrak'); else MU.setText(tt, 'الخطة الدراسية | مِدراك', 'Study Plan | Medrak'); }
    }
    applyText();
  }
  wireSwitcher();
  let last = '';
  window.addEventListener('medrak:prefs', () => { const key = MU.saved() + '|' + MU.effective() + '|' + MU.lang() + '|' + MU.female(); if (key !== last) { last = key; refresh(); } else { renderSwitcherButton(); } });
  window.addEventListener('medrak:university-data', refresh);
  window.addEventListener('medrak:imported', refresh);
  last = MU.saved() + '|' + MU.effective() + '|' + MU.lang() + '|' + MU.female();
  refresh();
  /* الأقسام التي بُنيت قبل تحميل بيانات الجامعات */
  window.addEventListener('load', refresh);
})();
