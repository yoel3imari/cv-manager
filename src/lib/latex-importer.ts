import type { CvData, LanguageOption, LocalizedString, ProjectItem } from '../types/cv';

function makeLocField(languages: LanguageOption[], defaultText: string = ''): LocalizedString {
  const obj: LocalizedString = {};
  languages.forEach((l) => {
    obj[l.code] = defaultText;
  });
  return obj;
}

export function parseTexIntoCvData(
  tex: string,
  currentData: CvData
): { updated: CvData; projectCount: number } {
  const clone: CvData = JSON.parse(JSON.stringify(currentData));
  const langs = clone.meta?.languages || [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
  ];

  const nameMatch = tex.match(/\\Huge\\bfseries\s+([^}\\]+)/);
  if (nameMatch) {
    clone.profile.name = nameMatch[1].trim();
  }
  const mailMatch = tex.match(/mailto:([^}]+)\}/);
  if (mailMatch) {
    clone.profile.email = mailMatch[1].trim();
  }

  const projRegex =
    /\\item\s+\\textbf\{([^}]+)\}\s*(?:\\tech\{([^}]*)\})?\s*\\\\\s*([\s\S]*?)(?=\\item|\\end\{itemize\})/g;
  const importedProjects: ProjectItem[] = [];
  let m: RegExpExecArray | null;
  let num = 1;
  while ((m = projRegex.exec(tex)) !== null) {
    const rawTitle = m[1].replace(/[\s:]+$/, '').trim();
    const rawTech = (m[2] || '').trim();
    const rawDesc = (m[3] || '').replace(/\s+/g, ' ').trim();
    if (rawTitle && rawDesc) {
      importedProjects.push({
        id: `proj-imp-${Date.now()}-${num}`,
        number: num++,
        enabled: true,
        profiles: [],
        name: makeLocField(langs, rawTitle),
        techStack: makeLocField(langs, rawTech),
        description: makeLocField(langs, rawDesc),
        tags: rawTech
          .toLowerCase()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    }
  }

  if (importedProjects.length > 0) {
    clone.projects = importedProjects;
  }

  return { updated: clone, projectCount: importedProjects.length };
}
