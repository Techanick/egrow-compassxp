export type Language = 'en' | 'fr' | 'es' | 'tr' | 'zh';

export const languageNames: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  tr: 'Türkçe',
  zh: '中文',
};

type TranslationKeys = {
  // Nav
  dashboard: string;
  frameworkExplorer: string;
  selfAssessment: string;
  developmentPlan: string;
  team: string;
  logout: string;
  login: string;
  // Dashboard
  welcome: string;
  quickActions: string;
  startAssessment: string;
  updatePlan: string;
  browseFramework: string;
  progressSummary: string;
  // Framework
  roles: string;
  skills: string;
  behaviors: string;
  masteryLevels: string;
  fundamentals: string;
  intermediate: string;
  advanced: string;
  referent: string;
  developmentTools: string;
  // Assessment
  hardlyEver: string;
  sometimes: string;
  often: string;
  almostAlways: string;
  submitAssessment: string;
  assessmentHistory: string;
  assessmentIntro: string;
  skillProgress: string;
  rateEachBehavior: string;
  levelValidated: string;
  levelNotValidated: string;
  validationRule: string;
  assessmentResults: string;
  yourMasteryLevels: string;
  validatedLevel: string;
  notYetValidated: string;
  restartAssessment: string;
  behaviorRated: string;
  of: string;
  // Dev Plan
  recommendedSkills: string;
  targetLevel: string;
  addAction: string;
  actionPlan: string;
  inProgress: string;
  completed: string;
  selectSkillsToFocus: string;
  gapAnalysis: string;
  currentLevel: string;
  noAssessmentYet: string;
  completeAssessmentFirst: string;
  goToAssessment: string;
  addActionItem: string;
  actionDescription: string;
  deadline: string;
  markComplete: string;
  markInProgress: string;
  removeAction: string;
  noActionsYet: string;
  addFirstAction: string;
  progressOverview: string;
  focusSkills: string;
  selectUpTo: string;
  buildPlan: string;
  editSelection: string;
  todo: string;
  suggestedTools: string;
  behaviorToWorkOn: string;
  // General
  save: string;
  cancel: string;
  back: string;
  next: string;
  viewDetails: string;
  language: string;
};

