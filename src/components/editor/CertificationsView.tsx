import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { Checkbox } from '../ui/Checkbox';

export const CertificationsView: React.FC = () => {
  const {
    data,
    addCertification,
    removeCertification,
    moveCertification,
    updateData,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const certSection = data.sections.find((s) => s.id === 'certifications');

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        {certSection && (
          <input
            type="text"
            value={certSection.title[lang] || ''}
            onChange={(e) =>
              updateData((d) => {
                const sec = d.sections.find((s) => s.id === 'certifications');
                if (sec) sec.title[lang] = e.target.value;
              })
            }
            className="text-xs font-semibold bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 w-52 focus:bg-white focus:outline-none"
          />
        )}
        <button
          onClick={addCertification}
          className="text-xs font-medium text-white bg-[#0D3880] hover:bg-[#0a2b63] rounded-lg px-2.5 py-1.5 transition cursor-pointer"
        >
          + Add Certificate
        </button>
      </div>

      <div className="space-y-2">
        {(data.certifications || []).map((cert, idx) => (
          <div
            key={cert.id}
            className="p-3 rounded-xl border border-zinc-200/90 bg-white space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  checked={cert.enabled}
                  onChange={(checked) =>
                    updateData((d) => {
                      d.certifications[idx].enabled = checked;
                    })
                  }
                />
                <input
                  type="text"
                  value={cert.title[lang] || ''}
                  onChange={(e) =>
                    updateData((d) => {
                      d.certifications[idx].title[lang] = e.target.value;
                    })
                  }
                  placeholder="Certificate Name / Bold Prefix"
                  className="text-xs font-semibold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1 flex-1 focus:bg-white"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveCertification(idx, -1)}
                  className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveCertification(idx, 1)}
                  className="p-1 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeCertification(idx)}
                  className="p-1 text-zinc-400 hover:text-red-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <input
              type="text"
              value={cert.issuer[lang] || ''}
              onChange={(e) =>
                updateData((d) => {
                  d.certifications[idx].issuer[lang] = e.target.value;
                })
              }
              placeholder="Issuer or Subtitle (optional)"
              className="w-full text-xs text-zinc-600 bg-zinc-50/50 border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
