import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { getActivePreset } from '../../lib/filename';
import { extractJobKeywords, scoreProjectMatch } from '../../lib/job-matcher';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

const TOP_N_OPTIONS = [
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '9', label: '9' },
];

export const JobTailoringView: React.FC = () => {
  const {
    data,
    jobOfferText,
    topNCount,
    applyPreset,
    setJobOfferText,
    setTopNCount,
    autoSelectTopProjects,
    setActiveNav,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const activePreset = getActivePreset(data);
  const extractedKeywords = extractJobKeywords(jobOfferText, data);
  const activeProjectsCount = (data.projects || []).filter(
    (p) => p.enabled
  ).length;

  return (
    <div className="space-y-4">
      {/* 1-Click Role Profile Pills */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            1-Click Role Profiles (Auto-saved)
          </span>
          <span className="text-[11px] text-zinc-400">
            {activeProjectsCount} active
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {(data.jobPresets || []).map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] border transition truncate text-center cursor-pointer ${
                data.meta.activePresetId === preset.id
                  ? 'bg-[#0D3880] text-white font-semibold border-[#0D3880] shadow-2xs'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200/90 font-medium'
              }`}
            >
              {preset.shortName || preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tailored Profile Name, Job Title & JD Box */}
      <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 space-y-3">
        {activePreset && (
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Profile Name
              </label>
              <input
                type="text"
                value={activePreset.name || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateData((d) => {
                    const p = d.jobPresets.find(
                      (pr) => pr.id === d.meta.activePresetId
                    );
                    if (p) {
                      p.name = val;
                      p.shortName = val;
                    }
                  });
                }}
                placeholder="e.g., GenAI / LLM"
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#0D3880]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                Target Company (Optional)
              </label>
              <input
                type="text"
                value={activePreset.company || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  updateData((d) => {
                    const p = d.jobPresets.find(
                      (pr) => pr.id === d.meta.activePresetId
                    );
                    if (p) {
                      p.company = val;
                    }
                  });
                }}
                placeholder="e.g., Mistral AI"
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#0D3880]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Tailored CV Job Title ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.profile.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.title[lang] = e.target.value;
              })
            }
            placeholder="e.g., AI & LLM Engineer / Data Engineer"
            className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#0D3880]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Paste Job Description / Offer
          </label>
          <textarea
            value={jobOfferText}
            onChange={(e) => setJobOfferText(e.target.value)}
            rows={4}
            placeholder="Paste the job posting here (English or French) to automatically score your projects, highlight matching skills, and select the best projects for 1 page..."
            className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#0D3880] leading-relaxed"
          />
        </div>

        {/* One-Click Auto-Tailor Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-600">Auto-select top</span>
            <Select
              value={String(topNCount)}
              options={TOP_N_OPTIONS}
              onChange={(val) => setTopNCount(Number(val))}
              triggerClassName="min-w-[54px] py-1 px-2"
              menuClassName="min-w-[80px]"
            />
            <span className="text-xs text-zinc-600">projects</span>
          </div>
          <button
            onClick={() => autoSelectTopProjects(topNCount)}
            className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-3 py-1.5 transition shadow-2xs cursor-pointer"
          >
            Rank & Select Best Projects
          </button>
        </div>
      </div>

      {/* Detected Keywords */}
      {extractedKeywords.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Matched Technical Keywords ({extractedKeywords.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {extractedKeywords.map((kw) => (
              <span
                key={kw}
                className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ranked Projects Quick Selection List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            Project Matrix & Selection ({activeProjectsCount}/
            {data.projects.length} selected)
          </span>
          <button
            onClick={() => setActiveNav('projects')}
            className="text-xs text-[#0D3880] hover:underline font-medium cursor-pointer"
          >
            Edit project details →
          </button>
        </div>

        <div className="space-y-1.5">
          {(data.projects || []).map((proj, idx) => {
            const match = scoreProjectMatch(proj, extractedKeywords);
            return (
              <div
                key={proj.id}
                onClick={() =>
                  updateData((d) => {
                    d.projects[idx].enabled = !d.projects[idx].enabled;
                  })
                }
                className={`flex items-start justify-between gap-3 p-2.5 rounded-xl border cursor-pointer hover:border-zinc-300 transition ${
                  proj.enabled
                    ? 'bg-white border-zinc-300 shadow-2xs'
                    : 'bg-zinc-50/70 border-zinc-200/70 opacity-65'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <Checkbox
                    checked={proj.enabled}
                    onChange={(checked) =>
                      updateData((d) => {
                        d.projects[idx].enabled = checked;
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 truncate">
                      {proj.number ? `${proj.number}. ` : ''}
                      {loc(proj.name, lang)}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono truncate">
                      {loc(proj.techStack, lang)}
                    </div>
                    {(proj.profiles || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(proj.profiles || []).map((pf) => {
                          const isCurrent =
                            activePreset &&
                            (activePreset.shortName === pf ||
                              activePreset.name === pf);
                          return (
                            <span
                              key={pf}
                              className={`text-[10px] px-1.5 py-0.2 rounded border ${
                                isCurrent
                                  ? 'bg-[#0D3880] text-white border-[#0D3880] font-semibold'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                              }`}
                            >
                              {pf}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {extractedKeywords.length > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        match.score >= 50
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {match.score}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
