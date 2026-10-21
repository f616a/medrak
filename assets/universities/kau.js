/* مِدراك | universities/kau.js — جامعة الملك عبدالعزيز (بيانات موجودة سابقًا في الموقع، بدون أي تغيير بمحتواها)
   خطة KAU التفصيلية وتفاصيل القسم ما زالت داخل study-plan.html و index.html كما هي؛ هذا الملف يوفّر الأرقام العامة والمصادر لباقي المكونات. */
MedrakUniversity.register('kau', {
  info: {
    universityId: 'kau', universityNameAr: 'جامعة الملك عبدالعزيز', universityNameEn: 'King Abdulaziz University',
    city: 'جدة', college: 'كلية الاقتصاد والإدارة', department: 'قسم العلوم السياسية', programName: 'بكالوريوس العلوم السياسية',
    degree: 'البكالوريوس', durationYears: 4, totalCredits: 128, concentrations: 2, curriculumVersion: 'kau-guide-pdf', curriculumStatus: 'in-page',
    lastVerifiedDate: '2026-09-03',
  },
  sources: [
    { id: 'kau-dept', titleAr: 'صفحة قسم العلوم السياسية', titleEn: 'Political Science Department page', type: 'page',
      url: 'https://kau.edu.sa/faculty/ar/economics-administration/page/political-science-department', verified: '2026-09-03' },
    { id: 'kau-guide', titleAr: 'دليل متطلبات درجة بكالوريوس العلوم السياسية (الخطة الدراسية)', titleEn: 'Bachelor requirements guide (study plan)', type: 'pdf',
      url: 'https://political-science.kau.edu.sa/Files/120006/Files/157420_Study-plan-ps-ar.pdf', verified: '2026-09-03' },
    { id: 'kau-library', titleAr: 'المكتبة المركزية', titleEn: 'Central Library', type: 'page',
      url: 'https://www.kau.edu.sa/ar/page/central-library', verified: null },
  ],
});
