import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { extractJobKeywords } from '../../lib/job-matcher';
import type { ActiveNavTab, CvSection } from '../../types/cv';
import { Checkbox } from '../ui/Checkbox';

export const LeftSidebar: React.FC = () => {
  const {
    data,
    activeNav,
    jobOfferText,
    compilerInfo,
    isInstallingTectonic,
    setActiveNav,
    setModal,
    moveSection,
    toggleSectionEnabled,
    loadSampleTemplate,
    resetToBlankCv,
    exportJsonBackup,
    importJsonData,
    installTectonic,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const matchedKeywords = extractJobKeywords(jobOfferText, data);

  const getSectionNavId = (sec: CvSection): ActiveNavTab =>
    sec.type === 'custom_entries' || sec.type === 'custom_bullets'
      ? `custom:${sec.id}`
      : sec.type;

  const handleJsonFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        importJsonData(ev.target.result);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <aside className="no-print w-52 bg-zinc-50/90 border-r border-zinc-200/80 flex flex-col justify-between shrink-0 overflow-y-auto py-3 px-2">
      <div className="space-y-4">
        {/* Job Tailoring Primary Nav */}
        <div>
          <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Tailoring
          </div>
          <button
            onClick={() => setActiveNav('tailor')}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs border transition cursor-pointer ${
              activeNav === 'tailor'
                ? 'bg-blue-50 text-[#0D3880] font-semibold border-blue-200/80'
                : 'text-zinc-600 hover:bg-zinc-100 font-medium border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🎯</span>
              <span>Job Tailoring</span>
            </span>
            {matchedKeywords.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                {matchedKeywords.length} kw
              </span>
            )}
          </button>
        </div>

        {/* CV Sections List (Reorderable + Quick Enable/Disable) */}
        <div>
          <div className="px-2 mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              CV Sections
            </span>
            <button
              onClick={() => setModal('addSection', true)}
              className="text-[11px] text-[#0D3880] hover:underline font-medium cursor-pointer"
            >
              + Add
            </button>
          </div>

          <div className="space-y-0.5">
            {/* Header & Contact Fixed Item */}
            <button
              onClick={() => setActiveNav('profile')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition cursor-pointer ${
                activeNav === 'profile'
                  ? 'bg-white text-zinc-900 font-semibold shadow-2xs border-zinc-200/90'
                  : 'text-zinc-600 hover:bg-zinc-100 font-medium border-transparent'
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-zinc-400">👤</span>
                <span className="truncate">Header & Contact</span>
              </span>
            </button>

            {/* Dynamic Ordered Sections */}
            {(data.sections || []).map((sec, sIdx) => {
              const navId = getSectionNavId(sec);
              const isActive = activeNav === navId;
              return (
                <div
                  key={sec.id}
                  className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs border transition ${
                    isActive
                      ? 'bg-white text-zinc-900 font-semibold shadow-2xs border-zinc-200/90'
                      : 'text-zinc-600 hover:bg-zinc-100 font-medium border-transparent'
                  }`}
                >
                  <button
                    onClick={() => setActiveNav(navId)}
                    className={`flex-1 flex items-center gap-2 text-left truncate cursor-pointer ${
                      !sec.enabled ? 'opacity-45 line-through' : ''
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        sec.enabled ? 'bg-[#0D3880]' : 'bg-zinc-300'
                      }`}
                    />
                    <span className="truncate">{loc(sec.title, lang)}</span>
                  </button>

                  {/* Item Counter + Reorder + Shadcn Checkbox */}
                  <div className="flex items-center gap-1 shrink-0">
                    {sec.type === 'projects' && (
                      <span className="text-[10px] text-zinc-400 font-normal">
                        {data.projects.filter((p) => p.enabled).length}/
                        {data.projects.length}
                      </span>
                    )}
                    {sec.type === 'experience' && (
                      <span className="text-[10px] text-zinc-400 font-normal">
                        {data.experience.filter((e) => e.enabled).length}/
                        {data.experience.length}
                      </span>
                    )}
                    {sec.type === 'certifications' && (
                      <span className="text-[10px] text-zinc-400 font-normal">
                        {data.certifications.filter((c) => c.enabled).length}/
                        {data.certifications.length}
                      </span>
                    )}

                    <div className="hidden group-hover:flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(sIdx, -1);
                        }}
                        className="p-0.5 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                        title="Move section up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveSection(sIdx, 1);
                        }}
                        className="p-0.5 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                        title="Move section down"
                      >
                        ↓
                      </button>
                    </div>

                    <Checkbox
                      size="sm"
                      checked={sec.enabled}
                      onChange={() => toggleSectionEnabled(sec.id)}
                      onClick={(e) => e.stopPropagation()}
                      title="Include section in CV"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Appearance & Layout Settings */}
        <div>
          <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Formatting
          </div>
          <button
            onClick={() => setActiveNav('layout')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition cursor-pointer ${
              activeNav === 'layout'
                ? 'bg-white text-zinc-900 font-semibold shadow-2xs border-zinc-200/90'
                : 'text-zinc-600 hover:bg-zinc-100 font-medium border-transparent'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🎨</span>
              <span>Layout & Density</span>
            </span>
            <span className="text-[10px] text-zinc-400">
              {data.meta.style.fontSize}
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Data Backup / Restore Controls */}
      <div className="pt-3 border-t border-zinc-200/70 space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={loadSampleTemplate}
            title="Load public starter template"
            className="text-[10.5px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-md py-1 transition text-center cursor-pointer"
          >
            Sample CV
          </button>
          <button
            onClick={resetToBlankCv}
            title="Start a clean blank CV"
            className="text-[10.5px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-md py-1 transition text-center cursor-pointer"
          >
            Blank CV
          </button>
          <button
            onClick={() => setModal('importTex', true)}
            title="Import projects/info from an existing .tex file"
            className="text-[10.5px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-md py-1 transition text-center cursor-pointer"
          >
            Import .tex
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={exportJsonBackup}
            className="flex-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-md py-1.5 transition text-center cursor-pointer"
          >
            Export JSON
          </button>
          <label className="flex-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200/80 rounded-md py-1.5 transition text-center cursor-pointer">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleJsonFileImport}
              className="hidden"
            />
          </label>
        </div>
        <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1">
          <span className="truncate" title={compilerInfo.version}>
            Engine:{' '}
            <span className="text-zinc-600 font-medium">
              {compilerInfo.version}
            </span>
          </span>
          {!compilerInfo.available && (
            <button
              onClick={installTectonic}
              disabled={isInstallingTectonic}
              className="text-[10px] text-[#0D3880] hover:underline font-semibold shrink-0 cursor-pointer"
            >
              {isInstallingTectonic ? 'Installing...' : 'Install Tectonic'}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
