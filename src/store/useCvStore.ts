import { create } from 'zustand';
import type {
  ActiveNavTab,
  CompilerInfo,
  CvData,
  LanguageOption,
  LocalizedString,
  PreviewMode,
  SectionType,
  TexSubTab,
} from '../types/cv';
import sampleCvData from '../../data/sample_cv_data.json';
import {
  apiCompileLatex,
  apiGetInitialState,
  apiInstallTectonic,
  apiLoadSampleTemplate,
  apiOpenInSystem,
  apiSaveCvData,
  apiSaveExportFile,
  apiSyncTexFiles,
} from '../lib/tauri';
import {
  generateAllBodyTexMap,
  generateBodyTex,
  generateMainTex,
  generateStandaloneTex,
  loc,
} from '../lib/latex-generator';
import {
  getActivePreset,
  getPdfExportBasename,
  getPdfExportFilename,
} from '../lib/filename';
import { extractJobKeywords, scoreProjectMatch } from '../lib/job-matcher';
import { parseTexIntoCvData } from '../lib/latex-importer';

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function makeLocField(
  languages: LanguageOption[],
  defaultText: string = ''
): LocalizedString {
  const obj: LocalizedString = {};
  languages.forEach((l) => {
    obj[l.code] = defaultText;
  });
  return obj;
}

function syncActivePresetInDraft(
  d: CvData,
  jobOfferText: string,
  jobCompany: string
) {
  const activeId = d.meta?.activePresetId;
  if (!activeId || !Array.isArray(d.jobPresets)) return;
  const target = d.jobPresets.find((p) => p.id === activeId);
  if (!target) return;

  target.jobDescription = jobOfferText;
  target.company = jobCompany;
  target.language = d.meta.activeLanguage;
  target.customTitle = JSON.parse(JSON.stringify(d.profile.title || {}));
  target.customSummary = JSON.parse(JSON.stringify(d.profile.summary || {}));
  target.enabledProjects = (d.projects || [])
    .filter((p) => p.enabled)
    .map((p) => p.id);
  target.enabledExperiences = (d.experience || [])
    .filter((e) => e.enabled)
    .map((e) => e.id);
  target.enabledCertifications = (d.certifications || [])
    .filter((c) => c.enabled)
    .map((c) => c.id);
}

export interface CvStoreState {
  data: CvData;
  loading: boolean;
  saveStatus: 'Saved' | 'Saving...' | 'Local backup';
  activeNav: ActiveNavTab;
  previewMode: PreviewMode;
  texSubTab: TexSubTab;
  expandedId: string | null;
  bilingualEdit: boolean;
  zoom: number;
  topNCount: number;

  // Job Tailoring inputs
  jobOfferText: string;
  jobTargetRole: string;
  jobCompany: string;

  // Page Fit Meter
  pageFillPercent: number;

  // Compiler State
  compilerInfo: CompilerInfo;
  isCompiling: boolean;
  compiledPdfBase64: string;
  compiledPdfPath: string;
  compileLog: string;
  compileError: string;
  showCompileLog: boolean;
  isInstallingTectonic: boolean;

  // Modals
  showAddLanguageModal: boolean;
  showAddSectionModal: boolean;
  showPresetModal: boolean;
  showImportTexModal: boolean;

  // Toast
  toastMessage: string;
  toastType: 'info' | 'success' | 'error';

  // Core Lifecycle & Mutators
  initialize: () => Promise<void>;
  updateData: (updater: (draft: CvData) => void) => void;
  setData: (newData: CvData) => void;
  scheduleSave: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;

  // UI Setters
  setActiveNav: (nav: ActiveNavTab) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setTexSubTab: (tab: TexSubTab) => void;
  toggleExpand: (id: string) => void;
  setBilingualEdit: (val: boolean) => void;
  setZoom: (zoom: number) => void;
  setTopNCount: (n: number) => void;
  setJobOfferText: (txt: string) => void;
  setJobTargetRole: (role: string) => void;
  setJobCompany: (comp: string) => void;
  setPageFillPercent: (pct: number) => void;
  setShowCompileLog: (show: boolean) => void;
  setModal: (
    modal: 'addLanguage' | 'addSection' | 'preset' | 'importTex',
    open: boolean
  ) => void;

