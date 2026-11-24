import React, { useState } from 'react';
import { useCvStore } from '../../store/useCvStore';

export const ImportTexModal: React.FC = () => {
  const { showImportTexModal, setModal, importTexSource } = useCvStore();
  const [texText, setTexText] = useState('');

  if (!showImportTexModal) return null;

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setTexText(ev.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      onClick={() => setModal('importTex', false)}
      className="no-print fixed inset-0 bg-black/40 backdrop-blur-2xs flex items-center justify-center z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl border border-zinc-200 w-[520px] p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              Import Existing LaTeX CV (.tex)
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Select a <code className="font-mono">.tex</code> file or paste its
              source below to extract your profile and projects.
            </p>
          </div>
          <label className="text-xs font-medium text-[#0D3880] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0">
            Browse .tex File
            <input
              type="file"
              accept=".tex,.txt"
              onChange={handleFilePick}
              className="hidden"
            />
          </label>
        </div>

        <textarea
          value={texText}
          onChange={(e) => setTexText(e.target.value)}
          rows={9}
          placeholder="Paste your cv_latex_en.tex or main.tex source here..."
          className="w-full text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:border-[#0D3880]"
        />

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={() => setModal('importTex', false)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              importTexSource(texText);
              setTexText('');
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#0D3880] text-white font-medium cursor-pointer"
          >
            Parse & Import .tex
          </button>
        </div>
      </div>
    </div>
  );
};
