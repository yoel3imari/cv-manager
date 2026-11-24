import React from 'react';
import { useCvStore } from '../../store/useCvStore';

export const SummaryView: React.FC = () => {
  const { data, bilingualEdit, updateData } = useCvStore();
  const lang = data.meta.activeLanguage || 'en';
  const languages = data.meta.languages || [];
  const summarySection = data.sections.find((s) => s.id === 'summary');

  return (
    <div className="space-y-4">
      {summarySection && (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Section Heading ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={summarySection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'summary');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
      )}

      {!bilingualEdit ? (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Summary Paragraph ({lang.toUpperCase()})
          </label>
          <textarea
            rows={7}
            value={data.profile.summary[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.summary[lang] = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-xl p-3 leading-relaxed focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {languages.map((l) => (
            <div key={l.code}>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
                {l.name} ({l.code.toUpperCase()})
              </label>
              <textarea
                rows={5}
                value={data.profile.summary[l.code] || ''}
                onChange={(e) =>
                  updateData((d) => {
                    d.profile.summary[l.code] = e.target.value;
                  })
                }
                className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-xl p-3 leading-relaxed focus:bg-white focus:outline-none focus:border-[#0D3880]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