  // Language Management
  setLanguage: (code: string) => void;
  addLanguage: (params: {
    code: string;
    name: string;
    flag: string;
    cloneFrom: string;
  }) => void;

  // Section & Item Reordering / CRUD
  moveSection: (index: number, direction: -1 | 1) => void;
  toggleSectionEnabled: (secId: string) => void;
  createCustomSection: (params: {
    titleEn: string;
    titleFr: string;
    type: 'custom_entries' | 'custom_bullets';
  }) => void;
  deleteCustomSection: (secId: string) => void;
  addCustomSectionItem: (secId: string) => void;

  addProject: () => void;
  removeProject: (idx: number) => void;
  moveProject: (idx: number, direction: -1 | 1) => void;
  setAllProjects: (enabled: boolean) => void;

  addExperience: () => void;
  removeExperience: (idx: number) => void;
  moveExperience: (idx: number, direction: -1 | 1) => void;
  addExperienceBullet: (expIdx: number) => void;
  removeExperienceBullet: (expIdx: number, bulletIdx: number) => void;

  addEducation: () => void;
  removeEducation: (idx: number) => void;
  moveEducation: (idx: number, direction: -1 | 1) => void;

  addSkillCategory: () => void;
  removeSkillCategory: (idx: number) => void;
  moveSkillCategory: (idx: number, direction: -1 | 1) => void;

  addCertification: () => void;
  removeCertification: (idx: number) => void;
  moveCertification: (idx: number, direction: -1 | 1) => void;

  addSpokenLanguage: () => void;
  removeSpokenLanguage: (idx: number) => void;
  moveSpokenLanguage: (idx: number, direction: -1 | 1) => void;

  // Job Tailoring & Presets
  autoSelectTopProjects: (count?: number) => void;
  applyPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string, company: string) => void;
  updateActivePreset: () => void;
  deleteActivePreset: () => void;

  // LaTeX, PDF Compilation & File Exports
  compileLatexPdf: () => Promise<void>;
  syncTexToRepo: () => Promise<void>;
  copyActiveTexCode: () => Promise<void>;
  exportActiveTexFile: () => Promise<void>;
  exportCompiledPdfFile: () => Promise<void>;
  openCompiledPdfInSystem: () => Promise<void>;
  exportJsonBackup: () => Promise<void>;
  importJsonData: (jsonText: string) => void;
  importTexSource: (texText: string) => void;
  loadSampleTemplate: () => Promise<void>;
  resetToBlankCv: () => void;
  installTectonic: () => Promise<void>;
}

