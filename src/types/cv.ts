export type LocalizedString = Record<string, string>;

export interface LanguageOption {
  code: string;
  name: string;
  flag?: string;
}

export interface CvStyle {
  fontSize: '10pt' | '10.5pt' | '11pt' | '12pt' | string;
  marginCm: number;
  mainColor: string;
  darkGray: string;
  sectionSpacingPt: number;
  sectionAfterPt: number;
  projectItemSepPt: number;
  skillsItemSepPt: number;
  expSpacingPt: number;
}

export interface CvMeta {
  languages: LanguageOption[];
  activeLanguage: string;
  activePresetId: string;
  style: CvStyle;
}

export interface CvProfile {
  name: string;
  phone: string;
  email: string;
  linkedinUrl: string;
  linkedinLabel: LocalizedString;
  githubUrl: string;
  githubLabel: LocalizedString;
  location: LocalizedString;
  title: LocalizedString;
  summary: LocalizedString;
  _baseSummary?: LocalizedString;
}

export type SectionType =
  | 'summary'
  | 'education'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'custom_entries'
  | 'custom_bullets';

export interface CvSection {
  id: string;
  type: SectionType;
  enabled: boolean;
  title: LocalizedString;
}

export interface EducationItem {
  id: string;
  enabled: boolean;
  degree: LocalizedString;
  dates: LocalizedString;
  institution: LocalizedString;
}

export interface ExperienceBullet {
  id: string;
  enabled: boolean;
  text: LocalizedString;
}

export interface ExperienceItem {
  id: string;
  enabled: boolean;
  role: LocalizedString;
  company: LocalizedString;
  dates: LocalizedString;
  bullets: ExperienceBullet[];
}

export interface ProjectItem {
  id: string;
  number?: number;
  enabled: boolean;
  profiles?: string[];
  name: LocalizedString;
  techStack: LocalizedString;
  description: LocalizedString;
  tags?: string[];
}

export interface SkillCategory {
  id: string;
  enabled: boolean;
  category: LocalizedString;
  items: LocalizedString;
}

export interface CertificationItem {
  id: string;
  enabled: boolean;
  title: LocalizedString;
  issuer: LocalizedString;
}

export interface SpokenLanguageItem {
  id: string;
  enabled: boolean;
  language: LocalizedString;
  level: LocalizedString;
}

export interface CustomSectionItem {
  id: string;
  enabled: boolean;
  title: LocalizedString;
  subtitle?: LocalizedString;
  dates?: LocalizedString;
  description: LocalizedString;
}

export interface JobPreset {
  id: string;
  name: string;
  shortName?: string;
  company?: string;
  jobDescription?: string;
  language?: string;
  customTitle?: LocalizedString;
  customSummary?: LocalizedString;
  enabledProjects?: string[];
  enabledExperiences?: string[];
  enabledCertifications?: string[];
}

export interface CvData {
  meta: CvMeta;
  profile: CvProfile;
  sections: CvSection[];
  education: EducationItem[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  skills: SkillCategory[];
  certifications: CertificationItem[];
  spokenLanguages: SpokenLanguageItem[];
  customSections: Record<string, CustomSectionItem[]>;
  jobPresets: JobPreset[];
}

export interface CompilerInfo {
  available: boolean;
  engine: string | null;
  path: string | null;
  version: string;
}

export interface CompileResult {
  ok: boolean;
  filename?: string;
  pdfPath?: string;
  pdfBase64?: string;
  sizeBytes?: number;
  elapsedMs?: number;
  engine?: string;
  log?: string;
  error?: string;
}

export type ActiveNavTab =
  | 'tailor'
  | 'profile'
  | 'summary'
  | 'experience'
  | 'projects'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'layout'
  | `custom:${string}`;

export type PreviewMode = 'a4' | 'pdf' | 'tex';
export type TexSubTab = 'standalone' | 'body' | 'main';
