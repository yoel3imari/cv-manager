import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { Checkbox } from '../ui/Checkbox';

export const ExperienceView: React.FC = () => {
  const {
    data,
    expandedId,
    toggleExpand,
    addExperience,
    removeExperience,
    moveExperience,
    addExperienceBullet,
    removeExperienceBullet,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const expSection = data.sections.find((s) => s.id === 'experience');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        {expSection && (
          <input
            type="text"
            value={expSection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'experience');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-48 focus:bg-white focus:outline-none"
          />
        )}
        <button
          onClick={addExperience}
          className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 transition cursor-pointer"
        >
          + Add Experience
        </button>
      </div>

      <div className="space-y-2">
        {(data.experience || []).map((exp, idx) => {
          const isExpanded = expandedId === exp.id;
          return (
            <div
              key={exp.id}
              className={`rounded-xl border transition-all overflow-hidden ${
                exp.enabled
                  ? 'border-zinc-200/90 bg-white'
                  : 'border-zinc-200/50 bg-zinc-50/60 opacity-65'
              }`}
            >
              {/* Header Row */}
              <div
                onClick={() => toggleExpand(exp.id)}
                className="px-3 py-2.5 flex items-center justify-between gap-2 cursor-pointer hover:bg-zinc-50/80"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Checkbox
                    checked={exp.enabled}
                    onChange={(checked) =>
                      updateData((d) => {
                        d.experience[idx].enabled = checked;
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-900 truncate">
                      <span>{loc(exp.role, lang)}</span>
                      {loc(exp.company, lang) && (
                        <span className="text-zinc-400 font-normal">
                          {' '}
                          • {loc(exp.company, lang)}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {loc(exp.dates, lang)}
                    </div>
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => moveExperience(idx, -1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveExperience(idx, 1)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => toggleExpand(exp.id)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                  >
                    {isExpanded ? '▴' : '▾'}
                  </button>
                </div>
              </div>

              {/* Expanded Drawer */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2 border-t border-zinc-100 bg-zinc-50/40 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-0.5">
                        Role ({lang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={exp.role[lang] || ''}
                        onChange={(e) =>
                          updateData((d) => {
                            d.experience[idx].role[lang] = e.target.value;
                          })
                        }
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-0.5">
                        Company ({lang.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={exp.company[lang] || ''}
                        onChange={(e) =>
                          updateData((d) => {
                            d.experience[idx].company[lang] = e.target.value;
                          })
                        }
                        className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-0.5">
                      Dates ({lang.toUpperCase()})
                    </label>
                    <input
                      type="text"
                      value={exp.dates[lang] || ''}
                      onChange={(e) =>
                        updateData((d) => {
                          d.experience[idx].dates[lang] = e.target.value;
                        })
                      }
                      className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  {/* Bullets */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase text-zinc-400">
                        Bullet Points
                      </span>
                      <button
                        onClick={() => addExperienceBullet(idx)}
                        className="text-[11px] text-[#0D3880] hover:underline font-medium cursor-pointer"
                      >
                        + Add Bullet
                      </button>
                    </div>
                    {(exp.bullets || []).map((b, bIdx) => (
                      <div key={b.id} className="flex items-start gap-2">
                        <Checkbox
                          size="sm"
                          checked={b.enabled}
                          onChange={(checked) =>
                            updateData((d) => {
                              d.experience[idx].bullets[bIdx].enabled = checked;
                            })
                          }
                          className="mt-2"
                        />
                        <textarea
                          rows={3}
                          value={b.text[lang] || ''}
                          onChange={(e) =>
                            updateData((d) => {
                              d.experience[idx].bullets[bIdx].text[lang] =
                                e.target.value;
                            })
                          }
                          className="flex-1 text-xs bg-white border border-zinc-200 rounded-lg p-2 leading-relaxed"
                        />
                        <button
                          onClick={() => removeExperienceBullet(idx, bIdx)}
                          className="mt-1.5 text-zinc-400 hover:text-red-600 text-xs cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => removeExperience(idx)}
                      className="text-[11px] text-red-600 hover:underline cursor-pointer"
                    >
                      Delete Experience
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
