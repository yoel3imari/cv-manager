import { invoke } from '@tauri-apps/api/core';
import type { CompileResult, CompilerInfo, CvData } from '../types/cv';
import sampleCvData from '../../data/sample_cv_data.json';

export function isTauriRuntime(): boolean {
  return (
    typeof window !== 'undefined' &&
    ('__TAURI_INTERNALS__' in window || '__TAURI__' in window)
  );
}

export async function apiGetInitialState(): Promise<{
  ok: boolean;
  data: CvData;
  compiler: CompilerInfo;
  workspace?: string;
}> {
  if (isTauriRuntime()) {
    return await invoke('get_initial_state');
  }
  const raw = localStorage.getItem('cv_manager_backup');
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CvData;
      if (parsed && parsed.profile) {
        return {
          ok: true,
          data: parsed,
          compiler: {
            available: false,
            engine: null,
            path: null,
            version: 'Browser Mode (Launch Tauri for Tectonic)',
          },
        };
      }
    } catch {
      // Fallback to sample data
    }
  }
  return {
    ok: true,
    data: JSON.parse(JSON.stringify(sampleCvData)) as unknown as CvData,
    compiler: {
      available: false,
      engine: null,
      path: null,
      version: 'Browser Mode (Launch Tauri for Tectonic)',
    },
  };
}

export async function apiSaveCvData(data: CvData): Promise<boolean> {
  localStorage.setItem('cv_manager_backup', JSON.stringify(data));
  if (isTauriRuntime()) {
    const res = await invoke<{ ok: boolean }>('save_cv_data', { data });
    return Boolean(res?.ok);
  }
  return true;
}

export async function apiLoadSampleTemplate(): Promise<CvData> {
  if (isTauriRuntime()) {
    const res = await invoke<{ ok: boolean; data: CvData }>('load_sample_template');
    if (res?.ok && res.data) return res.data;
  }
  return JSON.parse(JSON.stringify(sampleCvData)) as unknown as CvData;
}

export async function apiSyncTexFiles(
  data: CvData,
  mainTex: string,
  bodyFiles: Record<string, string>
): Promise<{ ok: boolean; written: string[] }> {
  if (isTauriRuntime()) {
    return await invoke('sync_tex_files', {
      data,
      mainTex,
      bodyFiles,
    });
  }
  return { ok: false, written: [] };
}

export async function apiCompileLatex(params: {
  texSource: string;
  basename: string;
  data: CvData;
  mainTex: string;
  bodyFiles: Record<string, string>;
}): Promise<CompileResult> {
  if (isTauriRuntime()) {
    return await invoke<CompileResult>('compile_latex', params);
  }
  return {
    ok: false,
    error: 'LaTeX compilation requires the Tauri Desktop runtime.',
    log: '',
  };
}

export async function apiInstallTectonic(): Promise<{
  ok: boolean;
  compiler?: CompilerInfo;
  log?: string;
  error?: string;
}> {
  if (isTauriRuntime()) {
    return await invoke('install_tectonic');
  }
  return {
    ok: false,
    error: 'Tectonic installer requires the Tauri Desktop runtime.',
  };
}

export async function apiSaveExportFile(params: {
  filename: string;
  content: string;
  isBase64: boolean;
  mimeType?: string;
  useDialog?: boolean;
}): Promise<{ ok: boolean; savedPath?: string; cancelled?: boolean }> {
  if (isTauriRuntime()) {
    return await invoke('save_export_file', {
      filename: params.filename,
      content: params.content,
      isBase64: params.isBase64,
      useDialog: params.useDialog ?? true,
    });
  }

  // Browser fallback download
  const blob = params.isBase64
    ? new Blob(
        [Uint8Array.from(atob(params.content), (c) => c.charCodeAt(0))],
        { type: params.mimeType || 'application/octet-stream' }
      )
    : new Blob([params.content], {
        type: params.mimeType || 'text/plain;charset=utf-8',
      });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = params.filename;
  a.click();
  URL.revokeObjectURL(url);
  return { ok: true, savedPath: params.filename };
}

export async function apiOpenInSystem(path: string): Promise<boolean> {
  if (isTauriRuntime() && path) {
    const res = await invoke<{ ok: boolean }>('open_in_system', { path });
    return Boolean(res?.ok);
  }
  return false;
}
