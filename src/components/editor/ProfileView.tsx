import React from 'react';
import { useCvStore } from '../../store/useCvStore';

export const ProfileView: React.FC = () => {
  const { data, bilingualEdit, updateData } = useCvStore();
  const lang = data.meta.activeLanguage || 'en';
  const languages = data.meta.languages || [];

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={data.profile.name || ''}
          onChange={(e) =>
            updateData((d) => {
              d.profile.name = e.target.value;
            })
          }
          className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
        />
      </div>

      {!bilingualEdit ? (
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Headline / Job Title ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.profile.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.title[lang] = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
      ) : (
        <div className="space-y-2 p-3 rounded-xl bg-zinc-50 border border-zinc-200/70">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            Headline / Job Title (All Languages)
          </div>
          {languages.map((l) => (
            <div key={l.code}>
              <label className="text-[10px] font-semibold text-zinc-400 uppercase">
                {l.name} ({l.code})
              </label>
              <input
                type="text"
                value={data.profile.title[l.code] || ''}
                onChange={(e) =>
                  updateData((d) => {
                    d.profile.title[l.code] = e.target.value;
                  })
                }
                className="w-full text-xs bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 mt-0.5"
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Phone
          </label>
          <input
            type="text"
            value={data.profile.phone || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.phone = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            Email
          </label>
          <input
            type="email"
            value={data.profile.email || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.email = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Location ({lang.toUpperCase()})
        </label>
        <input
          type="text"
          value={data.profile.location?.[lang] || ''}
          onChange={(e) =>
            updateData((d) => {
              if (!d.profile.location || typeof d.profile.location !== 'object') {
                d.profile.location = {};
              }
              d.profile.location[lang] = e.target.value;
            })
          }
          placeholder="e.g., Paris, France"
          className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            LinkedIn URL
          </label>
          <input
            type="text"
            value={data.profile.linkedinUrl || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.linkedinUrl = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            LinkedIn Display Label ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.profile.linkedinLabel?.[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.linkedinLabel[lang] = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            GitHub URL
          </label>
          <input
            type="text"
            value={data.profile.githubUrl || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.githubUrl = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
            GitHub Display Label ({lang.toUpperCase()})
          </label>
          <input
            type="text"
            value={data.profile.githubLabel?.[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                d.profile.githubLabel[lang] = e.target.value;
              })
            }
            className="w-full text-xs bg-zinc-50/60 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:outline-none focus:border-[#0D3880]"
          />
        </div>
      </div>
    </div>
  );
};
