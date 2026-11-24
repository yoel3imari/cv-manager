import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { Checkbox } from '../ui/Checkbox';

export const LanguagesView: React.FC = () => {
  const {
    data,
    addSpokenLanguage,
    removeSpokenLanguage,
    moveSpokenLanguage,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const langSection = data.sections.find((s) => s.id === 'languages');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        {langSection && (
          <input
            type="text"
            value={langSection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'languages');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-44 focus:bg-white focus:outline-none"
          />
        )}
        <button
          onClick={addSpokenLanguage}
          className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 transition cursor-pointer"
        >
          + Add Language
        </button>
      </div>

      <div className="space-y-2">
        {(data.spokenLanguages || []).map((sp, idx) => (
          <div
            key={sp.id}
            className="p-2.5 rounded-xl border border-zinc-200/90 bg-white flex items-center gap-2"
          >
            <Checkbox
              checked={sp.enabled}
              onChange={(checked) =>
                updateData((d) => {
                  d.spokenLanguages[idx].enabled = checked;
                })
              }
            />
            <input
              type="text"
              value={sp.language[lang] || ''}
              onChange={(e) =>
                updateData((d) => {
                  d.spokenLanguages[idx].language[lang] = e.target.value;
                })
              }
              placeholder="Language"
              className="w-28 text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1"
            />
            <input
              type="text"
              value={sp.level[lang] || ''}
              onChange={(e) =>
                updateData((d) => {
                  d.spokenLanguages[idx].level[lang] = e.target.value;
                })
              }
              placeholder="Proficiency level"
              className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1"
            />
            <button
              onClick={() => moveSpokenLanguage(idx, -1)}
              className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
            >
              ↑
            </button>
            <button
              onClick={() => moveSpokenLanguage(idx, 1)}
              className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
            >
              ↓
            </button>
            <button
              onClick={() => removeSpokenLanguage(idx)}
              className="p-1 text-zinc-400 hover:text-red-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