export const useCvStore = create<CvStoreState>((set, get) => ({
  data: JSON.parse(JSON.stringify(sampleCvData)) as unknown as CvData,
  loading: true,
  saveStatus: 'Saved',
  activeNav: 'projects',
  previewMode: 'a4',
  texSubTab: 'standalone',
  expandedId: null,
  bilingualEdit: false,
  zoom: 1.0,
  topNCount: 5,

  jobOfferText: '',
  jobTargetRole: '',
  jobCompany: '',

  pageFillPercent: 90,

  compilerInfo: {
    available: false,
    engine: null,
    path: null,
    version: 'Checking...',
  },
  isCompiling: false,
  compiledPdfBase64: '',
  compiledPdfPath: '',
  compileLog: '',
  compileError: '',
  showCompileLog: false,
  isInstallingTectonic: false,

  showAddLanguageModal: false,
  showAddSectionModal: false,
  showPresetModal: false,
  showImportTexModal: false,

  toastMessage: '',
  toastType: 'info',

  initialize: async () => {
    set({ loading: true });
    try {
      const payload = await apiGetInitialState();
      if (payload.ok && payload.data) {
        const d = payload.data;
        const preset = getActivePreset(d);
        const lang = d.meta?.activeLanguage || 'en';
        set({
          data: d,
          compilerInfo: payload.compiler || {
            available: false,
            engine: null,
            path: null,
            version: 'Unavailable',
          },
          jobOfferText: preset?.jobDescription || '',
          jobCompany: preset?.company || '',
          jobTargetRole:
            loc(preset?.customTitle, lang) || loc(d.profile?.title, lang),
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  updateData: (updater) => {
    const state = get();
    const next: CvData = JSON.parse(JSON.stringify(state.data));
    updater(next);
    // Automatically sync active Role Profile whenever user modifies anything
    syncActivePresetInDraft(next, state.jobOfferText, state.jobCompany);
    set({ data: next });
    get().scheduleSave();
  },

  setData: (newData) => {
    set({ data: newData });
    get().scheduleSave();
  },

  scheduleSave: () => {
    set({ saveStatus: 'Saving...' });
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      try {
        const ok = await apiSaveCvData(get().data);
        set({ saveStatus: ok ? 'Saved' : 'Local backup' });
      } catch {
        set({ saveStatus: 'Local backup' });
      }
    }, 350);
  },

  showToast: (msg, type = 'success') => {
    set({ toastMessage: msg, toastType: type });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      set({ toastMessage: '' });
    }, 3400);
  },

  setActiveNav: (nav) => set({ activeNav: nav }),
  setPreviewMode: (mode) => {
    set({ previewMode: mode });
    if (mode === 'pdf' && !get().compiledPdfBase64 && !get().isCompiling) {
      get().compileLatexPdf();
    }
  },
  setTexSubTab: (tab) => set({ texSubTab: tab }),
  toggleExpand: (id) =>
    set((s) => ({ expandedId: s.expandedId === id ? null : id })),
  setBilingualEdit: (val) => set({ bilingualEdit: val }),
  setZoom: (zoom) => set({ zoom }),
  setTopNCount: (topNCount) => set({ topNCount }),
  setJobOfferText: (jobOfferText) => {
    set({ jobOfferText });
    get().updateData((d) => {
      syncActivePresetInDraft(d, jobOfferText, get().jobCompany);
    });
  },
  setJobTargetRole: (jobTargetRole) => set({ jobTargetRole }),
  setJobCompany: (jobCompany) => {
    set({ jobCompany });
    get().updateData((d) => {
      syncActivePresetInDraft(d, get().jobOfferText, jobCompany);
    });
  },
  setPageFillPercent: (pageFillPercent) => set({ pageFillPercent }),
  setShowCompileLog: (showCompileLog) => set({ showCompileLog }),
  setModal: (modal, open) => {
    if (modal === 'addLanguage') set({ showAddLanguageModal: open });
    if (modal === 'addSection') set({ showAddSectionModal: open });
    if (modal === 'preset') set({ showPresetModal: open });
    if (modal === 'importTex') set({ showImportTexModal: open });
  },

  setLanguage: (code) => {
    get().updateData((d) => {
      d.meta.activeLanguage = code;
    });
  },

  addLanguage: ({ code, name, flag, cloneFrom }) => {
    const cleanCode = code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '');
    const cleanName = name.trim();
    if (!cleanCode || !cleanName) {
      get().showToast('Please enter a language code and name', 'error');
      return;
    }
    const langs = get().data.meta.languages || [];
    if (langs.some((l) => l.code === cleanCode)) {
      get().showToast(`Language "${cleanCode}" already exists`, 'error');
      return;
    }

    const source = cloneFrom || 'en';
    get().updateData((d) => {
      d.meta.languages.push({
        code: cleanCode,
        name: cleanName,
        flag: flag || '🌐',
      });

      const cloneLocTree = (node: unknown) => {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(cloneLocTree);
          return;
        }
        const rec = node as Record<string, unknown>;
        if (typeof rec[source] === 'string' || typeof rec.en === 'string') {
          if (rec[cleanCode] === undefined) {
            rec[cleanCode] = (rec[source] as string) || (rec.en as string) || '';
          }
          return;
        }
        Object.values(rec).forEach(cloneLocTree);
      };

      cloneLocTree(d.profile);
      cloneLocTree(d.sections);
      cloneLocTree(d.education);
      cloneLocTree(d.experience);
      cloneLocTree(d.projects);
      cloneLocTree(d.skills);
      cloneLocTree(d.certifications);
      cloneLocTree(d.spokenLanguages);
      cloneLocTree(d.customSections);
      d.meta.activeLanguage = cleanCode;
    });

    set({ showAddLanguageModal: false });
    get().showToast(`Added language: ${cleanName} (${cleanCode.toUpperCase()})`);
  },

  moveSection: (index, direction) => {
    get().updateData((d) => {
      const target = index + direction;
      if (target < 0 || target >= d.sections.length) return;
      const [item] = d.sections.splice(index, 1);
      d.sections.splice(target, 0, item);
    });
  },

  toggleSectionEnabled: (secId) => {
    get().updateData((d) => {
      const s = d.sections.find((sec) => sec.id === secId);
      if (s) s.enabled = !s.enabled;
    });
  },

  createCustomSection: ({ titleEn, titleFr, type }) => {
    const cleanEn = titleEn.trim();
    const cleanFr = titleFr.trim() || cleanEn;
    if (!cleanEn) {
      get().showToast('Please enter a section title', 'error');
      return;
    }
    const id = `custom-${Date.now()}`;
    get().updateData((d) => {
      const titleObj = makeLocField(d.meta.languages, cleanEn);
      titleObj.en = cleanEn;
      if (titleObj.fr !== undefined) titleObj.fr = cleanFr;

      d.sections.push({
        id,
        type: type as SectionType,
        enabled: true,
        title: titleObj,
      });
      if (!d.customSections) d.customSections = {};
      d.customSections[id] = [
        {
          id: `${id}-item-1`,
          enabled: true,
          title: makeLocField(d.meta.languages, 'Item Title'),
          subtitle: makeLocField(d.meta.languages, 'Organization / Context'),
          dates: makeLocField(d.meta.languages, '2026'),
          description: makeLocField(
            d.meta.languages,
            'Details or accomplishments...'
          ),
        },
      ];
    });
    set({
      showAddSectionModal: false,
      activeNav: `custom:${id}`,
    });
    get().showToast(`Created section "${cleanEn}"`);
  },

  deleteCustomSection: (secId) => {
    get().updateData((d) => {
      d.sections = d.sections.filter((s) => s.id !== secId);
      if (d.customSections && d.customSections[secId]) {
        delete d.customSections[secId];
      }
    });
    set({ activeNav: 'projects' });
  },

  addCustomSectionItem: (secId) => {
    const itemId = `${secId}-item-${Date.now()}`;
    get().updateData((d) => {
      if (!d.customSections[secId]) d.customSections[secId] = [];
      d.customSections[secId].push({
        id: itemId,
        enabled: true,
        title: makeLocField(d.meta.languages, 'New Entry'),
        subtitle: makeLocField(d.meta.languages, ''),
        dates: makeLocField(d.meta.languages, '2026'),
        description: makeLocField(d.meta.languages, 'Description...'),
      });
    });
    set({ expandedId: itemId });
  },

  addProject: () => {
    const id = `proj-${Date.now()}`;
    get().updateData((d) => {
      d.projects.unshift({
        id,
        enabled: true,
        profiles: [],
        name: makeLocField(d.meta.languages, 'New Technical Project'),
        techStack: makeLocField(d.meta.languages, 'Python, FastAPI, Docker'),
        description: makeLocField(
          d.meta.languages,
          'Designed and implemented...'
        ),
        tags: ['python', 'fastapi', 'docker'],
      });
    });
    set({ expandedId: id });
  },

  removeProject: (idx) => {
    get().updateData((d) => {
      d.projects.splice(idx, 1);
    });
  },

  moveProject: (idx, direction) => {
    get().updateData((d) => {
      const target = idx + direction;
      if (target < 0 || target >= d.projects.length) return;
      const [item] = d.projects.splice(idx, 1);
      d.projects.splice(target, 0, item);
    });
  },

  setAllProjects: (enabled) => {
    get().updateData((d) => {
      d.projects.forEach((p) => {
        p.enabled = enabled;
      });
    });
  },

  addExperience: () => {
    const id = `exp-${Date.now()}`;
    get().updateData((d) => {
      d.experience.unshift({
        id,
        enabled: true,
        role: makeLocField(d.meta.languages, 'AI / Software Engineer'),
        company: makeLocField(d.meta.languages, 'Company Name'),
        dates: makeLocField(d.meta.languages, '2026 -- Present'),
        bullets: [
          {
            id: `${id}-b1`,
            enabled: true,
            text: makeLocField(
              d.meta.languages,
              'Developed and deployed production services using \\texttt{Python, FastAPI, Docker}.'
            ),
          },
        ],
      });
    });
    set({ expandedId: id });
  },

  removeExperience: (idx) => {
    get().updateData((d) => {
      d.experience.splice(idx, 1);
    });
  },

  moveExperience: (idx, direction) => {
    get().updateData((d) => {
      const target = idx + direction;
      if (target < 0 || target >= d.experience.length) return;
      const [item] = d.experience.splice(idx, 1);
      d.experience.splice(target, 0, item);
    });
  },

  addExperienceBullet: (expIdx) => {
    get().updateData((d) => {
      const exp = d.experience[expIdx];
      if (!exp) return;
      exp.bullets.push({
        id: `${exp.id}-b${Date.now()}`,
        enabled: true,
        text: makeLocField(
          d.meta.languages,
          'Key achievement or technical implementation...'
        ),
      });
    });
  },

  removeExperienceBullet: (expIdx, bulletIdx) => {
    get().updateData((d) => {
      const exp = d.experience[expIdx];
      if (!exp) return;
      exp.bullets.splice(bulletIdx, 1);
    });
  },

  addEducation: () => {
    const id = `edu-${Date.now()}`;
    get().updateData((d) => {
      d.education.unshift({
        id,
        enabled: true,
        degree: makeLocField(d.meta.languages, 'Degree / Diploma Title'),
        dates: makeLocField(d.meta.languages, '2024 -- 2026'),
        institution: makeLocField(d.meta.languages, 'University / Institution'),
      });
    });
    set({ expandedId: id });
  },

  removeEducation: (idx) => {
    get().updateData((d) => {
      d.education.splice(idx, 1);
    });
  },

  moveEducation: (idx, direction) => {
    get().updateData((d) => {
      const target = idx + direction;
      if (target < 0 || target >= d.education.length) return;
      const [item] = d.education.splice(idx, 1);
      d.education.splice(target, 0, item);
    });
  },

  addSkillCategory: () => {
    const id = `skill-${Date.now()}`;
    get().updateData((d) => {
      d.skills.push({
        id,
        enabled: true,
        category: makeLocField(d.meta.languages, 'Category Name'),
        items: makeLocField(d.meta.languages, 'Tool 1, Tool 2, Framework 3.'),
      });
    });
    set({ expandedId: id });
  },

  removeSkillCategory: (idx) => {
    get().updateData((d) => {
      d.skills.splice(idx, 1);
    });
  },

  moveSkillCategory: (idx, direction) => {
    get().updateData((d) => {
      const target = idx + direction;
      if (target < 0 || target >= d.skills.length) return;
      const [item] = d.skills.splice(idx, 1);
      d.skills.splice(target, 0, item);
    });
  },

  addCertification: () => {
    const id = `cert-${Date.now()}`;
    get().updateData((d) => {
      d.certifications.push({
        id,
        enabled: true,
        title: makeLocField(d.meta.languages, 'Certification Name'),
        issuer: makeLocField(d.meta.languages, 'Issuing Organization'),
      });
    });
    set({ expandedId: id });
  },

  removeCertification: (idx) => {
    get().updateData((d) => {
      d.certifications.splice(idx, 1);
    });
  },

  moveCertification: (idx, direction) => {
    get().updateData((d) => {
      const target = idx + direction;
      if (target < 0 || target >= d.certifications.length) return;
      const [item] = d.certifications.splice(idx, 1);
      d.certifications.splice(target, 0, item);
    });
  },

  addSpokenLanguage: () => {
    const id = `lang-${Date.now()}`;
    get().updateData((d) => {
      d.spokenLanguages.push({
        id,
        enabled: true,
        language: makeLocField(d.meta.languages, 'Language'),
        level: makeLocField(d.meta.languages, 'Professional'),
      });
    });
  },

  removeSpokenLanguage: (idx) => {
    get().updateData((d) => {
      d.spokenLanguages.splice(idx, 1);
    });
  },

  moveSpokenLanguage: (idx, direction) => {
    get().updateData((d) => {
      const target = idx + direction;
      if (target < 0 || target >= d.spokenLanguages.length) return;
      const [item] = d.spokenLanguages.splice(idx, 1);
      d.spokenLanguages.splice(target, 0, item);
    });
  },

  autoSelectTopProjects: (countOverride) => {
    const count = countOverride ?? get().topNCount;
    const kws = extractJobKeywords(get().jobOfferText, get().data);
    get().updateData((d) => {
      const scored = d.projects.map((p) => ({
        proj: p,
        score: scoreProjectMatch(p, kws).score,
      }));
      scored.sort((a, b) => b.score - a.score);
      d.projects = scored.map((s) => s.proj);
      d.projects.forEach((p, idx) => {
        p.enabled = idx < count;
      });
    });
    get().showToast(`Selected & ranked top ${count} matching projects`);
  },

  applyPreset: (presetId) => {
    const cur = get().data;
    const preset = (cur.jobPresets || []).find((p) => p.id === presetId);
    if (!preset) return;

    get().updateData((d) => {
      d.meta.activePresetId = preset.id;
      if (
        preset.language &&
        d.meta.languages.some((l) => l.code === preset.language)
      ) {
        d.meta.activeLanguage = preset.language;
      }
      if (preset.customTitle) {
        d.meta.languages.forEach((l) => {
          const t = preset.customTitle?.[l.code];
          if (t) d.profile.title[l.code] = t;
        });
      }
      if (!d.profile._baseSummary) {
        d.profile._baseSummary = JSON.parse(
          JSON.stringify(d.profile.summary || {})
        );
      }
      d.meta.languages.forEach((l) => {
        const s = preset.customSummary?.[l.code];
        if (s && s.trim() !== '') {
          d.profile.summary[l.code] = s;
        } else if (d.profile._baseSummary?.[l.code]) {
          d.profile.summary[l.code] = d.profile._baseSummary[l.code];
        }
      });

      if (Array.isArray(preset.enabledProjects)) {
        const enabledSet = new Set(preset.enabledProjects);
        d.projects.forEach((p) => {
          p.enabled = enabledSet.has(p.id);
        });
        d.projects.sort((a, b) => (a.number || 99) - (b.number || 99));
      }
      if (Array.isArray(preset.enabledExperiences)) {
        const expSet = new Set(preset.enabledExperiences);
        d.experience.forEach((e) => {
          e.enabled = expSet.has(e.id);
        });
      }
      if (Array.isArray(preset.enabledCertifications)) {
        const certSet = new Set(preset.enabledCertifications);
        d.certifications.forEach((c) => {
          c.enabled = certSet.has(c.id);
        });
      }
    });

    const updated = get().data;
    const activeLang = updated.meta.activeLanguage || 'en';
    set({
      jobOfferText: preset.jobDescription || '',
      jobCompany: preset.company || '',
      jobTargetRole: loc(updated.profile.title, activeLang),
      compiledPdfBase64: '',
      compiledPdfPath: '',
    });

    if (get().previewMode === 'pdf') {
      get().compileLatexPdf();
    }
    get().showToast(`Loaded preset: ${preset.name}`);
  },

  saveCurrentAsPreset: (name, company) => {
    const cleanName = name.trim();
    if (!cleanName) {
      get().showToast('Please enter a preset name', 'error');
      return;
    }
    const id = `preset-${Date.now()}`;
    const state = get();
    get().updateData((d) => {
      d.jobPresets.push({
        id,
        name: cleanName,
        shortName: cleanName,
        company: company.trim() || state.jobCompany,
        jobDescription: state.jobOfferText,
        language: d.meta.activeLanguage,
        customTitle: JSON.parse(JSON.stringify(d.profile.title)),
        customSummary: JSON.parse(JSON.stringify(d.profile.summary)),
        enabledProjects: d.projects.filter((p) => p.enabled).map((p) => p.id),
        enabledExperiences: d.experience
          .filter((e) => e.enabled)
          .map((e) => e.id),
        enabledCertifications: d.certifications
          .filter((c) => c.enabled)
          .map((c) => c.id),
      });
      d.meta.activePresetId = id;
    });
    set({ showPresetModal: false });
    get().showToast(`Saved job preset: ${cleanName}`);
  },

  updateActivePreset: () => {
    const state = get();
    const activeId = state.data.meta.activePresetId;
    const preset = state.data.jobPresets.find((p) => p.id === activeId);
    if (!preset) return;
    get().updateData((d) => {
      const target = d.jobPresets.find((p) => p.id === activeId);
      if (!target) return;
      target.jobDescription = state.jobOfferText;
      target.company = state.jobCompany;
      target.language = d.meta.activeLanguage;
      target.customTitle = JSON.parse(JSON.stringify(d.profile.title));
      target.customSummary = JSON.parse(JSON.stringify(d.profile.summary));
      target.enabledProjects = d.projects
        .filter((p) => p.enabled)
        .map((p) => p.id);
      target.enabledExperiences = d.experience
        .filter((e) => e.enabled)
        .map((e) => e.id);
      target.enabledCertifications = d.certifications
        .filter((c) => c.enabled)
        .map((c) => c.id);
    });
    get().showToast(`Updated preset: ${preset.name}`);
  },

  deleteActivePreset: () => {
    const presets = get().data.jobPresets;
    if (presets.length <= 1) {
      get().showToast('Cannot delete the last remaining preset', 'error');
      return;
    }
    const activeId = get().data.meta.activePresetId;
    const remaining = presets.filter((p) => p.id !== activeId);
    get().updateData((d) => {
      d.jobPresets = remaining;
    });
    get().applyPreset(remaining[0].id);
  },

  compileLatexPdf: async () => {
    const state = get();
    if (state.isCompiling) return;
    set({ isCompiling: true, compileError: '' });
    try {
      const d = state.data;
      const lang = d.meta.activeLanguage || 'en';
      const texSource = generateStandaloneTex(d, lang);
      const basename = getPdfExportBasename(d, lang);
      const mainTex = generateMainTex(d, lang);
      const bodyFiles = generateAllBodyTexMap(d);

      const res = await apiCompileLatex({
        texSource,
        basename,
        data: d,
        mainTex,
        bodyFiles,
      });

      set({ compileLog: res.log || '' });
      if (res.ok && res.pdfBase64) {
        set({
          compiledPdfBase64: res.pdfBase64,
          compiledPdfPath: res.pdfPath || '',
          previewMode: 'pdf',
        });
        get().showToast(
          `Compiled ${getPdfExportFilename(d, lang)} (${res.elapsedMs ?? 0}ms)`
        );
      } else {
        const err = res.error || 'LaTeX compilation failed';
        set({ compileError: err, showCompileLog: true });
        get().showToast(err, 'error');
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      set({ compileError: err, showCompileLog: true });
      get().showToast(err, 'error');
    } finally {
      set({ isCompiling: false });
    }
  },

  syncTexToRepo: async () => {
    const d = get().data;
    const lang = d.meta.activeLanguage || 'en';
    const mainTex = generateMainTex(d, lang);
    const bodyFiles = generateAllBodyTexMap(d);
    try {
      const res = await apiSyncTexFiles(d, mainTex, bodyFiles);
      if (res.ok) {
        get().showToast(`Synced: ${(res.written || []).join(', ')}`);
      } else {
        get().showToast('Sync requires Tauri Desktop runtime', 'error');
      }
    } catch (e) {
      get().showToast(
        `Sync failed: ${e instanceof Error ? e.message : String(e)}`,
        'error'
      );
    }
  },

  copyActiveTexCode: async () => {
    const { data, texSubTab } = get();
    const lang = data.meta.activeLanguage || 'en';
    const code =
      texSubTab === 'main'
        ? generateMainTex(data, lang)
        : texSubTab === 'body'
          ? generateBodyTex(data, lang)
          : generateStandaloneTex(data, lang);
    await navigator.clipboard.writeText(code);
    get().showToast('Copied LaTeX source to clipboard');
  },

  exportActiveTexFile: async () => {
    const { data, texSubTab } = get();
    const lang = data.meta.activeLanguage || 'en';
    const filename =
      texSubTab === 'main'
        ? 'main.tex'
        : texSubTab === 'body'
          ? `cv_latex_${lang}.tex`
          : `${getPdfExportBasename(data, lang)}.tex`;
    const content =
      texSubTab === 'main'
        ? generateMainTex(data, lang)
        : texSubTab === 'body'
          ? generateBodyTex(data, lang)
          : generateStandaloneTex(data, lang);

    const res = await apiSaveExportFile({
      filename,
      content,
      isBase64: false,
      mimeType: 'text/plain;charset=utf-8',
    });
    if (res.ok) {
      get().showToast(`Saved ${res.savedPath || filename}`);
    }
  },

  exportCompiledPdfFile: async () => {
    const { data, compiledPdfBase64 } = get();
    if (!compiledPdfBase64) {
      get().showToast('Compile the LaTeX PDF first', 'error');
      return;
    }
    const filename = getPdfExportFilename(data);
    const res = await apiSaveExportFile({
      filename,
      content: compiledPdfBase64,
      isBase64: true,
      mimeType: 'application/pdf',
    });
    if (res.ok) {
      get().showToast(`Saved PDF to ${res.savedPath || filename}`);
    }
  },

  openCompiledPdfInSystem: async () => {
    const { compiledPdfPath } = get();
    if (!compiledPdfPath) {
      get().showToast('No compiled PDF file on disk yet', 'error');
      return;
    }
    try {
      await apiOpenInSystem(compiledPdfPath);
    } catch (e) {
      get().showToast(
        `Could not open external viewer: ${e instanceof Error ? e.message : String(e)}`,
        'error'
      );
    }
  },

  exportJsonBackup: async () => {
    const { data } = get();
    const filename = `cv_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const res = await apiSaveExportFile({
      filename,
      content: JSON.stringify(data, null, 2),
      isBase64: false,
      mimeType: 'application/json',
    });
    if (res.ok) {
      get().showToast(`Exported JSON to ${res.savedPath || filename}`);
    }
  },

  importJsonData: (jsonText) => {
    try {
      const parsed = JSON.parse(jsonText) as CvData;
      if (parsed && parsed.profile && parsed.sections) {
        get().setData(parsed);
        get().showToast('Imported CV JSON database');
      } else {
        get().showToast('Invalid CV JSON structure', 'error');
      }
    } catch {
      get().showToast('Failed to parse JSON file', 'error');
    }
  },

  importTexSource: (texText) => {
    const clean = (texText || '').trim();
    if (!clean) {
      get().showToast('Paste or select a LaTeX CV file first', 'error');
      return;
    }
    const { updated, projectCount } = parseTexIntoCvData(clean, get().data);
    get().setData(updated);
    set({ showImportTexModal: false });
    get().showToast(`Imported LaTeX CV (${projectCount} projects extracted)`);
  },

  loadSampleTemplate: async () => {
    try {
      const sample = await apiLoadSampleTemplate();
      get().setData(sample);
      set({ compiledPdfBase64: '', compiledPdfPath: '' });
      get().showToast('Loaded public sample CV template');
    } catch {
      get().showToast('Could not load sample template', 'error');
    }
  },

  resetToBlankCv: () => {
    get().updateData((d) => {
      const langs = d.meta.languages;
      d.profile = {
        name: 'Your Name',
        phone: '+1 234 567 890',
        email: 'you@example.com',
        linkedinUrl: 'https://linkedin.com/in/yourprofile',
        linkedinLabel: makeLocField(langs, 'LinkedIn'),
        githubUrl: 'https://github.com/yourprofile',
        githubLabel: makeLocField(langs, 'GitHub'),
        location: makeLocField(langs, ''),
        title: makeLocField(langs, 'Software & AI Engineer'),
        summary: makeLocField(
          langs,
          'Write a concise 2-3 sentence summary highlighting your core expertise and impact.'
        ),
      };
      d.education = [];
      d.experience = [];
      d.projects = [];
      d.skills = [];
      d.certifications = [];
      d.spokenLanguages = [];
      d.customSections = {};
      d.jobPresets = [
        {
          id: 'preset-default',
          name: 'Default Profile',
          shortName: 'default',
          company: '',
          jobDescription: '',
          language: d.meta.activeLanguage,
          customTitle: makeLocField(langs, 'Software & AI Engineer'),
          customSummary: makeLocField(langs, ''),
          enabledProjects: [],
          enabledExperiences: [],
          enabledCertifications: [],
        },
      ];
      d.meta.activePresetId = 'preset-default';
    });
    set({
      activeNav: 'profile',
      compiledPdfBase64: '',
      compiledPdfPath: '',
    });
    get().showToast('Initialized clean blank CV');
  },

  installTectonic: async () => {
    set({ isInstallingTectonic: true });
    try {
      const res = await apiInstallTectonic();
      if (res.ok && res.compiler) {
        set({ compilerInfo: res.compiler });
        get().showToast(`Installed ${res.compiler.version}`);
      } else {
        get().showToast(res.error || 'Failed to install Tectonic', 'error');
      }
    } catch (e) {
      get().showToast(
        `Failed to install Tectonic: ${e instanceof Error ? e.message : String(e)}`,
        'error'
      );
    } finally {
      set({ isInstallingTectonic: false });
    }
  },
}));
