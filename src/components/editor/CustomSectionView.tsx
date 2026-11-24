import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { Checkbox } from '../ui/Checkbox';

export const CustomSectionView: React.FC<{ sectionId: string }> = ({
  sectionId,
}) => {
  const {
    data,
    deleteCustomSection,
    addCustomSectionItem,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const sec = data.sections.find((s) => s.id === sectionId);
  if (!sec) return null;

  const items = (data.customSections || {})[sectionId] || [];

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          value={sec.title[lang] || ''}
          onChange={(e) =>
            updateData((d) => {
              const target = d.sections.find((s) => s.id === sectionId);
              if (target) target.title[lang] = e.target.value;
            })
          }
          className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-48 focus:bg-white"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => deleteCustomSection(sectionId)}
            className="text-xs text-red-600 hover:underline cursor-pointer"
          >
            Delete Section
          </button>
          <button
            onClick={() => addCustomSectionItem(sectionId)}
            className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 cursor-pointer"
          >
            + Add Item
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-zinc-200 bg-white space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  checked={item.enabled}
                  onChange={(checked) =>
                    updateData((d) => {
                      d.customSections[sectionId][idx].enabled = checked;
                    })
                  }
                />
                <input
                  type="text"
                  value={item.title[lang] || ''}
                  onChange={(e) =>
                    updateData((d) => {
                      d.customSections[sectionId][idx].title[lang] =
                        e.target.value;
                    })
                  }
                  placeholder="Title"
                  className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded px-2 py-1 flex-1"
                />
              </div>
              <button
                onClick={() =>
                  updateData((d) => {
                    d.customSections[sectionId].splice(idx, 1);
                  })
                }
                className="text-xs text-zinc-400 hover:text-red-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            {sec.type === 'custom_entries' && (
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.subtitle?.[lang] || ''}
                  onChange={(e) =>
                    updateData((d) => {
                      const target = d.customSections[sectionId][idx];
                      if (!target.subtitle) target.subtitle = {};
                      target.subtitle[lang] = e.target.value;
                    })
                  }
                  placeholder="Subtitle / Organization"
                  className="text-xs bg-zinc-50 border border-zinc-200 rounded px-2 py-1"
                />
                <input
                  type="text"
                  value={item.dates?.[lang] || ''}
                  onChange={(e) =>
                    updateData((d) => {
                      const target = d.customSections[sectionId][idx];
                      if (!target.dates) target.dates = {};
                      target.dates[lang] = e.target.value;
                    })
                  }
                  placeholder="Dates"
                  className="text-xs bg-zinc-50 border border-zinc-200 rounded px-2 py-1"
                />
              </div>
            )}
            <textarea
              rows={2}
              value={item.description[lang] || ''}
              onChange={(e) =>
                updateData((d) => {
                  d.customSections[sectionId][idx].description[lang] =
                    e.target.value;
                })
              }
              placeholder="Details..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded p-2"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
