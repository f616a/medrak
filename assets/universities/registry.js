/* =====================================================================
   مِدراك | universities/registry.js — سجلّ الجامعات
   بنية قابلة للتوسع: لإضافة جامعة جديدة (مثلًا ksu → jazan):
     1) أضف بياناتها الأساسية في META أدناه (معرّف + أسماء + مدينة + كلية).
     2) أنشئ ملف assets/universities/<id>.js يستدعي MedrakUniversity.register('<id>', { info, sources, ... }).
     3) (اختياري) أنشئ <id>-curriculum.js للخطة وحمّله عند الطلب عبر MedrakUniversity.load().
   اختيار الطالب محفوظ بتفضيل medrak_university (kau | ksu | none) ضمن نظام التفضيلات العام.
   ===================================================================== */
(function(){
  "use strict";
  const META = {
    kau: { id: 'kau', code: 'KAU', nameAr: 'جامعة الملك عبدالعزيز', nameEn: 'King Abdulaziz University', cityAr: 'جدة', cityEn: 'Jeddah',
           collegeAr: 'كلية الاقتصاد والإدارة', collegeEn: 'Faculty of Economics & Administration',
           programAr: 'بكالوريوس العلوم السياسية', programEn: 'B.A. in Political Science' },
    ksu: { id: 'ksu', code: 'KSU', nameAr: 'جامعة الملك سعود', nameEn: 'King Saud University', cityAr: 'الرياض', cityEn: 'Riyadh',
           collegeAr: 'كلية الحقوق والعلوم السياسية', collegeEn: 'College of Law & Political Science',
           programAr: 'بكالوريوس العلوم السياسية', programEn: 'B.A. in Political Science' },
  };
  const IDS = ['kau', 'ksu'];
  const DATA = {};            // id → بيانات مسجّلة من ملفات الجامعات
  const LOADING = {};

  function lang(){ return (window.medrakState && window.medrakState.lang) || 'ar'; }
  function isEn(){ return lang() === 'en'; }
  function female(){ return !!(window.medrakState && window.medrakState.isFemale); }

  const API = {
    ids: IDS,
    meta(id){ return META[id] || null; },
    name(id){ const m = META[id]; return m ? (isEn() ? m.nameEn : m.nameAr) : ''; },
    city(id){ const m = META[id]; return m ? (isEn() ? m.cityEn : m.cityAr) : ''; },
    college(id){ const m = META[id]; return m ? (isEn() ? m.collegeEn : m.collegeAr) : ''; },
    program(id){ const m = META[id]; return m ? (isEn() ? m.programEn : m.programAr) : ''; },
    /** «طالب علوم سياسية — جامعة الملك سعود» بحسب الصيغة */
    studentLine(id){
      if (!META[id]) return isEn() ? 'Political Science student' : (female() ? 'طالبة علوم سياسية' : 'طالب علوم سياسية');
      return (isEn() ? 'Political Science student' : (female() ? 'طالبة علوم سياسية' : 'طالب علوم سياسية')) + ' — ' + API.name(id);
    },

    /** تسجّل ملفات الجامعات نفسها هنا */
    register(id, data){ DATA[id] = Object.assign(DATA[id] || {}, data); window.dispatchEvent(new CustomEvent('medrak:university-data', { detail: { id: id } })); },
    data(id){ return DATA[id] || null; },
    /** تحميل ملف إضافي عند الحاجة فقط (مثل ksu-curriculum.js) دون تثقيل الصفحات الأخرى */
    load(file){
      if (LOADING[file]) return LOADING[file];
      LOADING[file] = new Promise(function(resolve, reject){
        const s = document.createElement('script');
        s.src = 'assets/universities/' + file + '.js'; s.async = true;
        s.onload = function(){ resolve(true); };
        s.onerror = function(){ delete LOADING[file]; reject(new Error('load-failed:' + file)); };
        document.head.appendChild(s);
      });
      return LOADING[file];
    },

    /** الجامعة المحفوظة لدى الطالب: kau | ksu | none | null (لم يختر بعد) */
    saved(){ return (window.medrakState && window.medrakState.university) || null; },
    /** الجامعة المعروضة الآن: تأخذ بالحسبان معاينة رابط المشاركة */
    effective(){ return window.medrakEffectiveUniversity ? window.medrakEffectiveUniversity() : (API.saved() === 'kau' || API.saved() === 'ksu' ? API.saved() : 'none'); },
    isPreview(){ return window.medrakIsUniPreview ? window.medrakIsUniPreview() : false; },
    hasChosen(){ const s = API.saved(); return s === 'kau' || s === 'ksu'; },
    /** يغيّر الجامعة المحفوظة (يحفظ فورًا ما لم يُطلب غير ذلك) */
    set(id, persist){
      if (!window.medrakPrefs) return;
      if (id === 'kau' || id === 'ksu' || id === 'none') window.medrakPrefs.apply({ university: id }, persist !== false);
    },
    /** رابط مشاركة لفتح محتوى جامعة معيّنة (معاينة فقط، لا يغيّر اختيار من يفتحه بشكل دائم) */
    shareUrl(id, page){
      const u = new URL(page || (location.pathname.split('/').pop() || 'index.html'), location.href);
      u.search = ''; u.hash = ''; u.searchParams.set('uni', id || API.effective());
      return u.href;
    },
    /** تاريخ ISO (YYYY-MM-DD) بصيغة مقروءة */
    fmtDate(iso){
      if (!iso) return '';
      try { return new Intl.DateTimeFormat(isEn() ? 'en-GB' : 'ar-u-nu-latn', { day: 'numeric', month: 'long', year: 'numeric', calendar: 'gregory' }).format(new Date(iso + 'T12:00:00')); }
      catch(e){ return iso; }
    },
    /** يضبط نصًا ثنائي اللغة على عنصر ويُبقي سمات data-ar/data-en محدّثة (يفهمها محرك الترجمة) */
    setText(el, ar, en){ if (!el) return; el.setAttribute('data-ar', ar); el.setAttribute('data-en', en); el.textContent = isEn() ? en : ar; },
    lang: lang, isEn: isEn, female: female,
  };
  window.MedrakUniversity = API;
})();
