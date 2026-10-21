/* =====================================================================
   مِدراك | universities/ksu.js — جامعة الملك سعود
   المصادر: مواقع جامعة الملك سعود الرسمية فقط (انظر sources). فُحصت الصفحات بتاريخ lastVerifiedDate.
   ملاحظة مهمة: صفحة الخطة بعمادة القبول والتسجيل (آخر تحديث 22 أبريل 2026، وعنوانها «اقتراح خطط 1») وبين دليل البرنامج
   PDF (إصدار 2024-04) فروقات موثقة في conflicts أدناه — لذلك curriculumStatus = 'unconfirmed' ويمنع حساب التخرج النهائي.
   ===================================================================== */
MedrakUniversity.register('ksu', {
  info: {
    universityId: 'ksu', universityNameAr: 'جامعة الملك سعود', universityNameEn: 'King Saud University', abbreviation: 'KSU',
    city: 'الرياض', college: 'كلية الحقوق والعلوم السياسية', department: 'قسم العلوم السياسية', programName: 'بكالوريوس العلوم السياسية',
    degree: 'البكالوريوس', language: 'العربية', durationYears: 4, totalCredits: 130,
    curriculumVersion: 'dar-plans-2026-04', curriculumStatus: 'unconfirmed', lastVerifiedDate: '2026-10-21',
    introAr: 'يقدم قسم العلوم السياسية بجامعة الملك سعود برنامج بكالوريوس العلوم السياسية ضمن كلية الحقوق والعلوم السياسية. يهدف البرنامج إلى تنمية المعرفة بالأنظمة والظواهر السياسية، وتعزيز مهارات التحليل والبحث والتفكير النقدي، وإعداد كوادر قادرة على فهم القضايا السياسية محليًا وإقليميًا ودوليًا.',
    introEn: 'The Political Science Department at King Saud University offers a Bachelor of Political Science within the College of Law and Political Science. The program aims to build knowledge of political systems and phenomena, strengthen analysis, research and critical-thinking skills, and prepare graduates able to understand political issues locally, regionally and globally.',
    historyAr: 'تأسست الكلية بتشكيلها المستقل عام 1427هـ بقرار مجلس التعليم العالي بتقسيم كلية العلوم الإدارية إلى كليتين، ثم صدرت الموافقة السامية عام 1431هـ على تعديل مسماها إلى «كلية الحقوق والعلوم السياسية» وإعادة هيكلة أقسامها إلى قسمي القانون العام والقانون الخاص وقسم العلوم السياسية. وبحسب الكلية، يعود تأسيس قسم العلوم السياسية لأكثر من أربعين عامًا، فهو أقدم من مسمى الكلية الحالي. (لا نذكر سنة محددة لتأسيس القسم لأن المصدر لم يحددها.)',
    historyEn: 'The college was established in its independent form in 1427 AH by a Higher Education Council decision splitting the College of Administrative Sciences in two; royal approval in 1431 AH then renamed it the College of Law and Political Science and restructured it into the Public Law, Private Law and Political Science departments. According to the college, the Political Science department dates back more than forty years — older than the college’s current name. (We give no exact founding year for the department because the source does not state one.)',
    goalsAr: ['تطوير فهم الطالب للظواهر والقضايا السياسية.', 'تنمية مهارات التفكير النقدي والتحليل.', 'تعزيز البحث العلمي في مجال العلوم السياسية.', 'تأهيل الخريجين للعمل في المجالات ذات الصلة.', 'تنمية القدرة على فهم العلاقات السياسية المحلية والإقليمية والدولية.'],
    goalsEn: ['Develop students’ understanding of political phenomena and issues.', 'Build critical-thinking and analytical skills.', 'Strengthen scientific research in political science.', 'Qualify graduates to work in related fields.', 'Build the ability to understand local, regional and international political relations.'],
    careersAr: ['التحليل السياسي', 'البحث والدراسات', 'السياسات العامة', 'العلاقات الدولية', 'المؤسسات الحكومية', 'المنظمات الدولية والإقليمية', 'المراكز البحثية', 'الإعلام والتحليل', 'القطاعات الخاصة وغير الربحية ذات الصلة'],
    careersEn: ['Political analysis', 'Research and studies', 'Public policy', 'International relations', 'Government institutions', 'International and regional organizations', 'Research centers', 'Media and commentary', 'Related private and non-profit sectors'],
  },
  /* القبول والتحويل: عرض عام فقط. لا نعرض أي معدل أو نسبة أو شرط جنس أو متطلب اختبار لأنها تتغير سنويًا وتُعلن من الجامعة. */
  admission: {
    links: [
      { titleAr: 'عمادة شؤون القبول والتسجيل', titleEn: 'Deanship of Admission & Registration', url: 'https://dar.ksu.edu.sa' },
      { titleAr: 'التحويل للجامعة (صفحة العمادة)', titleEn: 'Transfer to the university (Deanship page)', url: 'https://dar.ksu.edu.sa/ar/Transfer' },
      { titleAr: 'قسم العلوم السياسية', titleEn: 'Political Science Department', url: 'https://clps.ksu.edu.sa/ar/node/2901' },
      { titleAr: 'بوابة النظام الأكاديمي (edugate)', titleEn: 'Academic system portal (edugate)', url: 'https://edugate.ksu.edu.sa' },
    ],
  },
  sources: [
    { id: 'ksu-main', titleAr: 'جامعة الملك سعود', titleEn: 'King Saud University', type: 'page', url: 'https://www.ksu.edu.sa', verified: '2026-10-21' },
    { id: 'ksu-clps', titleAr: 'كلية الحقوق والعلوم السياسية', titleEn: 'College of Law & Political Science', type: 'page', url: 'https://clps.ksu.edu.sa/ar', verified: '2026-10-21' },
    { id: 'ksu-dept', titleAr: 'قسم العلوم السياسية', titleEn: 'Political Science Department', type: 'page', url: 'https://clps.ksu.edu.sa/ar/node/2901', verified: '2026-10-21' },
    { id: 'ksu-plan', titleAr: 'الخطة الدراسية لبرنامج العلوم السياسية — عمادة شؤون القبول والتسجيل', titleEn: 'Political Science study plan — Deanship of Admission & Registration', type: 'page', url: 'https://dar.ksu.edu.sa/ar/PlansNested', verified: '2026-10-21',
      noteAr: 'آخر تحديث للصفحة على موقع العمادة: 22 أبريل 2026. عنوان الصفحة «اقتراح خطط 1».', noteEn: 'Page last updated on the Deanship site: 22 April 2026. The page title reads “Plans proposal 1”.' },
    { id: 'ksu-guide', titleAr: 'الدليل الرسمي لبرنامج بكالوريوس العلوم السياسية', titleEn: 'Official Bachelor of Political Science program guide', type: 'pdf', url: 'https://clps.ksu.edu.sa/sites/clps.ksu.edu.sa/files/2024-04/ss.pdf', verified: '2026-10-21',
      noteAr: 'إصدار منشور في أبريل 2024 بحسب مسار الملف.', noteEn: 'Edition published April 2024 according to the file path.' },
    { id: 'ksu-history', titleAr: 'نبذة تاريخية عن الكلية', titleEn: 'College history', type: 'page', url: 'https://clps.ksu.edu.sa/ar/node/1218', verified: '2026-10-21' },
    { id: 'ksu-dar', titleAr: 'عمادة شؤون القبول والتسجيل', titleEn: 'Deanship of Admission & Registration', type: 'page', url: 'https://dar.ksu.edu.sa', verified: '2026-10-21' },
    { id: 'ksu-edugate', titleAr: 'بوابة النظام الأكاديمي', titleEn: 'Academic system portal', type: 'page', url: 'https://edugate.ksu.edu.sa', verified: null,
      noteAr: 'لم يمكن فحص الرابط آليًا (الموقع يمنع الوصول الآلي). الرابط المباشر المنشور على موقع العمادة: edugate.ksu.edu.sa/ksu/init', noteEn: 'Could not be checked automatically (the site blocks automated access). Deep link published on the Deanship site: edugate.ksu.edu.sa/ksu/init' },
  ],
  /* فروقات موثقة بين المصادر الرسمية — لم يُحسم أيٌّ منها بالتخمين */
  conflicts: [
    { id: 'total', ar: 'مجموع الساعات: تعلن الصفحة 130 ساعة، لكن مقرراتها المدرجة تعطي 111 ساعة إجبارية (بحساب مقرر 440 ساس مرة واحدة) + 8 ساعات اختياري جامعة + 12 ساعة اختياري قسم = 131 ساعة (أو 134 لو حُسب 440 مرتين).',
      en: 'Total hours: the page announces 130 credit hours, but its listed courses give 111 mandatory hours (counting course 440 once) + 8 university elective + 12 department elective = 131 (or 134 if 440 were counted twice).' },
    { id: 'dup440', ar: 'مقرر «العنف السياسي والإرهاب» (440 ساس) يظهر مرتين على صفحة العمادة: المستوى السادس والمستوى السابع. نحتسبه مرة واحدة.',
      en: 'The course “Political Violence and Terrorism” (440 SAS) appears twice on the Deanship page: level 6 and level 7. We count it once.' },
    { id: 'h431', ar: 'ساعات مقرر «الدبلوماسية والمفاوضات» (431 ساس): 3 ساعات على صفحة العمادة وفي وصف المقرر بالدليل، بينما جدول المقررات الإجبارية وجدول المستويات في الدليل (2024) يذكران ساعتين. هذا الفرق وحده يفسر فرق الـ131 مقابل الـ130.',
      en: 'Hours of “Diplomacy and Negotiations” (431 SAS): 3 on the Deanship page and in the guide’s course description, but the guide’s (2024) mandatory-courses and level tables show 2. This difference alone explains 131 vs 130.' },
    { id: 'code440', ar: 'رمز «العنف السياسي والإرهاب»: 440 ساس (صفحة العمادة + وصف المقرر بالدليل) مقابل 428 ساس (جدول الإجباري بالدليل).',
      en: 'Code of “Political Violence and Terrorism”: 440 SAS (Deanship page + guide course description) vs 428 SAS (the guide’s mandatory table).' },
    { id: 'swap', ar: 'اختلاف مقررات بين المصدرين: صفحة العمادة تذكر 118 عرب (مهارات القراءة — مستوى 3) و350 جمع (علم الاجتماع السياسي — ساعتان — مستوى 6)، بينما الدليل (2024) يذكر 103 عرب (التحرير العربي — ساعتان — مستوى 4) و450 ساس (علم الاجتماع السياسي — ساعتان — مستوى 6).',
      en: 'Different courses between the two sources: the Deanship page lists 118 ARAB (Reading Skills — level 3) and 350 SOC (Political Sociology — 2 h — level 6), whereas the guide (2024) lists 103 ARAB (Arabic Composition — 2 h — level 4) and 450 SAS (Political Sociology — 2 h — level 6).' },
    { id: 'quran', ar: 'مقرر «القرآن الكريم» (اختياري جامعة): رمزه 100 قرا على صفحة العمادة، ويظهر في الدليل برمز 103 عرب (قد يكون خطأ طباعيًا لكن لم يُحسم). كذلك «دراسات في السنة النبوية» (الصفحة) مقابل «دراسات في السيرة النبوية» (الدليل).',
      en: 'The “Holy Quran” university elective: code 100 QRA on the Deanship page, but 103 ARAB in the guide (possibly a typo, unresolved). Also “Studies in the Prophetic Sunnah” (page) vs “Studies in the Prophetic Biography” (guide).' },
    { id: 'deptElectives', ar: 'مقررات اختيار القسم: صفحة العمادة تعرض 11 مقررًا، والدليل (2024) يعرض 17 مقررًا (تُضاف 328 ساس، 437 ساس، 451 ساس، 455 ساس، 436 ساس، 438 ساس). نعرض مقررات صفحة العمادة فقط.',
      en: 'Department electives: the Deanship page lists 11 courses; the guide (2024) lists 17 (adding 328, 437, 451, 455, 436 and 438 SAS). We show the Deanship page list only.' },
    { id: 'draftTitle', ar: 'عنوان صفحة العمادة «اقتراح خطط 1 (Tab with Nested Acc)» قد يدل على صفحة تجريبية/مقترحة. يلزم تأكيد الخطة المعتمدة من القسم أو العمادة.',
      en: 'The Deanship page title reads “Plans proposal 1 (Tab with Nested Acc)”, which may indicate a draft/trial page. The approved plan must be confirmed with the department or Deanship.' },
  ],
});
