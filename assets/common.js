/* مِدراك | common.js — يشترك بين كل صفحات الموقع:
   الوضع الداكن، طلاب/طالبات، عربي/إنجليزي، العودة للأعلى، مساعد الأكورديون، إغلاق النوافذ المنبثقة بالضغط خارجها. */
(function(){
  const root = document.getElementById('medrak-root');
  if (!root) return;

  /* ===== الوضع الداكن ===== */
  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', function(){
      root.classList.toggle('dark');
      this.textContent = root.classList.contains('dark') ? '☀️' : '🌙';
    });
  }

  /* ===== طلاب/طالبات + عربي/إنجليزي ===== */
  const genderMale = document.getElementById('genderMale');
  const genderFemale = document.getElementById('genderFemale');
  const langToggleBtn = document.getElementById('langToggle');
  const genderTextEls = document.querySelectorAll('[data-m][data-f]');
  const langOnlyEls = document.querySelectorAll('[data-ar][data-en]:not([data-m])');
  window.medrakState = { isFemale: false, lang: 'ar' };

  function applyAllText(){
    langOnlyEls.forEach(el => { el.textContent = window.medrakState.lang === 'en' ? el.dataset.en : el.dataset.ar; });
    genderTextEls.forEach(el => {
      if (window.medrakState.lang === 'en' && el.dataset.en) { el.textContent = el.dataset.en; }
      else { el.textContent = window.medrakState.isFemale ? el.dataset.f : el.dataset.m; }
    });
  }
  window.medrakApplyText = applyAllText;

  if (genderMale && genderFemale) {
    function setGender(isFemale){
      window.medrakState.isFemale = isFemale;
      root.classList.toggle('fem', isFemale);
      genderMale.classList.toggle('active', !isFemale);
      genderFemale.classList.toggle('active', isFemale);
      genderMale.setAttribute('aria-pressed', String(!isFemale));
      genderFemale.setAttribute('aria-pressed', String(isFemale));
      applyAllText();
      if (typeof window.onGenderChange === 'function') window.onGenderChange(isFemale);
    }
    window.medrakSetGender = setGender;
    genderMale.addEventListener('click', function(){ setGender(false); });
    genderFemale.addEventListener('click', function(){ setGender(true); });
  }

  if (langToggleBtn) {
    function setLanguage(lang){
      window.medrakState.lang = lang;
      langToggleBtn.textContent = lang === 'en' ? 'AR' : 'EN';
      applyAllText();
    }
    window.medrakSetLanguage = setLanguage;
    langToggleBtn.addEventListener('click', function(){ setLanguage(window.medrakState.lang === 'en' ? 'ar' : 'en'); });
  }

  /* ===== قائمة الجوال (Hamburger) ===== */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelector('#medrak-root nav.links');
  if (menuToggle && navLinks) {
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
  }

  /* ===== العودة للأعلى ===== */
  const backTop = document.getElementById('backTop');
  if (backTop) {
    window.addEventListener('scroll', function(){ backTop.classList.toggle('show', window.scrollY > 500); });
    backTop.addEventListener('click', function(){ window.scrollTo({top:0, behavior:'smooth'}); });
  }

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
  medrakWireAccordion(document);

  /* ===== إغلاق أي نافذة منبثقة بالضغط خارجها ===== */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e){ if (e.target === this) this.classList.remove('show'); });
  });

  /* تبويبات الـ Tabs العامة (تستخدم في صفحة القسم والمقالات) */
  window.medrakWireTabs = function(container){
    container.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.wired) return;
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
  medrakWireTabs(document);

})();
