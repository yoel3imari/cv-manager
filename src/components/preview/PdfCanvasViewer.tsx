import React, { useEffect, useRef, useState } from 'react';
import { Download, ExternalLink, Terminal, Play } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useCvStore } from '../../store/useCvStore';
import { getPdfExportFilename } from '../../lib/filename';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export const PdfCanvasViewer: React.FC = () => {
  const {
    data,
    compiledPdfBase64,
    compiledPdfPath,
    compileLog,
    showCompileLog,
    isCompiling,
    setShowCompileLog,
    compileLatexPdf,
    exportCompiledPdfFile,
    openCompiledPdfInSystem,
  } = useCvStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [renderError, setRenderError] = useState<string>('');

  const filename = getPdfExportFilename(data);

  useEffect(() => {
    let cancelled = false;
    const renderPdf = async () => {
      if (!compiledPdfBase64 || !containerRef.current) return;
      setRenderError('');
      try {
        const binaryString = atob(compiledPdfBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        if (cancelled || !containerRef.current) return;

        setPageCount(pdf.numPages);
        containerRef.current.innerHTML = '';

        const dpr = window.devicePixelRatio || 1.5;
        const scale = 1.35;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          if (cancelled || !containerRef.current) return;

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className = 'bg-white shadow-2xl rounded-xs mb-6';

          containerRef.current.appendChild(canvas);

          if (context) {
            context.scale(dpr, dpr);
            await page.render({
              canvasContext: context,
              viewport,
            }).promise;
          }
        }
      } catch (e) {
        if (!cancelled) {
          setRenderError(
            e instanceof Error ? e.message : 'Could not render PDF on canvas'
          );
        }
      }
    };

    renderPdf();
    return () => {
      cancelled = true;
    };
  }, [compiledPdfBase64]);

  return (
    <div className="no-print flex-1 flex flex-col overflow-hidden bg-zinc-800">
      {/* Toolbar */}
      <div className="h-10 px-4 bg-zinc-900 text-zinc-300 flex items-center justify-between text-xs border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-medium font-mono text-zinc-200">
            {filename}
          </span>
          {pageCount > 0 && (
            <span
              className={`text-[10.5px] px-2 py-0.5 rounded-full font-semibold ${
                pageCount === 1
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border border-amber-700'
              }`}
            >
              {pageCount} {pageCount === 1 ? 'Page' : 'Pages'}
            </span>
          )}
          <button
            onClick={() => setShowCompileLog(!showCompileLog)}
            className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 flex items-center gap-1 cursor-pointer"
          >
            <Terminal className="w-3 h-3" />
            <span>
              {showCompileLog ? 'Hide Compiler Log' : 'View Compiler Log'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {compiledPdfPath && (
            <button
              onClick={openCompiledPdfInSystem}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium flex items-center gap-1.5 cursor-pointer"
              title="Open in system PDF viewer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open External</span>
            </button>
          )}
          {compiledPdfBase64 && (
            <button
              onClick={exportCompiledPdfFile}
              className="px-2.5 py-1 rounded bg-[#0D3880] hover:bg-[#1d4ed8] text-white font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save {filename}</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Compiler Log */}
      {showCompileLog && (
        <div className="h-44 bg-zinc-950 text-emerald-400 font-mono text-[11px] p-4 overflow-auto border-b border-zinc-800 whitespace-pre-wrap shrink-0">
          {compileLog || 'No compiler output yet.'}
        </div>
      )}

      {/* Canvas or Empty State */}
      {compiledPdfBase64 ? (
        <div className="flex-1 overflow-auto py-8 px-4 flex flex-col items-center">
          {renderError && (
            <div className="mb-4 p-3 rounded-lg bg-red-950 text-red-200 border border-red-800 text-xs">
              {renderError}
            </div>
          )}
          <div ref={containerRef} className="flex flex-col items-center" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-3">
          <p className="text-sm">
            {isCompiling
              ? 'Compiling LaTeX document with Tectonic...'
              : 'Click "Compile LaTeX PDF" to build and render with Tectonic.'}
          </p>
          {!isCompiling && (
            <button
              onClick={compileLatexPdf}
              className="px-4 py-2 rounded-lg bg-[#0D3880] hover:bg-[#1d4ed8] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Compile Now</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
