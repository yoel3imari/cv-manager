import React from 'react';
import { useCvStore } from '../../store/useCvStore';
import { LiveA4Sheet } from './LiveA4Sheet';
import { PdfCanvasViewer } from './PdfCanvasViewer';
import { TexSourceViewer } from './TexSourceViewer';
import { Select } from '../ui/Select';

const ZOOM_OPTIONS = [
  { value: '0.75', label: '75%' },
  { value: '0.85', label: '85%' },
  { value: '0.9', label: '90%' },
  { value: '1', label: '100%' },
  { value: '1.1', label: '110%' },
];

export const PreviewCanvas: React.FC = () => {
  const {
    previewMode,
    compiledPdfBase64,
    pageFillPercent,
    zoom,
    setPreviewMode,
    setZoom,
  } = useCvStore();

  return (
    <main className="flex-1 bg-zinc-100/90 flex flex-col overflow-hidden relative">
      {/* Floating Top Canvas Bar (No-Print) */}
      <div className="no-print h-11 px-3.5 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xs flex items-center justify-between shrink-0 z-20">
        {/* View Switcher Pills */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
          <button
            onClick={() => setPreviewMode('a4')}
            className={`px-3 py-1 rounded-md text-xs transition cursor-pointer ${
              previewMode === 'a4'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 font-medium'
            }`}
          >
            Live A4 Sheet
          </button>
          <button
            onClick={() => setPreviewMode('pdf')}
            className={`px-3 py-1 rounded-md text-xs transition flex items-center gap-1.5 cursor-pointer ${
              previewMode === 'pdf'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 font-medium'
            }`}
          >
            <span>Compiled PDF</span>
            {compiledPdfBase64 && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            )}
          </button>
          <button
            onClick={() => setPreviewMode('tex')}
            className={`px-3 py-1 rounded-md text-xs transition font-mono cursor-pointer ${
              previewMode === 'tex'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-500 hover:text-zinc-800 font-medium'
            }`}
          >
            LaTeX .tex
          </button>
        </div>

        {/* Center: 1-Page Fit Meter Badge */}
        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
              pageFillPercent <= 100
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                pageFillPercent <= 100 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{pageFillPercent}% of 1 A4 Page</span>
            {pageFillPercent > 100 && (
              <span className="text-[11px] font-normal">(Spills to Page 2)</span>
            )}
          </div>
        </div>

        {/* Right: Shadcn Zoom Selector (when in Live A4 mode) */}
        {previewMode === 'a4' ? (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-zinc-400">Zoom</span>
            <Select
              value={String(zoom)}
              options={ZOOM_OPTIONS}
              onChange={(val) => setZoom(Number(val))}
              align="right"
              triggerClassName="min-w-[74px] py-1"
              menuClassName="min-w-[100px]"
            />
          </div>
        ) : (
          <div className="w-24" />
        )}
      </div>

      {previewMode === 'a4' && <LiveA4Sheet />}
      {previewMode === 'pdf' && <PdfCanvasViewer />}
      {previewMode === 'tex' && <TexSourceViewer />}
    </main>
  );
};
