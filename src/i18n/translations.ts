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
  // Dev Plan
  recommendedSkills: string;
  targetLevel: string;
  addAction: string;
  actionPlan: string;
  inProgress: string;
  completed: string;
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
    recommendedSkills: 'Recommended Skills',
    targetLevel: 'Target Level',
    addAction: 'Add Action',
    actionPlan: 'Action Plan',
    inProgress: 'In Progress',
    completed: 'Completed',
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
    recommendedSkills: 'Compétences recommandées',
    targetLevel: 'Niveau cible',
    addAction: 'Ajouter une action',
    actionPlan: "Plan d'action",
    inProgress: 'En cours',
    completed: 'Terminé',
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
    recommendedSkills: 'Competencias recomendadas',
    targetLevel: 'Nivel objetivo',
    addAction: 'Añadir acción',
    actionPlan: 'Plan de acción',
    inProgress: 'En progreso',
    completed: 'Completado',
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
    recommendedSkills: 'Önerilen yetkinlikler',
    targetLevel: 'Hedef seviye',
    addAction: 'Eylem ekle',
    actionPlan: 'Eylem planı',
    inProgress: 'Devam ediyor',
    completed: 'Tamamlandı',
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
    recommendedSkills: '推荐技能',
    targetLevel: '目标等级',
    addAction: '添加行动',
    actionPlan: '行动计划',
    inProgress: '进行中',
    completed: '已完成',
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
