import React from 'react';
import { RefreshCw, Printer, Play, Loader2, Plus } from 'lucide-react';
import { useCvStore } from '../../store/useCvStore';
import { getPdfExportBasename } from '../../lib/filename';
import { Select } from '../ui/Select';

export const TopNavbar: React.FC = () => {
  const {
    data,
    saveStatus,
    isCompiling,
    applyPreset,
    setModal,
    setLanguage,
    syncTexToRepo,
    setPreviewMode,
    compileLatexPdf,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const languages = data.meta.languages || [];

  const presetOptions = (data.jobPresets || []).map((preset) => {
    const count = Array.isArray(preset.enabledProjects)
      ? preset.enabledProjects.length
      : data.projects.filter((p) => p.enabled).length;
    return {
      value: preset.id,
      label: preset.name,
      badge: `${count} proj`,
      description: preset.company ? `Target: ${preset.company}` : undefined,
    };
  });

  const handlePrintA4 = () => {
    setPreviewMode('a4');
    const prevTitle = document.title;
    document.title = getPdfExportBasename(data, lang);
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 800);
    }, 80);
  };

  return (
    <header className="no-print h-13 bg-white border-b border-zinc-200/80 px-3.5 flex items-center justify-between shrink-0 z-30">
      {/* Left: Custom App Icon, Brand & Shadcn Preset Selector */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-2">
          <img
            src="/app-icon.svg"
            alt="CV Manager"
            className="w-7 h-7 rounded-lg shadow-2xs shrink-0"
          />
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            CV Manager
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-200 mx-0.5" />

        {/* Shadcn-style Role Preset Popover Select */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider hidden sm:inline">
            Profile
          </span>
          <Select
            value={data.meta.activePresetId}
            options={presetOptions}
            onChange={(val) => applyPreset(val)}
            triggerClassName="min-w-[175px]"
            menuClassName="w-64"
            footer={
              <button
                type="button"
                onClick={() => setModal('preset', true)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#0D3880] hover:bg-blue-50/80 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create or Manage Profile...</span>
              </button>
            }
          />

          <button
            onClick={() => setModal('preset', true)}
            title="Save as a new role profile or delete current profile"
            className="text-xs text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-2xs rounded-lg px-2 py-1.5 transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New</span>
          </button>
        </div>

        {/* Continuous Profile & CV Auto-Save status pill */}
        <div
          className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-500 bg-zinc-50 border border-zinc-200/70 rounded-full px-2.5 py-0.5"
          title="All changes to your CV and active Role Profile are saved automatically"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              saveStatus === 'Saved'
                ? 'bg-emerald-500'
                : 'bg-amber-400 animate-pulse'
            }`}
          />
          <span>{saveStatus === 'Saved' ? 'Auto-saved' : saveStatus}</span>
        </div>
      </div>

      {/* Center: Language Segmented Switcher */}
      <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/70">
        {languages.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`px-2.5 py-1 rounded-md text-xs transition flex items-center gap-1.5 cursor-pointer ${
              lang === l.code
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 font-medium'
            }`}
          >
            <span>{l.flag || '🌐'}</span>
            <span>{l.code.toUpperCase()}</span>
          </button>
        ))}
        <button
          onClick={() => setModal('addLanguage', true)}
          title="Add another language"
          className="px-2 py-1 rounded-md text-xs text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
        >
          +
        </button>
      </div>

      {/* Right: Export & Compile Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={syncTexToRepo}
          title="Write main.tex and cv_latex_<lang>.tex to project folder"
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-200/90 shadow-2xs rounded-lg px-2.5 py-1.5 transition hidden sm:flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500" />
          <span>Sync .tex</span>
        </button>

        <button
          onClick={handlePrintA4}
          title="Vector PDF via system A4 print"
          className="text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-zinc-600" />
          <span>Print A4</span>
        </button>

        <button
          onClick={compileLatexPdf}
          disabled={isCompiling}
          className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] disabled:opacity-60 rounded-lg px-3 py-1.5 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
        >
          {isCompiling ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isCompiling ? 'Compiling...' : 'Compile LaTeX PDF'}</span>
        </button>
      </div>
    </header>
  );
};
