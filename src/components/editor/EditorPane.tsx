import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { JobTailoringView } from './JobTailoringView';
import { ProfileView } from './ProfileView';
import { SummaryView } from './SummaryView';
import { ProjectsView } from './ProjectsView';
import { ExperienceView } from './ExperienceView';
import { EducationView } from './EducationView';
import { SkillsView } from './SkillsView';
import { CertificationsView } from './CertificationsView';
import { LanguagesView } from './LanguagesView';
import { CustomSectionView } from './CustomSectionView';
import { LayoutDensityView } from './LayoutDensityView';
import { Switch } from '../ui/Switch';

export const EditorPane: React.FC = () => {
  const { data, activeNav, bilingualEdit, setBilingualEdit } = useCvStore();
  const lang = data.meta.activeLanguage || 'en';

  const getHeaderTitle = () => {
    if (activeNav === 'tailor') return '🎯 Job Offer Tailoring';
    if (activeNav === 'profile') return '👤 Header & Contact Info';
    if (activeNav === 'layout') return '🎨 Layout & Page Density';
    for (const sec of data.sections || []) {
      const navId = sec.type.startsWith('custom')
        ? `custom:${sec.id}`
        : sec.type;
      if (activeNav === navId) {
        return loc(sec.title, lang);
      }
    }
    return 'Editor';
  };

  return (
    <section className="no-print w-[400px] xl:w-[440px] bg-white border-r border-zinc-200/80 flex flex-col shrink-0 overflow-hidden select-text">
      {/* Sticky Editor Pane Header */}
      <div className="h-11 px-4 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900">
            {getHeaderTitle()}
          </h2>
        </div>

        {/* Shadcn-style Bilingual Edit Switch */}
        <Switch
          checked={bilingualEdit}
          onChange={setBilingualEdit}
          label="All languages"
        />
      </div>

      {/* Scrollable Editor Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeNav === 'tailor' && <JobTailoringView />}
        {activeNav === 'profile' && <ProfileView />}
        {activeNav === 'summary' && <SummaryView />}
        {activeNav === 'projects' && <ProjectsView />}
        {activeNav === 'experience' && <ExperienceView />}
        {activeNav === 'education' && <EducationView />}
        {activeNav === 'skills' && <SkillsView />}
        {activeNav === 'certifications' && <CertificationsView />}
        {activeNav === 'languages' && <LanguagesView />}
        {activeNav === 'layout' && <LayoutDensityView />}
        {activeNav.startsWith('custom:') && (
          <CustomSectionView sectionId={activeNav.replace('custom:', '')} />
        )}
      </div>
    </section>
  );
};
