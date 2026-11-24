import type { CvData, LocalizedString } from '../types/cv';

export function loc(
  obj: LocalizedString | string | undefined | null,
  langCode: string = 'en'
): string {
  if (obj === null || obj === undefined) return '';
  if (typeof obj === 'string') return obj;
  if (typeof obj === 'object') {
    const val = obj[langCode];
    if (val !== undefined && val !== '') return val;
    if (obj.en !== undefined && obj.en !== '') return obj.en;
    const firstVal = Object.values(obj).find(
      (v) => typeof v === 'string' && v.trim() !== ''
    );
    return firstVal || '';
  }
  return String(obj);
}

export function escapeTex(str: string | undefined | null): string {
  if (!str) return '';
  let s = String(str);
  s = s.replace(/’/g, "'").replace(/‘/g, '`');
  s = s.replace(/`([^`]+)`/g, '\\tech{$1}');
  s = s.replace(/(?<!\\)&/g, '\\&');
  s = s.replace(/(?<!\\)%/g, '\\%');
  return s;
}

export function hexToRgb(hex: string | undefined): string {
  const clean = (hex || '#0D3880').replace('#', '').trim();
  if (clean.length !== 6) return '13, 56, 128';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `${Number.isNaN(r) ? 13 : r}, ${Number.isNaN(g) ? 56 : g}, ${Number.isNaN(b) ? 128 : b}`;
}

export function generateMainTex(data: CvData, langOverride?: string): string {
  const lang = langOverride || data?.meta?.activeLanguage || 'en';
  const s = data?.meta?.style || ({} as CvData['meta']['style']);
  const docFont =
    s.fontSize === '10pt' ? '10pt' : s.fontSize === '12pt' ? '12pt' : '11pt';
  const margin = s.marginCm || 1.5;
  const mainRgb = hexToRgb(s.mainColor || '#0D3880');
  const darkRgb = hexToRgb(s.darkGray || '#282828');
  const secBefore = s.sectionSpacingPt ?? 14;
  const secAfter = s.sectionAfterPt ?? 8;

  return `\\documentclass[${docFont},a4paper]{article}

% Packages
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{amsmath}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\columnsep}{20pt}
\\usepackage[none]{hyphenat}
\\usepackage{graphicx}
\\usepackage{tabularx}

\\setlist[itemize]{noitemsep, label=--}

% Page layout
\\geometry{left=${margin}cm, right=${margin}cm, top=${margin}cm, bottom=${margin}cm}
\\setlength{\\parindent}{0pt}
\\pagestyle{empty}

% Colors
\\definecolor{maincolor}{RGB}{${mainRgb}}
\\definecolor{darkgray}{RGB}{${darkRgb}}

% Hyperlink setup
\\hypersetup{
    colorlinks=true,
    linkcolor=maincolor,
    urlcolor=maincolor,
    pdfborder={0 0 0}
}

