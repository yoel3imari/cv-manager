import React, { useState } from 'react';
import { useCvStore } from '../../store/useCvStore';

export const SavePresetModal: React.FC = () => {
  const {
    showPresetModal,
    setModal,
    saveCurrentAsPreset,
    deleteActivePreset,
  } = useCvStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  if (!showPresetModal) return null;

  const handleSubmit = () => {
    saveCurrentAsPreset(name, company);
    setName('');
    setCompany('');
  };

  return (
    <div
      onClick={() => setModal('preset', false)}
      className="no-print fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-96 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-zinc-900">
          Save Tailored Job Preset
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Preset / Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Mistral AI — LLM Engineer"
              className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase text-zinc-400 mb-1">
              Target Company (Optional)
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Mistral AI, Datadog, Artefact"
              className="w-full text-xs border border-zinc-200 rounded-lg px-2.5 py-1.5"
            />
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => {
              deleteActivePreset();
              setModal('preset', false);
            }}
            className="text-xs text-red-600 hover:underline cursor-pointer"
          >
            Delete Current Preset
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setModal('preset', false)}
              className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#0D3880] text-white font-medium cursor-pointer"
            >
              Save Preset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
