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

  /* ===== التفضيلات (الألوان، الوضع، التصميم، اللغة، الصيغة...) تُصدَّر وتُستورد مع التقدم ===== */
  const PREF_KEYS = ['medrak_theme','medrak_lang','medrak_gender','medrak_palette','medrak_layout','medrak_spotlight','medrak_muted'];
  const PREF_OK = {
    medrak_theme: v => v === 'light' || v === 'dark',
    medrak_lang: v => v === 'ar' || v === 'en',
    medrak_gender: v => typeof v === 'boolean',
    medrak_palette: v => ['classic','rose','emerald','ocean','lavender','sand'].indexOf(v) >= 0,
    medrak_layout: v => ['sidebar','compact','wide','sequential'].indexOf(v) >= 0,
    medrak_spotlight: v => typeof v === 'boolean',
    medrak_muted: v => typeof v === 'boolean',
  };
  function readPrefs(){
    const out = {};
    PREF_KEYS.forEach(k => { try { const raw = localStorage.getItem(k); if (raw !== null) out[k] = JSON.parse(raw); } catch(e){} });
    return out;
  }
  function writePrefs(obj){
    if (!obj || typeof obj !== 'object') return;
    PREF_KEYS.forEach(k => {
      if (Object.prototype.hasOwnProperty.call(obj, k) && PREF_OK[k](obj[k])) {
        try { localStorage.setItem(k, JSON.stringify(obj[k])); } catch(e){}
      }
    });
  }
  function cleanKeys(o){
    ['__proto__','constructor','prototype'].forEach(k => { try { delete o[k]; } catch(e){} });
    return o;
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
    /** يستورد ملف JSON صدّره المستخدم سابقًا (يدمج، ما يمسح شي غير موجود بالملف) */
    importJSON(fileObj, onDone, onError){
      const reader = new FileReader();
      reader.onload = function(e){
        try {
          const incoming = JSON.parse(e.target.result);
          if (typeof incoming !== 'object' || incoming === null || Array.isArray(incoming)) throw new Error('bad-format');
          cleanKeys(incoming);
          const photoBase64 = (typeof incoming._photo === 'string' && incoming._photo.indexOf('data:image/') === 0) ? incoming._photo : null;
          const prefs = incoming._prefs;
          delete incoming._exportedAt; delete incoming._app; delete incoming._photo; delete incoming._prefs;
          const current = readAll();
          const merged = Object.assign({}, current, incoming);
          writeAll(merged);
          writePrefs(prefs);
          const finish = () => {
            try { if (window.medrakPrefs) window.medrakPrefs.reload(); } catch(e){}
            try { window.dispatchEvent(new Event('medrak:imported')); } catch(e){}
            if (onDone) onDone(merged);
          };
          if (photoBase64) { base64ToBlob(photoBase64).then(blob => { if (blob) savePhotoBlob(blob); finish(); }); }
          else finish();
        } catch(err){ if (onError) onError(err); }
      };
      reader.onerror = function(err){ if (onError) onError(err); };
      reader.readAsText(fileObj);
    },
    /** يمسح كل البيانات المحفوظة بعد تأكيد المستخدم (يُطلب التأكيد من واجهة المستخدم قبل الاستدعاء) */
    clearAll(){ try { localStorage.removeItem(ROOT_KEY); return true; } catch(e){ return false; } },
  };
})();
