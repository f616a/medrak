/* =====================================================================
   مِدراك | store.js — نظام حفظ محلي موحّد (localStorage فقط، بدون أي خادم)
   كل ميزة تحفظ تقدمها تحت مفتاح خاص بها داخل مساحة تخزين واحدة منظمة،
   ويقدر المستخدم يصدّر/يستورد كل بياناته كملف JSON واحد، أو يمسحها بالكامل.
   لا يوجد أي اتصال بالإنترنت أو إرسال بيانات لأي جهة — كل شي يبقى بجهاز المستخدم.
   ===================================================================== */
window.MedrakStore = (function(){
  "use strict";
  const ROOT_KEY = 'medrak_profile_v1';
  const DB_NAME = 'medrakDB', DB_STORE = 'photos', PHOTO_KEY = 'profilePhoto';

  function readAll(){
    try {
      const raw = localStorage.getItem(ROOT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch(e){ console.error('MedrakStore: read failed', e); return {}; }
  }
  function writeAll(obj){
    try { localStorage.setItem(ROOT_KEY, JSON.stringify(obj)); return true; }
    catch(e){ console.error('MedrakStore: write failed', e); return false; }
  }

  /* ===== IndexedDB بسيط، لحفظ صورة الملف الشخصي فقط (localStorage غير مناسب لحجم الصور) ===== */
  function openDB(){
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject('no-indexeddb'); return; }
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(DB_STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function savePhotoBlob(blob){
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(blob, PHOTO_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    })).catch(() => false);
  }
  function getPhotoBlob(){
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(PHOTO_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    })).catch(() => null);
  }
  function deletePhotoBlob(){
    return openDB().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(PHOTO_KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    })).catch(() => false);
  }
  function blobToBase64(blob){
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  }
  function base64ToBlob(base64){
    return fetch(base64).then(r => r.blob()).catch(() => null);
  }


  /* =====================================================================
     مخطط البيانات (الإصدار 2): الخطة والمهام الأكاديمية صارت مستقلة لكل جامعة
       root.academic = { kau: { studyPlanProgress, semesterTasks }, ksu: { ... } }
     الإصدار 1 (بدون academic) كان خاصًا بجامعة الملك عبدالعزيز، فيُرحَّل إليها تلقائيًا.
     الترحيل: يُنفَّذ مرة واحدة، يحفظ نسخة احتياطية أولًا، ولا يحذف المفاتيح القديمة (تبقى كمرآة
     لجامعة الملك عبدالعزيز) فلو فتح الطالب نسخة قديمة مخزّنة بالمتصفح ما يضيع شي.
     ===================================================================== */
  const SCHEMA = 2;
  const UNI_IDS = ['kau', 'ksu'];
  const LEGACY_TOOL_KEYS = ['crisisLab','policySim','nationBuilder','mediaLiteracy','careerQuiz','pressConference','negotiationRoom','diplomaticLanguage','researchMethodsPlan','interviewAnswers'];
  const BACKUP_KEY = 'medrak_backup_v1';
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function isPlain(o){ return o !== null && typeof o === 'object' && !Array.isArray(o); }

  function hasUserData(root){
    if (!isPlain(root)) return false;
    if (root.profile && root.profile.nickname) return true;
    /* مفاتيح تُسجَّل تلقائيًا بمجرد فتح الموقع ليست «بيانات مستخدم» (لا تستدعي تأكيدًا عند الاستيراد) */
    const AUTO = ['schemaVersion', 'academic', 'activityDays', 'lastVisited', 'lastAchievement'];
    if (Object.keys(root).some(k => AUTO.indexOf(k) < 0 && root[k] !== null && root[k] !== undefined && !(Array.isArray(root[k]) && !root[k].length))) return true;
    const a = root.academic;
    return isPlain(a) && Object.keys(a).some(u => isPlain(a[u]) && Object.keys(a[u]).length > 0);
  }

  function migrate(){
    try {
      const root = readAll();
      if ((root.schemaVersion || 1) >= SCHEMA) return false;
      const legacyUser = !!(root.profile && root.profile.nickname) || !!root.studyPlanProgress || !!root.semesterTasks || LEGACY_TOOL_KEYS.some(k => root[k]);
      if (legacyUser) { try { if (localStorage.getItem(BACKUP_KEY) === null) localStorage.setItem(BACKUP_KEY, JSON.stringify({ at: new Date().toISOString(), schema: 1, root: root })); } catch(e){} }
      root.academic = isPlain(root.academic) ? root.academic : {};
      root.academic.kau = isPlain(root.academic.kau) ? root.academic.kau : {};
      if (root.studyPlanProgress && root.academic.kau.studyPlanProgress === undefined) root.academic.kau.studyPlanProgress = clone(root.studyPlanProgress);
      if (root.semesterTasks && root.academic.kau.semesterTasks === undefined) root.academic.kau.semesterTasks = clone(root.semesterTasks);
      root.schemaVersion = SCHEMA;
      if (!writeAll(root)) return false;
      if (legacyUser && localStorage.getItem('medrak_university') === null) localStorage.setItem('medrak_university', JSON.stringify('kau'));
      return true;
    } catch(e){ console.error('MedrakStore: migrate failed', e); return false; }
  }
  migrate();

  function acadGet(uni, key, fallback){
    const a = readAll().academic, u = a && a[uni];
    if (u && u[key] !== undefined) return u[key];
    if (uni === 'kau') { const legacy = readAll()[key]; if (legacy !== undefined && legacy !== null) return legacy; }   /* احتياط لصفحة قديمة مخزنة بالمتصفح */
    return fallback !== undefined ? fallback : null;
  }
  function acadSet(uni, key, value){
    if (UNI_IDS.indexOf(uni) < 0) return false;
    const root = readAll();
    root.academic = isPlain(root.academic) ? root.academic : {};
    root.academic[uni] = isPlain(root.academic[uni]) ? root.academic[uni] : {};
    root.academic[uni][key] = value;
    if (uni === 'kau' && (key === 'studyPlanProgress' || key === 'semesterTasks')) root[key] = clone(value);   /* مرآة للإصدار القديم */
    root.schemaVersion = SCHEMA;
    return writeAll(root);
  }

  /* ===== التفضيلات (الألوان، الوضع، التصميم، اللغة، الصيغة، الجامعة...) تُصدَّر وتُستورد مع التقدم ===== */
  const PREF_KEYS = ['medrak_theme','medrak_lang','medrak_gender','medrak_palette','medrak_layout','medrak_spotlight','medrak_muted','medrak_university'];
  const PREF_OK = {
    medrak_theme: v => v === 'light' || v === 'dark',
    medrak_lang: v => v === 'ar' || v === 'en',
    medrak_gender: v => typeof v === 'boolean',
    medrak_palette: v => ['classic','rose','emerald','ocean','lavender','sand'].indexOf(v) >= 0,
    medrak_layout: v => ['sidebar','compact','wide','sequential'].indexOf(v) >= 0,
    medrak_spotlight: v => typeof v === 'boolean',
    medrak_muted: v => typeof v === 'boolean',
    medrak_university: v => v === 'kau' || v === 'ksu' || v === 'none',
  };
  function readPrefs(){
    const out = {};
    PREF_KEYS.forEach(k => { try { const raw = localStorage.getItem(k); if (raw !== null) out[k] = JSON.parse(raw); } catch(e){} });
    return out;
  }
  /** يكتب التفضيلات المستوردة. الجامعة الحالية لا تتغير تلقائيًا إذا كان الطالب اختارها مسبقًا. */
  function writePrefs(obj){
    const info = { universityApplied: null, universityKept: null, universityIgnored: null };
    if (!isPlain(obj)) return info;
    PREF_KEYS.forEach(k => {
      if (!Object.prototype.hasOwnProperty.call(obj, k) || !PREF_OK[k](obj[k])) return;
      if (k === 'medrak_university') {
        let cur = null; try { cur = JSON.parse(localStorage.getItem(k)); } catch(e){}
        if (cur === 'kau' || cur === 'ksu') { if (obj[k] !== cur) { info.universityKept = cur; info.universityIgnored = obj[k]; } return; }
        info.universityApplied = obj[k];
      }
      try { localStorage.setItem(k, JSON.stringify(obj[k])); } catch(e){}
    });
    return info;
  }
  function cleanKeys(o){
    ['__proto__','constructor','prototype'].forEach(k => { try { delete o[k]; } catch(e){} });
    return o;
  }

  /* ===== دمج البيانات الأكاديمية عند الاستيراد: بدون تكرار وبدون فقدان ===== */
  const STATE_OK = ['done', 'current', 'planned'];
  function uniqStrings(arr){ const seen = {}; return arr.filter(x => typeof x === 'string' && x.length < 80 && !seen[x] && (seen[x] = 1)); }
  function mergeProgress(a, b){
    a = isPlain(a) ? a : {}; b = isPlain(b) ? b : {};
    const out = Object.assign({}, a, b);
    if (Array.isArray(a.completedCodes) || Array.isArray(b.completedCodes)) out.completedCodes = uniqStrings([].concat(a.completedCodes || [], b.completedCodes || []));
    if (isPlain(a.states) || isPlain(b.states)) {
      const st = Object.assign({}, isPlain(a.states) ? a.states : {}, isPlain(b.states) ? b.states : {});
      Object.keys(st).forEach(k => { if (STATE_OK.indexOf(st[k]) < 0 || k.length > 80) delete st[k]; });
      out.states = st;
    }
    return out;
  }
  function mergeTasks(a, b){
    const map = {}; [].concat(Array.isArray(a) ? a : [], Array.isArray(b) ? b : []).forEach(t => { if (isPlain(t) && t.id !== undefined) map[String(t.id)] = t; });
    return Object.keys(map).map(k => map[k]);
  }
  function mergeAcademic(cur, inc){
    const out = isPlain(cur) ? clone(cur) : {};
    UNI_IDS.forEach(u => {
      if (!isPlain(inc[u])) return;
      out[u] = isPlain(out[u]) ? out[u] : {};
      Object.keys(inc[u]).forEach(key => {
        if (key === 'studyPlanProgress') out[u][key] = mergeProgress(out[u][key], inc[u][key]);
        else if (key === 'semesterTasks') out[u][key] = mergeTasks(out[u][key], inc[u][key]);
        else out[u][key] = inc[u][key];
      });
    });
    return out;
  }

  return {
    /** هل فيه حساب (اسم مستعار محفوظ) على هذا الجهاز؟ */
    hasAccount(){ const p = readAll().profile; return !!(p && p.nickname); },
    /** يقرأ بيانات ميزة معيّنة (مثال: 'crisisLab', 'policySimulator', 'nickname') */
    get(key, fallback){
      const all = readAll();
      return (key in all) ? all[key] : (fallback !== undefined ? fallback : null);
    },
    /** يحفظ بيانات ميزة معيّنة */
    set(key, value){
      const all = readAll();
      all[key] = value;
      return writeAll(all);
    },
    /** بيانات أكاديمية خاصة بجامعة معيّنة (kau | ksu): الخطة المنجزة، مهام الفصل... */
    acadGet(uni, key, fallback){ return acadGet(uni, key, fallback); },
    acadSet(uni, key, value){ return acadSet(uni, key, value); },
    schemaVersion: SCHEMA,
    migrate(){ return migrate(); },
    hasUserData(){ return hasUserData(readAll()); },
    /** يرجع كل البيانات المحفوظة (لصفحة "ملفي في مِدراك") */
    getAll(){ return readAll(); },

    /** واجهة الصورة الشخصية (IndexedDB) */
    savePhoto(blob){ return savePhotoBlob(blob); },
    getPhoto(){ return getPhotoBlob(); },
    deletePhoto(){ return deletePhotoBlob(); },

    /** يصدّر كل شي كملف JSON — includePhoto اختياري لأن الصورة تكبّر حجم الملف، onDone اختياري */
    exportJSON(includePhoto, onDone){
      const data = readAll();
      data._exportedAt = new Date().toISOString();
      data._app = 'مِدراك | Medrak';
      data._schema = SCHEMA;
      data._prefs = readPrefs();
      const finish = (photoBase64) => {
        if (photoBase64) data._photo = photoBase64;
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'medrak-profile-' + new Date().toISOString().slice(0,10) + '.json';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
        if (onDone) onDone();
      };
      if (includePhoto) { getPhotoBlob().then(blob => blob ? blobToBase64(blob).then(finish) : finish(null)); }
      else finish(null);
    },
    /**
     * يستورد ملف JSON صدّره المستخدم سابقًا.
     *  • يتحقق من سلامة الملف ولا ينفّذ أي كود (JSON فقط).
     *  • يدعم الملفات القديمة (بدون حقل الجامعة): تُعتبر بيانات جامعة الملك عبدالعزيز.
     *  • يدمج بدون تكرار (المقررات المنجزة اتحاد، المهام حسب المعرّف) ويطلب تأكيدًا قبل الكتابة فوق بيانات موجودة.
     *  • لا يغيّر جامعة الطالب الحالية تلقائيًا (يُبلَّغ بذلك عبر وسيط onDone الثاني).
     * onError(err): err.message === 'cancelled' عند إلغاء المستخدم.
     */
    importJSON(fileObj, onDone, onError, opts){
      opts = opts || {};
      const reader = new FileReader();
      reader.onload = function(e){
        let incoming;
        try {
          incoming = JSON.parse(e.target.result);
          if (!isPlain(incoming)) throw new Error('bad-format');
          cleanKeys(incoming);
        } catch(err){ if (onError) onError(err); return; }
        const legacyAcademic = !isPlain(incoming.academic) && (incoming.studyPlanProgress || incoming.semesterTasks);
        const summary = {
          schema: incoming._schema || 1,
          name: incoming.profile && typeof incoming.profile.nickname === 'string' ? incoming.profile.nickname : null,
          universities: (isPlain(incoming.academic) ? Object.keys(incoming.academic).filter(u => UNI_IDS.indexOf(u) >= 0) : []).concat(legacyAcademic ? ['kau'] : []),
          legacy: !incoming._schema,
        };
        const proceed = function(){
          try {
            const photoBase64 = (typeof incoming._photo === 'string' && incoming._photo.indexOf('data:image/') === 0) ? incoming._photo : null;
            const prefs = incoming._prefs;
            let incAcad = isPlain(incoming.academic) ? incoming.academic : {};
            if (legacyAcademic) {
              const k = {}; if (incoming.studyPlanProgress) k.studyPlanProgress = incoming.studyPlanProgress; if (incoming.semesterTasks) k.semesterTasks = incoming.semesterTasks;
              incAcad = { kau: k };
            }
            ['_exportedAt','_app','_photo','_prefs','_schema','academic','schemaVersion','studyPlanProgress','semesterTasks'].forEach(k => delete incoming[k]);
            const current = readAll();
            const merged = Object.assign({}, current, incoming);
            merged.academic = mergeAcademic(current.academic, incAcad);
            const kauA = merged.academic.kau;
            if (kauA && kauA.studyPlanProgress) merged.studyPlanProgress = clone(kauA.studyPlanProgress);
            if (kauA && kauA.semesterTasks) merged.semesterTasks = clone(kauA.semesterTasks);
            merged.schemaVersion = SCHEMA;
            if (!writeAll(merged)) throw new Error('write-failed');
            const prefInfo = writePrefs(prefs);
            const finish = () => {
              try { if (window.medrakPrefs) window.medrakPrefs.reload(); } catch(e){}
              try { window.dispatchEvent(new Event('medrak:imported')); } catch(e){}
              if (onDone) onDone(merged, Object.assign({ universities: summary.universities, legacy: summary.legacy }, prefInfo));
            };
            if (photoBase64) { base64ToBlob(photoBase64).then(blob => { if (blob) savePhotoBlob(blob); finish(); }); }
            else finish();
          } catch(err){ if (onError) onError(err); }
        };
        if (hasUserData(readAll())) {
          const ask = opts.confirm || window.medrakConfirm;
          if (typeof ask === 'function') { Promise.resolve(ask(summary)).then(ok => { if (ok) proceed(); else if (onError) onError(new Error('cancelled')); }); return; }
        }
        proceed();
      };
      reader.onerror = function(err){ if (onError) onError(err); };
      reader.readAsText(fileObj);
    },
    /** يمسح كل البيانات المحفوظة بعد تأكيد المستخدم (يُطلب التأكيد من واجهة المستخدم قبل الاستدعاء) */
    clearAll(){
      try { localStorage.removeItem(ROOT_KEY); localStorage.removeItem(BACKUP_KEY); localStorage.removeItem('medrak_university'); } catch(e){ return false; }
      try { if (window.medrakPrefs) window.medrakPrefs.reload(); } catch(e){}
      return true;
    },
  };
})();