% Custom commands
\\newcommand{\\cvitem}[4]{
    \\textbf{#1} \\hfill \\textit{#2}\\\\
    \\textit{#3} \\hfill #4\\\\[4pt]
    \\vspace{-10px}
}

\\newcommand{\\cvproject}[3]{
    \\textbf{#1} \\hfill \\textit{#2}\\\\
    #3\\\\[4pt]
}

\\newcommand{\\skill}[1]{\\textbullet\\ #1}

\\newcommand{\\entry}[2]{
    \\noindent\\textbf{#1} \\hfill #2
}

\\providecommand{\\tech}[1]{{\\ttfamily\\fontdimen3\\font=0.25em\\fontdimen4\\font=0.15em\\hyphenchar\\font=\`\\-#1}}

% --- Section Formatting ---
\\titleformat{\\section}
    {\\large\\bfseries\\color{maincolor}\\uppercase}
    {}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{${secBefore}pt}{${secAfter}pt}

% Document
\\begin{document}

\\input{cv_latex_${lang}}

\\end{document}
`;
}

export function generateBodyTex(data: CvData, langOverride?: string): string {
  const lang = langOverride || data?.meta?.activeLanguage || 'en';
  const p = data?.profile || ({} as CvData['profile']);
  const s = data?.meta?.style || ({} as CvData['meta']['style']);
  const colonSpace = lang === 'fr' ? ' :' : ':';

  const contacts: string[] = [];
  if (p.phone) contacts.push(escapeTex(p.phone));
  const locStr = escapeTex(loc(p.location, lang)).trim();
  if (locStr) contacts.push(locStr);
  if (p.email) {
    contacts.push(`\\href{mailto:${p.email.trim()}}{${escapeTex(p.email.trim())}}`);
  }
  if (p.linkedinUrl) {
    contacts.push(
      `\\href{${p.linkedinUrl.trim()}}{${escapeTex(loc(p.linkedinLabel, lang) || 'LinkedIn')}}`
    );
  }
  if (p.githubUrl) {
    contacts.push(
      `\\href{${p.githubUrl.trim()}}{${escapeTex(loc(p.githubLabel, lang) || 'GitHub')}}`
    );
  }

  const lines: string[] = [
    '% --- Header ---',
    '\\begin{center}',
    `    {\\Huge\\bfseries ${escapeTex(p.name)}}\\\\[6pt]`,
    `    {\\fontsize{14}{20}\\selectfont ${escapeTex(loc(p.title, lang))}} \\\\[3pt]`,
    '    {\\color{darkgray}',
    `    ${contacts.join(' \\ \\textbullet \\ ')}`,
    '    }',
    '\\end{center}',
    '',
  ];

  (data?.sections || []).forEach((sec) => {
    if (!sec.enabled) return;
    const secTitle = escapeTex(loc(sec.title, lang));

    if (sec.type === 'summary') {
      const sum = escapeTex(loc(p.summary, lang)).trim();
      if (!sum) return;
      lines.push('% --- Professional Summary ---');
      lines.push(`\\section*{${secTitle}}`);
      lines.push(sum);
      lines.push('');
    } else if (sec.type === 'education') {
      const items = (data.education || []).filter((e) => e.enabled);
      if (!items.length) return;
      lines.push('% --- Education ---');
      lines.push(`\\section*{${secTitle}}`);
      items.forEach((edu, i) => {
        lines.push(
          `\\entry{${escapeTex(loc(edu.degree, lang))}}{${escapeTex(loc(edu.dates, lang))}}\\\\`
        );
        lines.push(`\\textit{${escapeTex(loc(edu.institution, lang))}}`);
        if (i < items.length - 1) lines.push('');
      });
      lines.push('');
    } else if (sec.type === 'experience') {
      const items = (data.experience || []).filter((e) => e.enabled);
      if (!items.length) return;
      lines.push('% --- Work Experience ---');
      lines.push(`\\section*{${secTitle}}`);
      lines.push('');
      items.forEach((exp, i) => {
        const role = escapeTex(loc(exp.role, lang));
        const comp = escapeTex(loc(exp.company, lang));
        const dates = escapeTex(loc(exp.dates, lang));
        const left = comp ? `${role}, \\textit{${comp}}` : role;
        lines.push(`\\entry{${left}}{${dates}}`);
        const bullets = (exp.bullets || []).filter((b) => b.enabled);
        if (bullets.length) {
          lines.push('\\begin{itemize}[noitemsep, topsep=2pt, leftmargin=1.2em]');
          bullets.forEach((b) => {
            lines.push(`    \\item ${escapeTex(loc(b.text, lang))}`);
          });
          lines.push('\\end{itemize}');
        }
        if (i < items.length - 1) {
          lines.push(`\\vspace{${s.expSpacingPt ?? 2}pt}`);
          lines.push('');
        }
      });
      lines.push('');
    } else if (sec.type === 'projects') {
      const items = (data.projects || []).filter((pr) => pr.enabled);
      if (!items.length) return;
      lines.push('% --- Projects ---');
      lines.push(
        '\\providecommand{\\tech}[1]{{\\ttfamily\\fontdimen3\\font=0.25em\\fontdimen4\\font=0.15em\\hyphenchar\\font=`\\-#1}}'
      );
      lines.push('');
      lines.push(`\\section*{${secTitle}}`);
      lines.push('{\\setlength{\\emergencystretch}{3em}%');
      lines.push(
        `\\begin{itemize}[leftmargin=1.2em, itemsep=${s.projectItemSepPt ?? 6}pt]`
      );
      items.forEach((pr, i) => {
        const pname = escapeTex(loc(pr.name, lang)).replace(/[\s:]+$/, '');
        const ptech = escapeTex(loc(pr.techStack, lang));
        const pdesc = escapeTex(loc(pr.description, lang));
        if (ptech) {
          lines.push(
            `    \\item \\textbf{${pname}${colonSpace}} \\tech{${ptech}} \\\\`
          );
        } else {
          lines.push(`    \\item \\textbf{${pname}${colonSpace}} \\\\`);
        }
        lines.push(`    ${pdesc}`);
        if (i < items.length - 1) lines.push('');
      });
      lines.push('\\end{itemize}%');
      lines.push('}');
      lines.push('');
    } else if (sec.type === 'skills') {
      const items = (data.skills || []).filter((sk) => sk.enabled);
      if (!items.length) return;
      lines.push('% --- Technologies ---');
      lines.push(`\\section*{${secTitle}}`);
      lines.push('{\\setlength{\\emergencystretch}{3em}%');
      lines.push(
        `\\begin{itemize}[leftmargin=1.2em, itemsep=${s.skillsItemSepPt ?? 3}pt]`
      );
      items.forEach((sk) => {
        const cat = escapeTex(loc(sk.category, lang)).replace(/[\s:]+$/, '');
        const vals = escapeTex(loc(sk.items, lang));
        lines.push(`    \\item \\textbf{${cat}${colonSpace}} ${vals}`);
      });
      lines.push('\\end{itemize}');
      lines.push('}');
      lines.push('');
    } else if (sec.type === 'certifications') {
      const items = (data.certifications || []).filter((c) => c.enabled);
      if (!items.length) return;
      lines.push('% --- Certifications ---');
      lines.push(`\\section*{${secTitle}}`);
      lines.push('\\begin{itemize}[leftmargin=1.2em, noitemsep, topsep=2pt]');
      items.forEach((c) => {
        const ct = escapeTex(loc(c.title, lang));
        const ci = escapeTex(loc(c.issuer, lang));
        if (ci) {
          if (ct.endsWith(':')) {
            lines.push(`    \\item \\textbf{${ct}} ${ci}`);
          } else {
            lines.push(`    \\item \\textbf{${ct}} -- ${ci}`);
          }
        } else {
          lines.push(`    \\item \\textbf{${ct}}`);
        }
      });
      lines.push('\\end{itemize}');
      lines.push('');
    } else if (sec.type === 'languages') {
      const items = (data.spokenLanguages || []).filter((l) => l.enabled);
      if (!items.length) return;
      const parts = items.map((sp) => {
        const ln = escapeTex(loc(sp.language, lang)).replace(/[\s:]+$/, '');
        const lv = escapeTex(loc(sp.level, lang));
        return `\\textbf{${ln}${colonSpace}} ${lv}`;
      });
      lines.push('% --- Languages ---');
      lines.push(`\\section*{${secTitle}}`);
      lines.push('\\begin{itemize}[leftmargin=1.2em, itemsep=0pt]');
      lines.push(`    \\item ${parts.join(' \\ \\textbullet \\ \\ ')}`);
      lines.push('\\end{itemize}');
      lines.push('');
    } else if (sec.type === 'custom_entries' || sec.type === 'custom_bullets') {
      const items = ((data.customSections || {})[sec.id] || []).filter(
        (it) => it.enabled
      );
      if (!items.length) return;
      lines.push(`% --- ${secTitle} ---`);
      lines.push(`\\section*{${secTitle}}`);
      if (sec.type === 'custom_bullets') {
        lines.push('\\begin{itemize}[leftmargin=1.2em, noitemsep, topsep=2pt]');
        items.forEach((it) => {
          const t = escapeTex(loc(it.title, lang));
          const d = escapeTex(loc(it.description, lang));
          if (t && d) lines.push(`    \\item \\textbf{${t}:} ${d}`);
          else if (t) lines.push(`    \\item \\textbf{${t}}`);
          else lines.push(`    \\item ${d}`);
        });
        lines.push('\\end{itemize}');
      } else {
        items.forEach((it, i) => {
          const t = escapeTex(loc(it.title, lang));
          const sub = escapeTex(loc(it.subtitle, lang));
          const dt = escapeTex(loc(it.dates, lang));
          const desc = escapeTex(loc(it.description, lang));
          const left = sub ? `${t}, \\textit{${sub}}` : t;
          lines.push(`\\entry{${left}}{${dt}}`);
          if (desc) {
            lines.push('\\begin{itemize}[noitemsep, topsep=2pt, leftmargin=1.2em]');
            desc.split('\n').forEach((ln) => {
              if (ln.trim()) lines.push(`    \\item ${ln.trim()}`);
            });
            lines.push('\\end{itemize}');
          }
          if (i < items.length - 1) lines.push('\\vspace{2pt}');
        });
      }
      lines.push('');
    }
  });

  return lines.join('\n');
}

export function generateStandaloneTex(data: CvData, langOverride?: string): string {
  const lang = langOverride || data?.meta?.activeLanguage || 'en';
  const main = generateMainTex(data, lang);
  const body = generateBodyTex(data, lang);
  return main.replace(`\\input{cv_latex_${lang}}`, body);
}

export function generateAllBodyTexMap(data: CvData): Record<string, string> {
  const langs = data?.meta?.languages || [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
  ];
  const out: Record<string, string> = {};
  langs.forEach((l) => {
    out[l.code] = generateBodyTex(data, l.code);
  });
  return out;
}
