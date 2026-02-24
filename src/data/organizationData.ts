import { Language } from '@/i18n/translations';

export interface OrgOption {
  id: string;
  label: Record<Language, string>;
}

export const departments: OrgOption[] = [
  { id: 'sales', label: { en: 'Sales', fr: 'Ventes', es: 'Ventas', tr: 'Satış', zh: '销售', it: 'Vendite' } },
  { id: 'marketing', label: { en: 'Marketing', fr: 'Marketing', es: 'Marketing', tr: 'Pazarlama', zh: '市场营销', it: 'Marketing' } },
  { id: 'supply_chain', label: { en: 'Supply Chain', fr: 'Supply Chain', es: 'Cadena de Suministro', tr: 'Tedarik Zinciri', zh: '供应链', it: 'Supply Chain' } },
  { id: 'finance', label: { en: 'Finance', fr: 'Finance', es: 'Finanzas', tr: 'Finans', zh: '财务', it: 'Finanza' } },
  { id: 'production', label: { en: 'Production', fr: 'Production', es: 'Producción', tr: 'Üretim', zh: '生产', it: 'Produzione' } },
  { id: 'r_and_d', label: { en: 'R&D', fr: 'R&D', es: 'I+D', tr: 'Ar-Ge', zh: '研发', it: 'R&S' } },
  { id: 'hr', label: { en: 'Human Resources', fr: 'Ressources Humaines', es: 'Recursos Humanos', tr: 'İnsan Kaynakları', zh: '人力资源', it: 'Risorse Umane' } },
  { id: 'it', label: { en: 'IT', fr: 'Informatique', es: 'TI', tr: 'Bilgi Teknolojileri', zh: '信息技术', it: 'IT' } },
  { id: 'legal', label: { en: 'Legal & Compliance', fr: 'Juridique & Conformité', es: 'Legal y Cumplimiento', tr: 'Hukuk ve Uyum', zh: '法务与合规', it: 'Legale e Conformità' } },
  { id: 'quality', label: { en: 'Quality & Regulatory', fr: 'Qualité & Réglementaire', es: 'Calidad y Regulación', tr: 'Kalite ve Düzenleme', zh: '质量与法规', it: 'Qualità e Regolamentazione' } },
  { id: 'medical', label: { en: 'Medical & Scientific Affairs', fr: 'Affaires Médicales & Scientifiques', es: 'Asuntos Médicos y Científicos', tr: 'Tıbbi ve Bilimsel İşler', zh: '医学与科学事务', it: 'Affari Medici e Scientifici' } },
  { id: 'general_management', label: { en: 'General Management', fr: 'Direction Générale', es: 'Dirección General', tr: 'Genel Yönetim', zh: '总管理', it: 'Direzione Generale' } },
];

export interface GeoZone {
  id: string;
  label: Record<Language, string>;
  countries: OrgOption[];
}

