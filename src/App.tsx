import React, { useEffect } from 'react';
import { useCvStore } from './store/useCvStore';
import { TopNavbar } from './components/layout/TopNavbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { EditorPane } from './components/editor/EditorPane';
import { PreviewCanvas } from './components/preview/PreviewCanvas';
import { Toast } from './components/layout/Toast';
import { AddLanguageModal } from './components/modals/AddLanguageModal';
import { AddSectionModal } from './components/modals/AddSectionModal';
import { SavePresetModal } from './components/modals/SavePresetModal';
import { ImportTexModal } from './components/modals/ImportTexModal';

export const App: React.FC = () => {
  const { data, initialize } = useCvStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    const s = data?.meta?.style;
    if (!s) return;
    const root = document.documentElement;
    root.style.setProperty('--cv-main-color', s.mainColor || '#0D3880');
    root.style.setProperty('--cv-dark-gray', s.darkGray || '#282828');
    root.style.setProperty('--cv-margin-cm', `${s.marginCm || 1.5}cm`);
    root.style.setProperty('--cv-font-size', s.fontSize || '11pt');
    root.style.setProperty('--cv-sec-before', `${s.sectionSpacingPt ?? 14}pt`);
    root.style.setProperty('--cv-sec-after', `${s.sectionAfterPt ?? 8}pt`);
    root.style.setProperty('--cv-proj-sep', `${s.projectItemSepPt ?? 6}pt`);
    root.style.setProperty('--cv-skill-sep', `${s.skillsItemSepPt ?? 3}pt`);
    root.style.setProperty('--cv-exp-sep', `${s.expSpacingPt ?? 2}pt`);
  }, [data?.meta?.style]);

  return (
    <div className="h-full flex flex-col overflow-hidden select-none">
      <TopNavbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftSidebar />
        <EditorPane />
        <PreviewCanvas />
      </div>
      <AddLanguageModal />
      <AddSectionModal />
      <SavePresetModal />
      <ImportTexModal />
      <Toast />
    </div>
  );
};

export default App;
