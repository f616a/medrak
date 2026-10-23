/* =====================================================================
   مِدراك | stats.js — قياس استخدام مجهول عبر GoatCounter (medrak1999.goatcounter.com)
   • وسم GoatCounter نفسه موجود ظاهرًا في مصدر كل صفحة (مرة واحدة لكل صفحة) ويحسب مشاهدات الصفحات.
   • هذا الملف يضبط إعدادات الوسم قبل تحميله، ويرسل أحداث الاستخدام المخصصة.
   الخصوصية:
   1) لا كوكيز ولا معرّف دائم (أداة GoatCounter لا تضع شيئًا من ذلك).
   2) قائمة سماح صارمة: أسماء الأحداث والقيم محددة سلفًا؛ لا نصوص حرة ولا أسماء ولا سير ولا مقررات ولا درجات.
   3) نحترم «عدم التتبع (DNT)» و«Global Privacy Control»: لا مشاهدة ولا حدث لمن يرسل إحداهما.
   4) المسار المُرسَل بلا معاملات ولا hash، و/index.html يُوحَّد مع «/».
   ===================================================================== */
(function(){
  "use strict";
  if (window.__medrakStats) return;
  window.__medrakStats = true;

  var optOut = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.msDoNotTrack === '1' || navigator.globalPrivacyControl === true;

  /* إعدادات GoatCounter — يجب أن تسبق تحميل count.js (الوسم يأتي بعد هذا الملف مباشرة) */
  window.goatcounter = window.goatcounter || {};
  window.goatcounter.no_onload = optOut;                                   // من يطلب عدم التتبع لا يُحتسب
  window.goatcounter.path = function(p){                                   // مسار نظيف: بلا ?query ولا #hash، و index.html = /
    p = String(p || '/').split('#')[0].split('?')[0];
    return p.replace(/index\.html$/, '') || '/';
  };

  /* ---------------- قائمة السماح ---------------- */
  var QUIZ = ['glossary_quiz', 'track_quiz', 'career_quiz', 'media_literacy', 'daily_question'];
  var LABEL_UNI = { kau: 'جامعة الملك عبدالعزيز', ksu: 'جامعة الملك سعود', none: 'بدون جامعة' };
  var QUIZ_AR = { glossary_quiz: 'اختبار المصطلحات', track_quiz: 'اختبار مجال التركيز', career_quiz: 'اختبار الميول المهنية', media_literacy: 'الوعي المعلوماتي', daily_question: 'سؤال اليوم' };
  var ACT_AR = { open: 'فتح المخطط', add_task: 'إضافة مهمة', complete_task: 'إنجاز مهمة', start_timer: 'بدء المؤقت', print: 'طباعة الجدول' };
  var SIM_AR = { crisis_room: 'غرفة الأزمات', policy_simulator: 'محاكي السياسات', nation_builder: 'ابنِ دولتك', press_conference: 'المؤتمر الصحفي', negotiation_room: 'غرفة المفاوضات' };
  function has(arr, v){ return arr.indexOf(v) >= 0; }
  function uni(){
    var s = window.medrakState && window.medrakState.university;            // اختيار الطالب المحفوظ (وليس معاينة رابط مشاركة)
    return (s === 'kau' || s === 'ksu') ? s : 'none';
  }
  /* يبني {path,title} من حدث مسموح فقط، وإلا null */
  function build(name, p){
    p = p || {}; var u = uni(), L = LABEL_UNI[u];
    switch (name) {
      case 'select_university':
        if (!has(['kau', 'ksu', 'none'], p.university)) return null;
        return { path: 'uni-select/' + p.university, title: 'اختيار جامعة: ' + LABEL_UNI[p.university] };
      case 'open_study_plan':
        if (!has(['plan', 'gate'], p.view)) return null;
        return { path: (p.view === 'gate' ? 'plan-gate/' : 'plan-open/') + u, title: 'فتح الخطة الدراسية — ' + L };
      case 'use_semester_planner':
        if (!ACT_AR[p.action]) return null;
        return { path: 'planner-' + p.action.replace(/_/g, '-') + '/' + u, title: 'المخطط الدراسي: ' + ACT_AR[p.action] + ' — ' + L };
      case 'use_political_simulation':
        if (!SIM_AR[p.simulation]) return null;
        return { path: 'sim-' + p.simulation.replace(/_/g, '-') + '/' + u, title: 'محاكاة: ' + SIM_AR[p.simulation] + ' — ' + L };
      case 'start_cv_builder':
        return { path: 'cv-start/' + u, title: 'بدء إنشاء السيرة الذاتية — ' + L };
      case 'download_cv_pdf':
        if (p.method !== 'print_to_pdf') return null;
        return { path: 'cv-pdf/' + u, title: 'تنزيل السيرة الذاتية PDF — ' + L };
      case 'start_quiz':
      case 'complete_quiz':
        if (!has(QUIZ, p.quiz_id)) return null;
        var st = name === 'start_quiz' ? 'start' : 'complete';
        return { path: 'quiz-' + p.quiz_id.replace(/_/g, '-') + '-' + st + '/' + u, title: (st === 'start' ? 'بدء ' : 'إكمال ') + QUIZ_AR[p.quiz_id] + ' — ' + L };
    }
    return null;
  }

  /* ---------------- الإرسال (ينتظر تحميل count.js بدون حجب الصفحة) ---------------- */
  function send(item, tries){
    var gc = window.goatcounter;
    if (gc && typeof gc.count === 'function') { try { gc.count({ path: item.path, title: item.title, event: true }); } catch (e) {} return; }
    if ((tries || 0) < 60) setTimeout(function(){ send(item, (tries || 0) + 1); }, 250);   // حتى 15 ثانية ثم يُهمل
  }
  var once = {};
  window.medrakTrack = function(name, params, onceKey){
    if (optOut) return false;
    var item = build(name, params); if (!item) return false;
    if (onceKey) { if (once[onceKey]) return false; once[onceKey] = 1; }
    send(item, 0); return true;
  };

  /* ---------------- ربط الأحداث ---------------- */
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function byId(id){ return document.getElementById(id); }
  function on(sel, evt, fn){ document.addEventListener(evt, function(e){ var t = e.target.closest && e.target.closest(sel); if (t) fn(t, e); }, true); }
  var T = window.medrakTrack;

  window.addEventListener('medrak:university-selected', function(e){ var to = e.detail && e.detail.to; T('select_university', { university: to }); });

  if (page === 'study-plan.html') {
    var pv = function(){ var MU = window.MedrakUniversity; var eff = MU ? MU.effective() : 'none'; T('open_study_plan', { view: eff === 'none' ? 'gate' : 'plan' }, 'plan:' + eff); };
    window.addEventListener('load', function(){ setTimeout(pv, 400); });
    window.addEventListener('medrak:prefs', function(){ setTimeout(pv, 100); });
    on('.tab-btn[data-tab="planner"]', 'click', function(){ T('use_semester_planner', { action: 'open' }, 'planner:open'); });
    on('#addTaskBtn', 'click', function(){ var t = byId('taskTitle'); if (t && t.value.trim()) T('use_semester_planner', { action: 'add_task' }); });
    on('.task-done', 'change', function(t){ if (t.checked) T('use_semester_planner', { action: 'complete_task' }); });
    on('#timerStart', 'click', function(){ T('use_semester_planner', { action: 'start_timer' }); });
    on('#printScheduleBtn', 'click', function(){ T('use_semester_planner', { action: 'print' }); });
  }
  if (page === 'decision-lab.html') on('#crisisStartBtn', 'click', function(){ T('use_political_simulation', { simulation: 'crisis_room' }, 'sim:crisis'); });
  if (page === 'communication.html') {
    on('#pcStartBtn', 'click', function(){ T('use_political_simulation', { simulation: 'press_conference' }); });
    on('#negStartBtn', 'click', function(){ T('use_political_simulation', { simulation: 'negotiation_room' }); });
  }
  if (page === 'career.html') {
    var cvStarted = false;
    document.addEventListener('input', function(e){ var id = e.target && e.target.id; if (!cvStarted && id && /^cv_/.test(id)) { cvStarted = true; T('start_cv_builder', {}); } }, true);
    on('#cvPrintBtn', 'click', function(){ T('download_cv_pdf', { method: 'print_to_pdf' }); });
  }
  /* بداية/إكمال الاختبارات ومحاكيي السياسات وابنِ دولتك تُستدعى من كود صفحاتها عبر medrakTrack */
})();
