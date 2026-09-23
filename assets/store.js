/* =====================================================================
   مِدراك | store.js — نظام حفظ محلي موحّد (localStorage فقط، بدون أي خادم)
   كل ميزة تحفظ تقدمها تحت مفتاح خاص بها داخل مساحة تخزين واحدة منظمة،
   ويقدر المستخدم يصدّر/يستورد كل بياناته كملف JSON واحد، أو يمسحها بالكامل.
   لا يوجد أي اتصال بالإنترنت أو إرسال بيانات لأي جهة — كل شي يبقى بجهاز المستخدم.
   ===================================================================== */
window.MedrakStore = (function(){
  "use strict";
  const ROOT_KEY = 'medrak_profile_v1';

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

  return {
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
    /** يصدّر كل شي كملف JSON قابل للتنزيل */
    exportJSON(){
      const data = readAll();
      data._exportedAt = new Date().toISOString();
      data._app = 'مِدراك | Medrak';
      const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'medrak-profile-' + new Date().toISOString().slice(0,10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    },
    /** يستورد ملف JSON صدّره المستخدم سابقًا (يدمج، ما يمسح شي غير موجود بالملف) */
    importJSON(fileObj, onDone, onError){
      const reader = new FileReader();
      reader.onload = function(e){
        try {
          const incoming = JSON.parse(e.target.result);
          delete incoming._exportedAt; delete incoming._app;
          const current = readAll();
          const merged = Object.assign({}, current, incoming);
          writeAll(merged);
          if (onDone) onDone(merged);
        } catch(err){ if (onError) onError(err); }
      };
      reader.onerror = function(err){ if (onError) onError(err); };
      reader.readAsText(fileObj);
    },
    /** يمسح كل البيانات المحفوظة بعد تأكيد المستخدم (يُطلب التأكيد من واجهة المستخدم قبل الاستدعاء) */
    clearAll(){ try { localStorage.removeItem(ROOT_KEY); return true; } catch(e){ return false; } },
  };
})();
