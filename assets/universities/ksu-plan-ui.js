/* =====================================================================
   مِدراك | universities/ksu-plan-ui.js — الخطة الدراسية التفاعلية لجامعة الملك سعود (+ لافتة الجامعة وبوابة الاختيار بصفحة الخطة)
   • تقدم الطالب محفوظ مستقلًا عن جامعة الملك عبدالعزيز: MedrakStore.acadGet('ksu','studyPlanProgress').
   • الخطة غير مؤكدة (فروقات موثقة بين المصادر الرسمية) ⇒ النسبة «تقديرية» ولا يوجد حساب نهائي للمتبقي أو للتخرج.
   • لا يُحتسب المقرر مرتين (440 ساس يظهر في مستويين بمعرّف واحد)، ولا تُحتسب ساعات الاختياري الزائدة عن المطلوب.
   ===================================================================== */
(function(){
  "use strict";
  const MU = window.MedrakUniversity;
  if (!MU || !window.MedrakStore) return;
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  const isEn = () => MU.isEn();
  const T = (ar, en, f) => isEn() ? en : (f && MU.female() ? f : ar);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = (ar, en) => { if (window.medrakShell && window.medrakShell.toast) window.medrakShell.toast(ar, en); };
  const uidOf = code => 'ksu:' + code.replace(/\s+/g, '-');
  const STATES = ['remaining', 'current', 'planned', 'done'];
  const LABELS = { remaining: ['متبقٍ', 'Remaining'], current: ['الفصل الحالي', 'Current term'], planned: ['فصل قادم', 'Next term'], done: ['منجز', 'Completed'] };

  const host = $('#ksuPlan'), gate = $('#planGate'), banner = $('#planUniBanner');
  let ready = false, loadingStarted = false, searchTerm = '';

  /* ---------------- لافتة الجامعة + بوابة الاختيار ---------------- */
  function renderBanner(){
    if (!banner) return;
    const eff = MU.effective(); if (eff === 'none') { banner.innerHTML = ''; return; }
    const m = MU.meta(eff);
    banner.innerHTML =
      '<div class="pub-name">🎓 <span>' + esc(T('الخطة الدراسية — ', 'Study plan — ') + MU.name(eff)) + '</span><span class="pub-tag">' + esc(m.code) + '</span></div>' +
      '<div class="pub-acts"><button type="button" class="btn btn-outline" id="planShare">' + esc(T('نسخ رابط المشاركة', 'Copy share link')) + '</button>' +
      '<button type="button" class="btn btn-outline" id="planSwitch">' + esc(T('تغيير الجامعة', 'Change university')) + '</button></div>';
    $('#planShare', banner).addEventListener('click', () => {
      const url = MU.shareUrl(eff, 'study-plan.html');
      const done = () => toast('تم نسخ رابط المشاركة ✓ (من يفتحه يرى معاينة فقط)', 'Share link copied ✓ (whoever opens it sees a preview only)');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => window.prompt(T('انسخ الرابط:', 'Copy the link:'), url));
      else window.prompt(T('انسخ الرابط:', 'Copy the link:'), url);
    });
    $('#planSwitch', banner).addEventListener('click', () => { const b = $('#uniBtn'); if (b) b.click(); });
    const sub = $('#planSub');
    if (sub) {
      if (eff === 'ksu') MU.setText(sub, 'تابع مقرراتك الإجبارية والاختيارية عبر 8 مستويات، وحدد ما أنجزته وما تخطط له. اضغط على اسم أي مقرر لتفاصيله.', 'Track your mandatory and elective courses across 8 levels, and mark what you completed or plan. Press a course name for its details.');
      else if (sub.dataset.kauAr) MU.setText(sub, sub.dataset.kauAr, sub.dataset.kauEn);
    }
  }
  function renderGate(){
    if (!gate || gate.dataset.built) return;
    gate.dataset.built = '1';
    gate.innerHTML = '<h3 style="margin:0 0 6px;color:var(--text)" data-ar="حدّد جامعتك لعرض الخطة الدراسية 🎓" data-en="Choose your university to see the study plan 🎓">حدّد جامعتك لعرض الخطة الدراسية 🎓</h3>' +
      '<p style="margin:0 0 16px;color:var(--text-soft)" data-ar="الخطة والمقررات تختلف من جامعة لأخرى، فاختر جامعتك أولًا." data-en="Plans and courses differ between universities, so choose yours first.">الخطة والمقررات تختلف من جامعة لأخرى، فاختر جامعتك أولًا.</p><div class="uni-host"></div>';
    MU.buildPicker($('.uni-host', gate), { onStart: id => { MU.set(id, true); toast('اخترت ' + MU.meta(id).nameAr + ' ✓', 'You chose ' + MU.meta(id).nameEn + ' ✓'); } });
  }

  /* ---------------- بيانات وحسابات ---------------- */
  const curriculum = () => { const d = MU.data('ksu'); return d && d.curricula && d.curricula[0]; };
  function progress(){
    const p = MedrakStore.acadGet('ksu', 'studyPlanProgress', null);
    return (p && p.states && typeof p.states === 'object') ? p : { states: {}, curriculumId: 'dar-plans-2026-04' };
  }
  function writeState(uid, st){
    if (MU.isPreview()) { toast('هذه معاينة عبر رابط مشاركة — اجعلها جامعتك أولًا لحفظ تقدمك.', 'This is a share-link preview — make it your university first to save progress.'); return false; }
    const p = progress();
    if (st === 'remaining') delete p.states[uid]; else p.states[uid] = st;
    p.curriculumId = 'dar-plans-2026-04'; p.updatedAt = new Date().toISOString();
    MedrakStore.acadSet('ksu', 'studyPlanProgress', p);
    if (window.medrakLogActivity) window.medrakLogActivity();
    return true;
  }
  function compute(c, states){
    const list = Object.keys(c.courses).map(k => c.courses[k]);
    const sum = (arr) => arr.reduce((s, x) => s + x.hours, 0);
    const doneOf = type => list.filter(x => x.type === type && states[x.uid] === 'done');
    const mand = list.filter(x => x.type === 'mandatory');
    const mDone = sum(mand.filter(x => states[x.uid] === 'done'));
    const uDoneRaw = sum(doneOf('elective-university')), dDoneRaw = sum(doneOf('elective-department'));
    const uReq = c.electiveGroups[0].required, dReq = c.electiveGroups[1].required;
    const uCounted = Math.min(uDoneRaw, uReq), dCounted = Math.min(dDoneRaw, dReq);
    const total = mDone + uCounted + dCounted;
    return {
      mandTotal: sum(mand), mDone: mDone, uReq: uReq, dReq: dReq, uRaw: uDoneRaw, dRaw: dDoneRaw, uCounted: uCounted, dCounted: dCounted,
      total: total, pct: Math.min(100, Math.round(total / c.totalCreditsOfficial * 100)),
      current: sum(list.filter(x => states[x.uid] === 'current')), planned: sum(list.filter(x => states[x.uid] === 'planned')),
      plannedList: list.filter(x => states[x.uid] === 'planned'),
    };
  }

  /* ---------------- العرض ---------------- */
  function rowHTML(c, course, st, opts){
    opts = opts || {};
    const states = progress().states;
    const warn = (st && st !== 'remaining' && course.prereq && course.prereq.length)
      ? course.prereq.filter(code => states[uidOf(code)] !== 'done') : [];
    const sel = '<select class="k-state form-select" data-uid="' + esc(course.uid) + '" aria-label="' + esc(course.name + ' — ' + T('حالة المقرر', 'course status')) + '"' + (MU.isPreview() ? ' disabled' : '') + '>' +
      STATES.map(s => '<option value="' + s + '"' + (s === (st || 'remaining') ? ' selected' : '') + '>' + esc(T(LABELS[s][0], LABELS[s][1])) + '</option>').join('') + '</select>';
    const badge = course.type === 'mandatory' ? '<span class="k-badge req">' + esc(T('إجباري', 'Mandatory')) + '</span>' : '<span class="k-badge">' + esc(T('اختياري', 'Elective')) + '</span>';
    return '<div class="krow" data-uid="' + esc(course.uid) + '" data-state="' + (st || 'remaining') + '" data-search="' + esc((course.code + ' ' + course.name).toLowerCase()) + '">' +
      '<button type="button" class="k-name" data-uid="' + esc(course.uid) + '">' + esc(course.name) + '</button>' +
      '<span class="k-meta">' + esc(course.code) + ' · ' + course.hours + ' ' + esc(T('س', 'h')) + '</span>' + badge + sel +
      (opts.dup ? '<span class="k-dup">' + esc(T('هذا المقرر نفسه يظهر في المستوى 6 على صفحة العمادة — يُحتسب مرة واحدة وحالته مشتركة.', 'This is the same course shown in level 6 on the Deanship page — counted once, with one shared status.')) + '</span>' : '') +
      (warn.length ? '<span class="k-warn">⚠️ ' + esc(T('المتطلب السابق (' + warn.join('، ') + ') غير محدد كمنجز عندك — حسب دليل البرنامج 2024.', 'The prerequisite (' + warn.join(', ') + ') is not marked completed — per the 2024 program guide.')) + '</span>' : '') +
      '</div>';
  }
  function render(){
    if (!host) return;
    const c = curriculum();
    if (!c) { host.innerHTML = '<p class="uni-loading">' + esc(T('جاري تحميل الخطة…', 'Loading the plan…')) + '</p>'; return; }
    const d = MU.data('ksu'), states = progress().states, m = compute(c, states), en = isEn();
    const conflicts = (d.conflicts || []).map(x => '<li>' + esc(en ? x.en : x.ar) + '</li>').join('');
    const levels = c.placements.map(pl => {
      const rows = pl.ids.map(id => {
        const course = c.courses[id], dup = (pl.level === 7 && course.alsoInLevels && course.alsoInLevels.indexOf(7) >= 0 && course.alsoInLevels[0] === 6);
        return rowHTML(c, course, states[id], { dup: dup });
      }).join('');
      const hrs = pl.ids.filter((id, i) => !(pl.level === 7 && c.courses[id].alsoInLevels)).reduce((s, id) => s + c.courses[id].hours, 0);
      return '<div class="ksu-level" data-level="' + pl.level + '"><h4><span>' + esc(T('المستوى ', 'Level ') + pl.level) + '</span><small>' + esc(T('إجباري: ', 'Mandatory: ') + (pl.level === 7 ? hrs + ' (+3 ' + T('مكرر', 'dup') + ')' : hrs) + ' ' + T('ساعة', 'h')) + '</small></h4>' +
        (pl.level === 1 ? '<p class="lv-note">' + esc(T('السنة الأولى المشتركة (متطلبات جامعية).', 'Common first year (university requirements).')) + '</p>' : '') + rows + '</div>';
    }).join('');
    const groups = c.electiveGroups.map((g, gi) => {
      const raw = gi === 0 ? m.uRaw : m.dRaw, counted = gi === 0 ? m.uCounted : m.dCounted;
      const over = raw > g.required;
      return '<div class="ksu-elective" data-group="' + g.id + '"><h4>' + esc(T(g.titleAr, g.titleEn)) + '</h4>' +
        '<p class="lv-note">' + esc(T(g.noteAr, g.noteEn)) + '</p>' +
        '<p class="el-count">' + esc(T('المنجز من هذه المجموعة: ', 'Completed from this group: ') + raw + ' / ' + g.required + ' ' + T('ساعة', 'h') + (over ? T(' — الزيادة عن المطلوب لا تُحتسب', ' — hours beyond the requirement are not counted') : '')) + '</p>' +
        g.ids.map(id => rowHTML(c, c.courses[id], states[id])).join('') + '</div>';
    }).join('');
    const planned = m.plannedList.length ? '<div class="ksu-next"><b>' + esc(T('خطتي للفصل القادم: ', 'My next-term plan: ')) + m.planned + ' ' + esc(T('ساعة', 'h')) + '</b> — ' + esc(m.plannedList.map(x => x.name).join(T('، ', ', '))) + '</div>' : '';
    host.innerHTML =
      '<div class="ksu-status" role="note"><b>⚠️ ' + esc(T('خطة غير مؤكدة — التقدم تقديري فقط.', 'Unconfirmed plan — progress is an estimate only.')) + '</b> ' +
        esc(T('الخطة المعروضة مأخوذة من صفحة عمادة القبول والتسجيل (آخر تحديث للصفحة: 22 أبريل 2026)، وتختلف في بعض المقررات والساعات عن دليل البرنامج الرسمي (إصدار 2024). لذلك لا نحسب «المتبقي» ولا نؤكد استيفاء شروط التخرج. المرجع هو جامعتك ونظامك الأكاديمي.',
          'The plan shown comes from the Deanship of Admission & Registration page (page last updated 22 April 2026) and differs in some courses and hours from the official program guide (2024 edition). So we do not compute “remaining hours” nor confirm graduation requirements. Your university and academic system are the reference.')) +
        '<details><summary>' + esc(T('عرض الفروقات بين المصادر الرسمية (' + (d.conflicts || []).length + ')', 'Show differences between official sources (' + (d.conflicts || []).length + ')')) + '</summary><ol>' + conflicts + '</ol></details></div>' +
      '<div class="ksu-curr"><span>' + esc(T('الخطة الأكاديمية:', 'Academic plan:')) + '</span> <b>' + esc(en ? c.labelEn : c.labelAr) + '</b> <span class="tag">' + esc(T('غير مؤكدة', 'Unconfirmed')) + '</span></div>' +
      (MU.isPreview() ? '<div class="ksu-status"><b>👀 ' + esc(T('معاينة عبر رابط مشاركة: حقول الحالة معطّلة حتى تجعلها جامعتك.', 'Share-link preview: status fields are disabled until you make it your university.')) + '</b></div>' : '') +
      '<div class="ksu-summary" aria-live="polite">' +
        '<div class="box"><span>' + esc(T('الساعات المنجزة (المحتسبة)', 'Completed hours (counted)')) + '</span><b>' + m.total + '</b><small>' + esc(T('إجباري + اختياري بحدود المطلوب', 'mandatory + electives up to the requirement')) + '</small></div>' +
        '<div class="box"><span>' + esc(T('نسبة الإنجاز التقديرية', 'Estimated completion')) + '</span><b>' + m.pct + '%</b><div class="ksu-bar" role="progressbar" aria-valuenow="' + m.pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + m.pct + '%"></i></div><small>' + esc(T('من ' + c.totalCreditsOfficial + ' ساعة معلنة', 'of the announced ' + c.totalCreditsOfficial + ' hours')) + '</small></div>' +
        '<div class="box"><span>' + esc(T('إجباري', 'Mandatory')) + '</span><b>' + m.mDone + ' / ' + m.mandTotal + '</b><small>' + esc(T('بحسب الجداول المنشورة', 'per the published tables')) + '</small></div>' +
        '<div class="box"><span>' + esc(T('اختياري جامعة', 'University elective')) + '</span><b>' + m.uCounted + ' / ' + m.uReq + '</b></div>' +
        '<div class="box"><span>' + esc(T('اختياري قسم', 'Department elective')) + '</span><b>' + m.dCounted + ' / ' + m.dReq + '</b></div>' +
        '<div class="box"><span>' + esc(T('الفصل الحالي / القادم', 'Current / next term')) + '</span><b>' + m.current + ' / ' + m.planned + '</b><small>' + esc(T('ساعات مختارة', 'selected hours')) + '</small></div>' +
      '</div>' +
      '<p class="ksu-lock">🔒 ' + esc(T('الساعات المتبقية ومؤشر «مستعد للتخرج» غير مفعّلين لأن شروط اكتمال الخطة لم تُحسم رسميًا بعد. هذه الأرقام لمتابعتك الشخصية فقط، وليست تأكيدًا من الجامعة.', 'Remaining hours and the “ready to graduate” indicator are disabled because the plan-completion rules are not yet officially settled. These numbers are for your personal tracking only, not a confirmation from the university.')) + '</p>' +
      '<input type="search" id="ksuSearch" class="ksu-search" value="' + esc(searchTerm) + '" placeholder="' + esc(T('🔍 ابحث عن مقرر بالاسم أو الرمز...', '🔍 Search a course by name or code...')) + '" aria-label="' + esc(T('بحث في مقررات الخطة', 'Search plan courses')) + '">' +
      '<div class="ksu-legend"><span class="l-done">' + esc(T('منجز', 'Completed')) + '</span><span class="l-current">' + esc(T('الفصل الحالي', 'Current term')) + '</span><span class="l-planned">' + esc(T('فصل قادم', 'Next term')) + '</span></div>' +
      planned + '<div class="ksu-levels">' + levels + '</div>' + groups;
    wire();
    const q = $('#ksuSearch', host);
    if (q) q.addEventListener('input', () => { searchTerm = q.value; filter(q.value); });
    if (searchTerm) filter(searchTerm);
  }
  function wire(){
    $$('.k-state', host).forEach(s => s.addEventListener('change', () => {
      const ok = writeState(s.dataset.uid, s.value);
      if (ok) { render(); window.dispatchEvent(new CustomEvent('medrak:progress')); if (window.medrakShell) window.medrakShell.refresh(); } else render();
    }));
    $$('.k-name', host).forEach(b => b.addEventListener('click', () => openModal(b.dataset.uid)));
  }
  function filter(term){
    const t = term.trim().toLowerCase();
    $$('.krow', host).forEach(r => { r.style.display = (!t || r.dataset.search.indexOf(t) >= 0) ? '' : 'none'; });
    $$('.ksu-level, .ksu-elective', host).forEach(card => { const any = $$('.krow', card).some(r => r.style.display !== 'none'); card.style.display = any ? '' : 'none'; });
  }

  function openModal(uid){
    const c = curriculum(); const course = c && c.courses[uid]; if (!course) return;
    $('#modalCode').textContent = course.code; $('#modalName').textContent = course.name;
    $('#modalHours').textContent = T('عدد الساعات: ', 'Credit hours: ') + course.hours;
    const pr = course.prereq === undefined ? T('غير مذكور رسميًا في المصدر المعتمد للخطة', 'Not stated in the plan’s source')
      : (course.prereq.length ? course.prereq.join(T('، ', ', ')) + T(' (حسب دليل البرنامج 2024)', ' (per the 2024 program guide)') : T('لا يوجد (حسب دليل البرنامج 2024)', 'None (per the 2024 program guide)'));
    $('#modalPrereq').textContent = T('المتطلب السابق: ', 'Prerequisite: ') + pr;
    const lvl = course.level ? T('المستوى ' + course.level + (course.alsoInLevels ? ' (ويظهر أيضًا في المستوى 7)' : ''), 'Level ' + course.level + (course.alsoInLevels ? ' (also shown in level 7)' : '')) : (course.type === 'elective-university' ? T('اختياري متطلب جامعة', 'University elective') : T('اختياري متطلب قسم (بدءًا من المستوى 6)', 'Department elective (from level 6)'));
    const ex = $('#modalExtra');
    if (ex) ex.innerHTML = '<p class="m-note">' + esc(lvl + (course.category ? ' · ' + T('نوع المتطلب: ', 'Requirement type: ') + course.category : '')) + '</p>' +
      (course.note ? '<p class="m-note">ℹ️ ' + esc(course.note) + '</p>' : '') +
      '<p class="m-note">' + esc(T('لا نعرض وصف المقرر هنا؛ التوصيف المختصر للمقررات في ', 'Course descriptions are not shown here; see the course briefs in ')) + '<a class="source-link m-link" href="https://clps.ksu.edu.sa/sites/clps.ksu.edu.sa/files/2024-04/ss.pdf" target="_blank" rel="noopener noreferrer">' + esc(T('دليل البرنامج الرسمي ↗', 'the official program guide ↗')) + '</a></p>';
    $('#courseModal').classList.add('show');
  }

  /* ---------------- التشغيل ---------------- */
  function sync(){
    renderBanner(); renderGate();
    if (MU.effective() === 'ksu') {
      if (!curriculum()) {
        if (!loadingStarted) { loadingStarted = true; MU.load('ksu-curriculum').then(render).catch(() => { loadingStarted = false; if (host) host.innerHTML = '<p class="uni-loading">' + esc(T('تعذر تحميل بيانات الخطة. حاول تحديث الصفحة.', 'Could not load the plan data. Please refresh.')) + '</p>'; }); }
        render();
      } else render();
    }
  }
  let key = '';
  window.addEventListener('medrak:prefs', () => { const k = MU.effective() + '|' + MU.lang() + '|' + MU.female() + '|' + MU.isPreview(); if (k !== key) { key = k; sync(); } });
  window.addEventListener('medrak:imported', sync);
  window.addEventListener('medrak:university-data', sync);
  key = MU.effective() + '|' + MU.lang() + '|' + MU.female() + '|' + MU.isPreview();
  sync();
})();
