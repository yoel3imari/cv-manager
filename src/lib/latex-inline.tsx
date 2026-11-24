import React from 'react';

export function renderLatexInlineHtml(raw: string | undefined | null): string {
  if (!raw) return '';
  let html = String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Unescape LaTeX \% \& \_
  html = html
    .replace(/\\&amp;/g, '&amp;')
    .replace(/\\%/g, '%')
    .replace(/\\_/g, '_');

  // Convert markdown backticks `...`
  html = html.replace(/`([^`]+)`/g, '<span class="cv-tech">$1</span>');

  // Convert \tech{...} and \texttt{...}
  html = html.replace(
    /\\(?:tech|texttt)\{([^{}]*)\}/g,
    '<span class="cv-tech">$1</span>'
  );

  // Convert \textbf{...} and \textit{...}
  html = html.replace(/\\textbf\{([^{}]*)\}/g, '<strong>$1</strong>');
  html = html.replace(/\\textit\{([^{}]*)\}/g, '<em>$1</em>');

  // Common math expressions used in projects
  html = html
    .replace(/\$\\sim\$/g, '~')
    .replace(/\\textasciitilde/g, '~')
    .replace(/\$0([.,])1\^\\circ\$/g, '0$11°')
    .replace(/\$3\\times\$/g, '3×')
    .replace(/\$&gt;0([.,])45\\text\{\\,s\}\$/g, '&gt;0$145&#8239;s')
    .replace(/\$&gt;0\{,\}45\$\\,s/g, '&gt;0,45&#8239;s')
    .replace(/\$\\tau\s*=\s*0([.,])923\$/g, 'τ = 0$1923')
    .replace(/\$([^$]+)\$/g, '<em>$1</em>');

  // Thin spaces and escaped spaces
  html = html.replace(/\\,/g, '&#8239;').replace(/\\\s+/g, ' ');

  return html;
}

export const LatexInline: React.FC<{
  text: string | undefined | null;
  className?: string;
}> = ({ text, className }) => {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: renderLatexInlineHtml(text) }}
    />
  );
};
