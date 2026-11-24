import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { Checkbox } from '../ui/Checkbox';

export const EducationView: React.FC = () => {
  const {
    data,
    expandedId,
    toggleExpand,
    addEducation,
    removeEducation,
    moveEducation,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const eduSection = data.sections.find((s) => s.id === 'education');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        {eduSection && (
          <input
            type="text"
            value={eduSection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'education');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-48 focus:bg-white focus:outline-none"
          />
        )}
        <button
          onClick={addEducation}
          className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 transition cursor-pointer"
        >
          + Add Degree
        </button>
      </div>

      <div className="space-y-2">
        {(data.education || []).map((edu, idx) => {
          const isExpanded = expandedId === edu.id;
          return (
            <div
              key={edu.id}
              className="rounded-xl border border-zinc-200/90 bg-white overflow-hidden"
            >
              <div
                onClick={() => toggleExpand(edu.id)}
                className="px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-zinc-50"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Checkbox
                    checked={edu.enabled}
                    onChange={(checked) =>
                      updateData((d) => {
                        d.education[idx].enabled = checked;
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 truncate">
                      {loc(edu.degree, lang)}
                    </div>
                    <div className="text-[11px] text-zinc-400 truncate">
                      {loc(edu.institution, lang)} • {loc(edu.dates, lang)}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => moveEducation(idx, -1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveEducation(idx, 1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => toggleExpand(edu.id)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    {isExpanded ? '▴' : '▾'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-100 bg-zinc-50/40 space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-0.5">
                      Degree ({lang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={edu.degree[lang] || ''}
                      onChange={(e) =>
                        updateData((d) => {
                          d.education[idx].degree[lang] = e.target.value;
                        })
                      }
                      className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-0.5">
                        Institution ({lang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={edu.institution[lang] || ''}
                        onChange={(e) =>
                          updateData((d) => {
                            d.education[idx].institution[lang] = e.target.value;
                          })
                        }
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-0.5">
                        Dates ({lang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={edu.dates[lang] || ''}
                        onChange={(e) =>
                          updateData((d) => {
                            d.education[idx].dates[lang] = e.target.value;
                          })
                        }
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => removeEducation(idx)}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Delete
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
