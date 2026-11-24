import React, { useEffect, useRef } from 'react';
import { useCvStore } from '../../store/useCvStore';
import { loc } from '../../lib/latex-generator';
import { LatexInline } from '../../lib/latex-inline';

export const LiveA4Sheet: React.FC = () => {
  const { data, zoom, setActiveNav, setPageFillPercent } = useCvStore();
  const sheetRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const lang = data.meta.activeLanguage || 'en';
  const colonSpace = lang === 'fr' ? ' :' : ':';

  const measurePageFit = () => {
    const sheet = sheetRef.current;
    const guide = guideRef.current;
    const content = contentRef.current;
    if (!sheet || !content) return;

    const a4SinglePagePx =
      guide && guide.offsetTop > 100 ? guide.offsetTop : 1122.5;
    const style = window.getComputedStyle(sheet);
    const padTop = parseFloat(style.paddingTop) || 56;
    const padBottom = parseFloat(style.paddingBottom) || 56;
    const totalContentHeight = content.offsetHeight + padTop + padBottom;
    const pct = Math.round((totalContentHeight / a4SinglePagePx) * 100);
    setPageFillPercent(pct);
  };

  useEffect(() => {
    measurePageFit();
  }, [data, lang]);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measurePageFit());
    ro.observe(sheet);
    return () => ro.disconnect();
  }, []);

  const enabledSpoken = (data.spokenLanguages || []).filter((l) => l.enabled);

  return (
    <div className="print-only-container flex-1 overflow-auto py-2.5 px-2 flex justify-center items-start select-text">
      <div
        ref={sheetRef}
        id="cv-a4-sheet"
        className="cv-a4-sheet transition-transform duration-150"
        style={{
          transform: `scale(${zoom})`,
          marginBottom: `${(zoom - 1) * 1122}px`,
        }}
      >
        {/* Visual 1-Page Boundary Guide at 297mm */}
        <div
          ref={guideRef}
          id="cv-page-break-guide"
          className="cv-page-break-guide no-print"
        >
          <span className="cv-page-break-label">End of Page 1 (A4 297mm)</span>
        </div>

        {/* Inner Content Wrapper for Height Measurement */}
        <div ref={contentRef} id="cv-a4-content">
          {/* CV Header */}
          <div
            onClick={() => setActiveNav('profile')}
            className="cv-header cursor-pointer hover:bg-blue-50/30 rounded transition px-1"
          >
            <div className="cv-name">{data.profile.name}</div>
            <div className="cv-role">{loc(data.profile.title, lang)}</div>
            <div className="cv-contact">
              {data.profile.phone && <span>{data.profile.phone}</span>}
              {loc(data.profile.location, lang) && (
                <span>
                  {' '}
                  &bull; <span>{loc(data.profile.location, lang)}</span>
                </span>
              )}
              {data.profile.email && (
                <span>
                  {' '}
                  &bull;{' '}
                  <a href={`mailto:${data.profile.email}`}>
                    {data.profile.email}
                  </a>
                </span>
              )}
              {data.profile.linkedinUrl && (
                <span>
                  {' '}
                  &bull;{' '}
                  <a
                    href={data.profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {loc(data.profile.linkedinLabel, lang) || 'LinkedIn'}
                  </a>
                </span>
              )}
              {data.profile.githubUrl && (
                <span>
                  {' '}
                  &bull;{' '}
                  <a
                    href={data.profile.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {loc(data.profile.githubLabel, lang) || 'GitHub'}
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Ordered CV Sections */}
          {(data.sections || []).map((sec) => {
            if (!sec.enabled) return null;

            if (sec.type === 'summary') {
              const sum = loc(data.profile.summary, lang);
              if (!sum) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('summary')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <div className="text-justify">
                    <LatexInline text={sum} />
                  </div>
                </div>
              );
            }

            if (sec.type === 'education') {
              const items = (data.education || []).filter((e) => e.enabled);
              if (!items.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('education')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <div className="space-y-1.5">
                    {items.map((edu) => (
                      <div key={edu.id}>
                        <div className="cv-entry-row">
                          <span className="cv-entry-left">
                            <LatexInline text={loc(edu.degree, lang)} />
                          </span>
                          <span className="cv-entry-right">
                            {loc(edu.dates, lang)}
                          </span>
                        </div>
                        <div className="italic">
                          {loc(edu.institution, lang)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.type === 'experience') {
              const items = (data.experience || []).filter((x) => x.enabled);
              if (!items.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('experience')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <div className="space-y-2">
                    {items.map((exp) => (
                      <div key={exp.id}>
                        <div className="cv-entry-row">
                          <span className="cv-entry-left">
                            <span>{loc(exp.role, lang)}</span>
                            {loc(exp.company, lang) && (
                              <span>
                                ,{' '}
                                <em className="italic font-bold">
                                  {loc(exp.company, lang)}
                                </em>
                              </span>
                            )}
                          </span>
                          <span className="cv-entry-right">
                            {loc(exp.dates, lang)}
                          </span>
                        </div>
                        <ul className="cv-itemize-dash">
                          {(exp.bullets || [])
                            .filter((b) => b.enabled)
                            .map((b) => (
                              <li key={b.id}>
                                <LatexInline text={loc(b.text, lang)} />
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (sec.type === 'projects') {
              const items = (data.projects || []).filter((p) => p.enabled);
              if (!items.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('projects')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <ul className="cv-itemize-dash cv-projects-list">
                    {items.map((proj) => (
                      <li key={proj.id}>
                        <div>
                          <strong>
                            {loc(proj.name, lang).replace(/[\s:]+$/, '') +
                              colonSpace}
                          </strong>{' '}
                          <span className="cv-tech">
                            {loc(proj.techStack, lang)}
                          </span>
                        </div>
                        <div>
                          <LatexInline text={loc(proj.description, lang)} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            if (sec.type === 'skills') {
              const items = (data.skills || []).filter((s) => s.enabled);
              if (!items.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('skills')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <ul className="cv-itemize-dash cv-skills-list">
                    {items.map((sk) => (
                      <li key={sk.id}>
                        <strong>
                          {loc(sk.category, lang).replace(/[\s:]+$/, '') +
                            colonSpace}
                        </strong>{' '}
                        <LatexInline text={loc(sk.items, lang)} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            if (sec.type === 'certifications') {
              const items = (data.certifications || []).filter(
                (c) => c.enabled
              );
              if (!items.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('certifications')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <ul className="cv-itemize-dash">
                    {items.map((cert) => {
                      const cTitle = loc(cert.title, lang);
                      const cIssuer = loc(cert.issuer, lang);
                      return (
                        <li key={cert.id}>
                          <strong>{cTitle}</strong>
                          {cIssuer && (
                            <span>
                              {(cTitle.endsWith(':') ? ' ' : ' – ') + cIssuer}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            }

            if (sec.type === 'languages') {
              if (!enabledSpoken.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav('languages')}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  <ul className="cv-itemize-dash">
                    <li>
                      {enabledSpoken.map((sp, spIdx) => (
                        <span key={sp.id}>
                          <strong>
                            {loc(sp.language, lang).replace(/[\s:]+$/, '') +
                              colonSpace}
                          </strong>
                          <span> {loc(sp.level, lang)}</span>
                          {spIdx < enabledSpoken.length - 1 && (
                            <span> &nbsp;&bull;&nbsp; </span>
                          )}
                        </span>
                      ))}
                    </li>
                  </ul>
                </div>
              );
            }

            if (sec.type.startsWith('custom')) {
              const items = ((data.customSections || {})[sec.id] || []).filter(
                (it) => it.enabled
              );
              if (!items.length) return null;
              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveNav(`custom:${sec.id}`)}
                  className="cursor-pointer hover:bg-blue-50/20 rounded transition"
                >
                  <div className="cv-section-title">{loc(sec.title, lang)}</div>
                  {sec.type === 'custom_bullets' ? (
                    <ul className="cv-itemize-dash">
                      {items.map((it) => (
                        <li key={it.id}>
                          {loc(it.title, lang) && (
                            <strong>{loc(it.title, lang)}: </strong>
                          )}
                          <LatexInline text={loc(it.description, lang)} />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="space-y-1.5">
                      {items.map((it) => (
                        <div key={it.id}>
                          <div className="cv-entry-row">
                            <span className="cv-entry-left">
                              <span>{loc(it.title, lang)}</span>
                              {loc(it.subtitle, lang) && (
                                <span>
                                  ,{' '}
                                  <em className="italic font-normal">
                                    {loc(it.subtitle, lang)}
                                  </em>
                                </span>
                              )}
                            </span>
                            <span className="cv-entry-right">
                              {loc(it.dates, lang)}
                            </span>
                          </div>
                          {loc(it.description, lang) && (
                            <div>
                              <LatexInline text={loc(it.description, lang)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>
    </div>
  );
};
