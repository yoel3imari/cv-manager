import type { CvData, JobPreset } from '../types/cv';

export function getUserNameSlug(data: CvData): string {
  const rawName = (data?.profile?.name || '').trim();
  const parts = rawName
    .split(/\s+/)
    .map((p) => p.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  if (!parts.length) return 'user';
  if (parts.length === 1) return parts[0];
  return `${parts[0]}_${parts.slice(1).join('')}`;
}

export function getActivePreset(data: CvData): JobPreset | null {
  const id = data?.meta?.activePresetId;
  return (data?.jobPresets || []).find((p) => p.id === id) || null;
}

export function getProfileSlug(data: CvData): string {
  const preset = getActivePreset(data);
  const raw = (preset && (preset.shortName || preset.name)) || 'default';
  let slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  slug = slug.replace(/_cv$/, '').replace(/^_+|_+$/g, '');
  return slug || 'default';
}

export function getPdfExportBasename(data: CvData, langOverride?: string): string {
  const lang = langOverride || data?.meta?.activeLanguage || 'en';
  return `${getUserNameSlug(data)}_${getProfileSlug(data)}_${lang}_cv`;
}

export function getPdfExportFilename(data: CvData, langOverride?: string): string {
  return `${getPdfExportBasename(data, langOverride)}.pdf`;
}