const translations: Record<Language, TranslationKeys> = {
  en: {
    dashboard: 'Dashboard',
    frameworkExplorer: 'Framework Explorer',
    selfAssessment: 'Self-Assessment',
    developmentPlan: 'Development Plan',
    team: 'Team',
    logout: 'Log out',
    login: 'Log in',
    welcome: 'Welcome',
    quickActions: 'Quick Actions',
    startAssessment: 'Start Self-Assessment',
    updatePlan: 'Update Development Plan',
    browseFramework: 'Browse Framework',
    progressSummary: 'Progress Summary',
    roles: 'Roles',
    skills: 'Skills',
    behaviors: 'Behaviors',
    masteryLevels: 'Mastery Levels',
    fundamentals: 'Fundamentals',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    referent: 'Referent / Role Model',
    developmentTools: 'Development Tools',
    hardlyEver: 'Hardly ever',
    sometimes: 'Sometimes',
    often: 'Often',
    almostAlways: 'Almost always',
    submitAssessment: 'Submit Assessment',
    assessmentHistory: 'Assessment History',
    assessmentIntro: 'Rate how frequently you demonstrate each behavior. Your mastery levels will be calculated automatically.',
    skillProgress: 'Skill',
    rateEachBehavior: 'Rate each behavior below',
    levelValidated: 'Level validated',
    levelNotValidated: 'Not yet validated',
    validationRule: 'A level is validated when at least 3 behaviors are rated "Often" or "Almost always"',
    assessmentResults: 'Assessment Results',
    yourMasteryLevels: 'Your Mastery Levels',
    validatedLevel: 'Validated',
    notYetValidated: 'Not validated',
    restartAssessment: 'Start New Assessment',
    behaviorRated: 'behaviors rated',
    of: 'of',
    recommendedSkills: 'Recommended Skills',
    targetLevel: 'Target Level',
    addAction: 'Add Action',
    actionPlan: 'Action Plan',
    inProgress: 'In Progress',
    completed: 'Completed',
    selectSkillsToFocus: 'Select skills to focus on',
    gapAnalysis: 'Gap Analysis',
    currentLevel: 'Current level',
    noAssessmentYet: 'No assessment yet',
    completeAssessmentFirst: 'Complete a self-assessment first to identify your skill gaps and build a targeted development plan.',
    goToAssessment: 'Go to Self-Assessment',
    addActionItem: 'Add action',
    actionDescription: 'Describe the action...',
    deadline: 'Deadline',
    markComplete: 'Mark complete',
    markInProgress: 'Mark in progress',
    removeAction: 'Remove',
    noActionsYet: 'No actions yet',
    addFirstAction: 'Add your first action',
    progressOverview: 'Overall progress',
    focusSkills: 'Focus Skills',
    selectUpTo: 'Select up to 2 skills to focus on based on your assessment gaps.',
    buildPlan: 'Build Plan',
    editSelection: 'Edit Selection',
    todo: 'To do',
    suggestedTools: 'Suggested Development Tools',
    behaviorToWorkOn: 'Behaviors to work on',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    next: 'Next',
    viewDetails: 'View Details',
    language: 'Language',
  },
  fr: {
    dashboard: 'Tableau de bord',
    frameworkExplorer: 'Explorateur du Référentiel',
    selfAssessment: 'Auto-évaluation',
    developmentPlan: 'Plan de Développement',
    team: 'Équipe',
    logout: 'Déconnexion',
    login: 'Connexion',
    welcome: 'Bienvenue',
    quickActions: 'Actions Rapides',
    startAssessment: "Commencer l'auto-évaluation",
    updatePlan: 'Mettre à jour le plan',
    browseFramework: 'Parcourir le référentiel',
    progressSummary: 'Résumé de la progression',
    roles: 'Rôles',
    skills: 'Compétences',
    behaviors: 'Comportements',
    masteryLevels: 'Niveaux de maîtrise',
    fundamentals: 'Fondamentaux',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    referent: 'Référent / Modèle',
    developmentTools: 'Outils de développement',
    hardlyEver: 'Presque jamais',
    sometimes: 'Parfois',
    often: 'Souvent',
    almostAlways: 'Presque toujours',
    submitAssessment: "Soumettre l'évaluation",
    assessmentHistory: 'Historique des évaluations',
    assessmentIntro: 'Évaluez la fréquence à laquelle vous démontrez chaque comportement. Vos niveaux de maîtrise seront calculés automatiquement.',
    skillProgress: 'Compétence',
    rateEachBehavior: 'Évaluez chaque comportement ci-dessous',
    levelValidated: 'Niveau validé',
    levelNotValidated: 'Pas encore validé',
    validationRule: 'Un niveau est validé quand au moins 3 comportements sont notés "Souvent" ou "Presque toujours"',
    assessmentResults: 'Résultats de l\'évaluation',
    yourMasteryLevels: 'Vos niveaux de maîtrise',
    validatedLevel: 'Validé',
    notYetValidated: 'Non validé',
    restartAssessment: 'Nouvelle évaluation',
    behaviorRated: 'comportements évalués',
    of: 'sur',
    recommendedSkills: 'Compétences recommandées',
    targetLevel: 'Niveau cible',
    addAction: 'Ajouter une action',
    actionPlan: "Plan d'action",
    inProgress: 'En cours',
    completed: 'Terminé',
    selectSkillsToFocus: 'Sélectionnez les compétences à développer',
    gapAnalysis: 'Analyse des écarts',
    currentLevel: 'Niveau actuel',
    noAssessmentYet: 'Pas encore d\'évaluation',
    completeAssessmentFirst: 'Complétez d\'abord une auto-évaluation pour identifier vos lacunes et construire un plan de développement ciblé.',
    goToAssessment: 'Aller à l\'auto-évaluation',
    addActionItem: 'Ajouter une action',
    actionDescription: 'Décrivez l\'action...',
    deadline: 'Échéance',
    markComplete: 'Marquer terminé',
    markInProgress: 'Marquer en cours',
    removeAction: 'Supprimer',
    noActionsYet: 'Aucune action pour le moment',
    addFirstAction: 'Ajoutez votre première action',
    progressOverview: 'Progression globale',
    focusSkills: 'Compétences ciblées',
    selectUpTo: 'Sélectionnez jusqu\'à 2 compétences à développer en priorité.',
    buildPlan: 'Créer le plan',
    editSelection: 'Modifier la sélection',
    todo: 'À faire',
    suggestedTools: 'Outils de développement suggérés',
    behaviorToWorkOn: 'Comportements à travailler',
    save: 'Enregistrer',
    cancel: 'Annuler',
    back: 'Retour',
    next: 'Suivant',
    viewDetails: 'Voir les détails',
    language: 'Langue',
  },
  es: {
    dashboard: 'Panel',
    frameworkExplorer: 'Explorador del Marco',
    selfAssessment: 'Autoevaluación',
    developmentPlan: 'Plan de Desarrollo',
    team: 'Equipo',
    logout: 'Cerrar sesión',
    login: 'Iniciar sesión',
    welcome: 'Bienvenido',
    quickActions: 'Acciones Rápidas',
    startAssessment: 'Iniciar autoevaluación',
    updatePlan: 'Actualizar plan',
    browseFramework: 'Explorar marco',
    progressSummary: 'Resumen de progreso',
    roles: 'Roles',
    skills: 'Competencias',
    behaviors: 'Comportamientos',
    masteryLevels: 'Niveles de dominio',
    fundamentals: 'Fundamentos',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    referent: 'Referente / Modelo',
    developmentTools: 'Herramientas de desarrollo',
    hardlyEver: 'Casi nunca',
    sometimes: 'A veces',
    often: 'A menudo',
    almostAlways: 'Casi siempre',
    submitAssessment: 'Enviar evaluación',
    assessmentHistory: 'Historial de evaluaciones',
    assessmentIntro: 'Evalúe con qué frecuencia demuestra cada comportamiento. Sus niveles de dominio se calcularán automáticamente.',
    skillProgress: 'Competencia',
    rateEachBehavior: 'Evalúe cada comportamiento a continuación',
    levelValidated: 'Nivel validado',
    levelNotValidated: 'Aún no validado',
    validationRule: 'Un nivel se valida cuando al menos 3 comportamientos se califican como "A menudo" o "Casi siempre"',
    assessmentResults: 'Resultados de la evaluación',
    yourMasteryLevels: 'Sus niveles de dominio',
    validatedLevel: 'Validado',
    notYetValidated: 'No validado',
    restartAssessment: 'Nueva evaluación',
    behaviorRated: 'comportamientos evaluados',
    of: 'de',
    recommendedSkills: 'Competencias recomendadas',
    targetLevel: 'Nivel objetivo',
    addAction: 'Añadir acción',
    actionPlan: 'Plan de acción',
    inProgress: 'En progreso',
    completed: 'Completado',
    selectSkillsToFocus: 'Seleccione competencias a desarrollar',
    gapAnalysis: 'Análisis de brechas',
    currentLevel: 'Nivel actual',
    noAssessmentYet: 'Sin evaluación aún',
    completeAssessmentFirst: 'Complete primero una autoevaluación para identificar sus brechas y crear un plan de desarrollo dirigido.',
    goToAssessment: 'Ir a la autoevaluación',
    addActionItem: 'Añadir acción',
    actionDescription: 'Describa la acción...',
    deadline: 'Fecha límite',
    markComplete: 'Marcar completado',
    markInProgress: 'Marcar en progreso',
    removeAction: 'Eliminar',
    noActionsYet: 'Sin acciones aún',
    addFirstAction: 'Añada su primera acción',
    progressOverview: 'Progreso general',
    focusSkills: 'Competencias prioritarias',
    selectUpTo: 'Seleccione hasta 2 competencias a desarrollar según sus brechas.',
    buildPlan: 'Crear plan',
    editSelection: 'Editar selección',
    todo: 'Pendiente',
    suggestedTools: 'Herramientas de desarrollo sugeridas',
    behaviorToWorkOn: 'Comportamientos a trabajar',
    save: 'Guardar',
    cancel: 'Cancelar',
    back: 'Atrás',
    next: 'Siguiente',
    viewDetails: 'Ver detalles',
    language: 'Idioma',
  },
  tr: {
    dashboard: 'Gösterge Paneli',
    frameworkExplorer: 'Çerçeve Gezgini',
    selfAssessment: 'Öz Değerlendirme',
    developmentPlan: 'Gelişim Planı',
    team: 'Takım',
    logout: 'Çıkış',
    login: 'Giriş',
    welcome: 'Hoş geldiniz',
    quickActions: 'Hızlı Eylemler',
    startAssessment: 'Öz değerlendirmeyi başlat',
    updatePlan: 'Planı güncelle',
    browseFramework: 'Çerçeveyi incele',
    progressSummary: 'İlerleme Özeti',
    roles: 'Roller',
    skills: 'Yetkinlikler',
    behaviors: 'Davranışlar',
    masteryLevels: 'Ustalık Seviyeleri',
    fundamentals: 'Temel',
    intermediate: 'Orta',
    advanced: 'İleri',
    referent: 'Referans / Rol Model',
    developmentTools: 'Gelişim Araçları',
    hardlyEver: 'Neredeyse hiç',
    sometimes: 'Bazen',
    often: 'Sıklıkla',
    almostAlways: 'Neredeyse her zaman',
    submitAssessment: 'Değerlendirmeyi gönder',
    assessmentHistory: 'Değerlendirme Geçmişi',
    assessmentIntro: 'Her bir davranışı ne sıklıkla sergilediğinizi değerlendirin. Ustalık seviyeleriniz otomatik olarak hesaplanacaktır.',
    skillProgress: 'Yetkinlik',
    rateEachBehavior: 'Aşağıdaki her davranışı değerlendirin',
    levelValidated: 'Seviye onaylandı',
    levelNotValidated: 'Henüz onaylanmadı',
    validationRule: 'Bir seviye, en az 3 davranış "Sıklıkla" veya "Neredeyse her zaman" olarak derecelendirildiğinde onaylanır',
    assessmentResults: 'Değerlendirme Sonuçları',
    yourMasteryLevels: 'Ustalık Seviyeleriniz',
    validatedLevel: 'Onaylandı',
    notYetValidated: 'Onaylanmadı',
    restartAssessment: 'Yeni değerlendirme',
    behaviorRated: 'davranış değerlendirildi',
    of: '/',
    recommendedSkills: 'Önerilen yetkinlikler',
    targetLevel: 'Hedef seviye',
    addAction: 'Eylem ekle',
    actionPlan: 'Eylem planı',
    inProgress: 'Devam ediyor',
    completed: 'Tamamlandı',
    selectSkillsToFocus: 'Odaklanılacak yetkinlikleri seçin',
    gapAnalysis: 'Boşluk Analizi',
    currentLevel: 'Mevcut seviye',
    noAssessmentYet: 'Henüz değerlendirme yok',
    completeAssessmentFirst: 'Beceri boşluklarınızı belirlemek ve hedefli bir gelişim planı oluşturmak için önce bir öz değerlendirme yapın.',
    goToAssessment: 'Öz Değerlendirmeye Git',
    addActionItem: 'Eylem ekle',
    actionDescription: 'Eylemi tanımlayın...',
    deadline: 'Son tarih',
    markComplete: 'Tamamlandı olarak işaretle',
    markInProgress: 'Devam ediyor olarak işaretle',
    removeAction: 'Kaldır',
    noActionsYet: 'Henüz eylem yok',
    addFirstAction: 'İlk eyleminizi ekleyin',
    progressOverview: 'Genel ilerleme',
    focusSkills: 'Odak Yetkinlikleri',
    selectUpTo: 'Değerlendirme sonuçlarınıza göre en fazla 2 yetkinlik seçin.',
    buildPlan: 'Plan Oluştur',
    editSelection: 'Seçimi Düzenle',
    todo: 'Yapılacak',
    suggestedTools: 'Önerilen Gelişim Araçları',
    behaviorToWorkOn: 'Üzerinde çalışılacak davranışlar',
    save: 'Kaydet',
    cancel: 'İptal',
    back: 'Geri',
    next: 'İleri',
    viewDetails: 'Detayları gör',
    language: 'Dil',
  },
  zh: {
    dashboard: '仪表板',
    frameworkExplorer: '框架浏览器',
    selfAssessment: '自我评估',
    developmentPlan: '发展计划',
    team: '团队',
    logout: '退出',
    login: '登录',
    welcome: '欢迎',
    quickActions: '快速操作',
    startAssessment: '开始自我评估',
    updatePlan: '更新发展计划',
    browseFramework: '浏览框架',
    progressSummary: '进度摘要',
    roles: '角色',
    skills: '技能',
    behaviors: '行为',
    masteryLevels: '精通等级',
    fundamentals: '基础',
    intermediate: '中级',
    advanced: '高级',
    referent: '参考 / 榜样',
    developmentTools: '发展工具',
    hardlyEver: '几乎从不',
    sometimes: '有时',
    often: '经常',
    almostAlways: '几乎总是',
    submitAssessment: '提交评估',
    assessmentHistory: '评估历史',
    assessmentIntro: '评估您展示每个行为的频率。您的精通等级将自动计算。',
    skillProgress: '技能',
    rateEachBehavior: '请评估以下每个行为',
    levelValidated: '等级已验证',
    levelNotValidated: '尚未验证',
    validationRule: '当至少3个行为被评为"经常"或"几乎总是"时，该等级即被验证',
    assessmentResults: '评估结果',
    yourMasteryLevels: '您的精通等级',
    validatedLevel: '已验证',
    notYetValidated: '未验证',
    restartAssessment: '开始新评估',
    behaviorRated: '个行为已评估',
    of: '/',
    recommendedSkills: '推荐技能',
    targetLevel: '目标等级',
    addAction: '添加行动',
    actionPlan: '行动计划',
    inProgress: '进行中',
    completed: '已完成',
    selectSkillsToFocus: '选择要重点发展的技能',
    gapAnalysis: '差距分析',
    currentLevel: '当前等级',
    noAssessmentYet: '尚无评估',
    completeAssessmentFirst: '请先完成自我评估，以确定技能差距并制定有针对性的发展计划。',
    goToAssessment: '前往自我评估',
    addActionItem: '添加行动',
    actionDescription: '描述行动...',
    deadline: '截止日期',
    markComplete: '标记完成',
    markInProgress: '标记进行中',
    removeAction: '删除',
    noActionsYet: '暂无行动',
    addFirstAction: '添加您的第一个行动',
    progressOverview: '总体进度',
    focusSkills: '重点技能',
    selectUpTo: '根据评估差距选择最多2项技能进行重点发展。',
    buildPlan: '创建计划',
    editSelection: '编辑选择',
    todo: '待办',
    suggestedTools: '推荐发展工具',
    behaviorToWorkOn: '需要改进的行为',
    save: '保存',
    cancel: '取消',
    back: '返回',
    next: '下一步',
    viewDetails: '查看详情',
    language: '语言',
  },
};

export function t(key: keyof TranslationKeys, lang: Language): string {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export default translations;
