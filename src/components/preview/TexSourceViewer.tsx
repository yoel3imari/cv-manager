import React from 'react';
import { Copy, Download } from 'lucide-react';
import { useCvStore } from '../../store/useCvStore';
import {
  generateBodyTex,
  generateMainTex,
  generateStandaloneTex,
} from '../../lib/latex-generator';

export const TexSourceViewer: React.FC = () => {
  const {
    data,
    texSubTab,
    setTexSubTab,
    copyActiveTexCode,
    exportActiveTexFile,
  } = useCvStore();

  const lang = data.meta.activeLanguage || 'en';
  const activeTexCode =
    texSubTab === 'main'
      ? generateMainTex(data, lang)
      : texSubTab === 'body'
        ? generateBodyTex(data, lang)
        : generateStandaloneTex(data, lang);

  return (
    <div className="no-print flex-1 flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 select-text">
      <div className="h-11 px-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTexSubTab('standalone')}
            className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
              texSubTab === 'standalone'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Full Standalone .tex
          </button>
          <button
            onClick={() => setTexSubTab('body')}
            className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
              texSubTab === 'body'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {`cv_latex_${lang}.tex`}
          </button>
          <button
            onClick={() => setTexSubTab('main')}
            className={`px-2.5 py-1 rounded text-xs font-mono cursor-pointer ${
              texSubTab === 'main'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            main.tex
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyActiveTexCode}
            className="text-xs px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy LaTeX</span>
          </button>
          <button
            onClick={exportActiveTexFile}
            className="text-xs px-2.5 py-1 rounded bg-[#0D3880] hover:bg-[#1d4ed8] text-white font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save .tex</span>
          </button>
        </div>
      </div>

      <pre className="flex-1 p-5 overflow-auto font-mono text-xs leading-relaxed text-zinc-200">
        {activeTexCode}
      </pre>
    </div>
  );
};
