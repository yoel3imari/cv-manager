import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { Checkbox } from '../ui/Checkbox';

export const SkillsView: React.FC = () => {
  const {
    data,
    addSkillCategory,
    removeSkillCategory,
    moveSkillCategory,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const skillsSection = data.sections.find((s) => s.id === 'skills');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        {skillsSection && (
          <input
            type="text"
            value={skillsSection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'skills');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-48 focus:bg-white focus:outline-none"
          />
        )}
        <button
          onClick={addSkillCategory}
          className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 transition cursor-pointer"
        >
          + Add Category
        </button>
      </div>

      <div className="space-y-2">
        {(data.skills || []).map((sk, idx) => (
          <div
            key={sk.id}
            className="p-3 rounded-xl border border-zinc-200/90 bg-white space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  checked={sk.enabled}
                  onChange={(checked) =>
                    updateData((d) => {
                      d.skills[idx].enabled = checked;
                    })
                  }
                />
                <input
                  type="text"
                  value={sk.category[lang] || ''}
                  onChange={(e) =>
                    updateData((d) => {
                      d.skills[idx].category[lang] = e.target.value;
                    })
                  }
                  placeholder="Category"
                  className="text-xs font-semibold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 flex-1 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveSkillCategory(idx, -1)}
                  className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSkillCategory(idx, 1)}
                  className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeSkillCategory(idx)}
                  className="p-1 text-zinc-400 hover:text-red-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <input
              type="text"
              value={sk.items[lang] || ''}
              onChange={(e) =>
                updateData((d) => {
                  d.skills[idx].items[lang] = e.target.value;
                })
              }
              placeholder="Comma-separated skills..."
              className="w-full text-xs text-zinc-700 bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
