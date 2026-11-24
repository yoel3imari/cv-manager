import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { getActivePreset } from '../../lib/filename';
import { Checkbox } from '../ui/Checkbox';

export const ProjectsView: React.FC = () => {
  const {
    data,
    expandedId,
    bilingualEdit,
    toggleExpand,
    setAllProjects,
    addProject,
    removeProject,
    moveProject,
    applyPreset,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const languages = data.meta.languages || [];
  const projectsSection = data.sections.find((s) => s.id === 'projects');
  const activePreset = getActivePreset(data);

  return (
    <div className="space-y-3.5">
      {/* Section Heading & Quick Toolbar */}
      <div className="flex items-center justify-between gap-2">
        {projectsSection && (
          <input
            type="text"
            value={projectsSection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'projects');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-44 focus:bg-white focus:outline-none"
            title="Section Title"
          />
        )}

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setAllProjects(true)}
            className="text-[11px] text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100 cursor-pointer"
          >
            All ({data.projects.length})
          </button>
          <button
            onClick={() => setAllProjects(false)}
            className="text-[11px] text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100 cursor-pointer"
          >
            None
          </button>
          <button
            onClick={addProject}
            className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 transition cursor-pointer"
          >
            + Add Project
          </button>
        </div>
      </div>

      {/* Quick Role Profile Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-zinc-50 border border-zinc-200/70">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 px-1">
          Profile:
        </span>
        {(data.jobPresets || []).map((preset) => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset.id)}
            className={`px-2 py-1 rounded-md text-[11px] border transition cursor-pointer ${
              data.meta.activePresetId === preset.id
                ? 'bg-[#0D3880] text-white font-semibold border-[#0D3880]'
                : 'bg-white hover:bg-zinc-100 text-zinc-600 border-zinc-200/90 font-medium'
            }`}
          >
            {preset.shortName || preset.name}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <div className="space-y-2">
        {(data.projects || []).map((proj, idx) => {
          const isExpanded = expandedId === proj.id;
          return (
            <div
              key={proj.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                proj.enabled
                  ? 'border-zinc-200/90 bg-white'
                  : 'border-zinc-200/50 bg-zinc-50/60 opacity-65'
              }`}
            >
              {/* Collapsed Summary Row */}
              <div
                onClick={() => toggleExpand(proj.id)}
                className="px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-zinc-50/80"
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
                    <div className="text-[11px] text-zinc-400 font-mono truncate">
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
                              className={`text-[9.5px] px-1.5 py-0.2 rounded border ${
                                isCurrent
                                  ? 'bg-blue-50 text-[#0D3880] border-blue-200 font-semibold'
                                  : 'bg-zinc-100 text-zinc-500 border-zinc-200/80'
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

                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => moveProject(idx, -1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 rounded hover:bg-zinc-100 cursor-pointer"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveProject(idx, 1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 rounded hover:bg-zinc-100 cursor-pointer"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => toggleExpand(proj.id)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    {isExpanded ? '▴' : '▾'}
                  </button>
                </div>
              </div>

              {/* Expanded Editor Drawer */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-100 bg-zinc-50/40 space-y-2.5">
                  {!bilingualEdit ? (
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                          Project Title ({lang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={proj.name[lang] || ''}
                          onChange={(e) =>
                            updateData((d) => {
                              d.projects[idx].name[lang] = e.target.value;
                            })
                          }
                          className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                          Tech Stack (\tech&#123;...&#125;)
                        </label>
                        <input
                          type="text"
                          value={proj.techStack[lang] || ''}
                          onChange={(e) =>
                            updateData((d) => {
                              d.projects[idx].techStack[lang] = e.target.value;
                            })
                          }
                          className="w-full text-xs font-mono bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                          Description ({lang.toUpperCase()})
                        </label>
                        <textarea
                          rows={4}
                          value={proj.description[lang] || ''}
                          onChange={(e) =>
                            updateData((d) => {
                              d.projects[idx].description[lang] = e.target.value;
                            })
                          }
                          className="w-full text-xs bg-white border border-zinc-200 rounded-lg p-2.5 leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {languages.map((l) => (
                        <div
                          key={l.code}
                          className="p-2.5 rounded-lg bg-white border border-zinc-200/80 space-y-2"
                        >
                          <div className="text-[10px] font-bold uppercase text-[#0D3880]">
                            {l.name} ({l.code.toUpperCase()})
                          </div>
                          <input
                            type="text"
                            value={proj.name[l.code] || ''}
                            onChange={(e) =>
                              updateData((d) => {
                                d.projects[idx].name[l.code] = e.target.value;
                              })
                            }
                            placeholder="Title"
                            className="w-full text-xs border border-zinc-200 rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            value={proj.techStack[l.code] || ''}
                            onChange={(e) =>
                              updateData((d) => {
                                d.projects[idx].techStack[l.code] =
                                  e.target.value;
                              })
                            }
                            placeholder="Tech Stack"
                            className="w-full text-xs font-mono border border-zinc-200 rounded px-2 py-1"
                          />
                          <textarea
                            rows={3}
                            value={proj.description[l.code] || ''}
                            onChange={(e) =>
                              updateData((d) => {
                                d.projects[idx].description[l.code] =
                                  e.target.value;
                              })
                            }
                            placeholder="Description"
                            className="w-full text-xs border border-zinc-200 rounded p-2 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => removeProject(idx)}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Delete Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