export const geographies: GeoZone[] = [
  {
    id: 'france',
    label: { en: 'France', fr: 'France', es: 'Francia', tr: 'Fransa', zh: '法国', it: 'Francia' },
    countries: [
      { id: 'fr', label: { en: 'France', fr: 'France', es: 'Francia', tr: 'Fransa', zh: '法国', it: 'Francia' } },
    ],
  },
  {
    id: 'europe',
    label: { en: 'Europe', fr: 'Europe', es: 'Europa', tr: 'Avrupa', zh: '欧洲', it: 'Europa' },
    countries: [
      { id: 'de', label: { en: 'Germany', fr: 'Allemagne', es: 'Alemania', tr: 'Almanya', zh: '德国', it: 'Germania' } },
      { id: 'gb', label: { en: 'United Kingdom', fr: 'Royaume-Uni', es: 'Reino Unido', tr: 'Birleşik Krallık', zh: '英国', it: 'Regno Unito' } },
      { id: 'it_country', label: { en: 'Italy', fr: 'Italie', es: 'Italia', tr: 'İtalya', zh: '意大利', it: 'Italia' } },
      { id: 'es_country', label: { en: 'Spain', fr: 'Espagne', es: 'España', tr: 'İspanya', zh: '西班牙', it: 'Spagna' } },
      { id: 'be', label: { en: 'Belgium', fr: 'Belgique', es: 'Bélgica', tr: 'Belçika', zh: '比利时', it: 'Belgio' } },
      { id: 'nl', label: { en: 'Netherlands', fr: 'Pays-Bas', es: 'Países Bajos', tr: 'Hollanda', zh: '荷兰', it: 'Paesi Bassi' } },
      { id: 'pl', label: { en: 'Poland', fr: 'Pologne', es: 'Polonia', tr: 'Polonya', zh: '波兰', it: 'Polonia' } },
      { id: 'pt', label: { en: 'Portugal', fr: 'Portugal', es: 'Portugal', tr: 'Portekiz', zh: '葡萄牙', it: 'Portogallo' } },
    ],
  },
  {
    id: 'us',
    label: { en: 'United States', fr: 'États-Unis', es: 'Estados Unidos', tr: 'Amerika Birleşik Devletleri', zh: '美国', it: 'Stati Uniti' },
    countries: [
      { id: 'us_country', label: { en: 'United States', fr: 'États-Unis', es: 'Estados Unidos', tr: 'ABD', zh: '美国', it: 'Stati Uniti' } },
    ],
  },
  {
    id: 'china',
    label: { en: 'China', fr: 'Chine', es: 'China', tr: 'Çin', zh: '中国', it: 'Cina' },
    countries: [
      { id: 'cn', label: { en: 'China', fr: 'Chine', es: 'China', tr: 'Çin', zh: '中国', it: 'Cina' } },
    ],
  },
  {
    id: 'iberolatam',
    label: { en: 'Ibero-Latam', fr: 'Ibéro-Latam', es: 'Ibero-Latam', tr: 'İbero-Latam', zh: '伊比利亚-拉美', it: 'Ibero-Latam' },
    countries: [
      { id: 'br', label: { en: 'Brazil', fr: 'Brésil', es: 'Brasil', tr: 'Brezilya', zh: '巴西', it: 'Brasile' } },
      { id: 'mx', label: { en: 'Mexico', fr: 'Mexique', es: 'México', tr: 'Meksika', zh: '墨西哥', it: 'Messico' } },
      { id: 'co', label: { en: 'Colombia', fr: 'Colombie', es: 'Colombia', tr: 'Kolombiya', zh: '哥伦比亚', it: 'Colombia' } },
      { id: 'ar', label: { en: 'Argentina', fr: 'Argentine', es: 'Argentina', tr: 'Arjantin', zh: '阿根廷', it: 'Argentina' } },
      { id: 'cl', label: { en: 'Chile', fr: 'Chili', es: 'Chile', tr: 'Şili', zh: '智利', it: 'Cile' } },
    ],
  },
  {
    id: 'intercontinental',
    label: { en: 'Intercontinental', fr: 'Intercontinental', es: 'Intercontinental', tr: 'Kıtalararası', zh: '洲际', it: 'Intercontinentale' },
    countries: [
      { id: 'tr_country', label: { en: 'Turkey', fr: 'Turquie', es: 'Turquía', tr: 'Türkiye', zh: '土耳其', it: 'Turchia' } },
      { id: 'ru', label: { en: 'Russia', fr: 'Russie', es: 'Rusia', tr: 'Rusya', zh: '俄罗斯', it: 'Russia' } },
      { id: 'in', label: { en: 'India', fr: 'Inde', es: 'India', tr: 'Hindistan', zh: '印度', it: 'India' } },
    ],
  },
  {
    id: 'middle_east',
    label: { en: 'Middle East', fr: 'Moyen-Orient', es: 'Oriente Medio', tr: 'Orta Doğu', zh: '中东', it: 'Medio Oriente' },
    countries: [
      { id: 'ae', label: { en: 'UAE', fr: 'EAU', es: 'EAU', tr: 'BAE', zh: '阿联酋', it: 'EAU' } },
      { id: 'sa', label: { en: 'Saudi Arabia', fr: 'Arabie Saoudite', es: 'Arabia Saudita', tr: 'Suudi Arabistan', zh: '沙特阿拉伯', it: 'Arabia Saudita' } },
    ],
  },
  {
    id: 'apac',
    label: { en: 'Asia-Pacific', fr: 'Asie-Pacifique', es: 'Asia-Pacífico', tr: 'Asya-Pasifik', zh: '亚太', it: 'Asia-Pacifico' },
    countries: [
      { id: 'jp', label: { en: 'Japan', fr: 'Japon', es: 'Japón', tr: 'Japonya', zh: '日本', it: 'Giappone' } },
      { id: 'kr', label: { en: 'South Korea', fr: 'Corée du Sud', es: 'Corea del Sur', tr: 'Güney Kore', zh: '韩国', it: 'Corea del Sud' } },
      { id: 'au', label: { en: 'Australia', fr: 'Australie', es: 'Australia', tr: 'Avustralya', zh: '澳大利亚', it: 'Australia' } },
      { id: 'sg', label: { en: 'Singapore', fr: 'Singapour', es: 'Singapur', tr: 'Singapur', zh: '新加坡', it: 'Singapore' } },
    ],
  },
  {
    id: 'africa',
    label: { en: 'Africa', fr: 'Afrique', es: 'África', tr: 'Afrika', zh: '非洲', it: 'Africa' },
    countries: [
      { id: 'za', label: { en: 'South Africa', fr: 'Afrique du Sud', es: 'Sudáfrica', tr: 'Güney Afrika', zh: '南非', it: 'Sudafrica' } },
      { id: 'ng', label: { en: 'Nigeria', fr: 'Nigeria', es: 'Nigeria', tr: 'Nijerya', zh: '尼日利亚', it: 'Nigeria' } },
      { id: 'ma', label: { en: 'Morocco', fr: 'Maroc', es: 'Marruecos', tr: 'Fas', zh: '摩洛哥', it: 'Marocco' } },
    ],
  },
];

// Helper to get flat list of all geography zone IDs
export function getAllGeoZoneIds(): string[] {
  return geographies.map(z => z.id);
}

// Helper to find zone label by ID
export function getGeoZoneLabel(zoneId: string, language: Language): string {
  const zone = geographies.find(z => z.id === zoneId);
  return zone?.label[language] ?? zoneId;
}

// Helper to find department label by ID
export function getDepartmentLabel(deptId: string, language: Language): string {
  const dept = departments.find(d => d.id === deptId);
  return dept?.label[language] ?? deptId;
}
