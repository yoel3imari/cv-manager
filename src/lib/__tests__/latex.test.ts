import { describe, expect, it } from 'vitest';
import sampleData from '../../../data/sample_cv_data.json';
import type { CvData } from '../../types/cv';
import {
  escapeTex,
  generateBodyTex,
  generateMainTex,
  generateStandaloneTex,
} from '../latex-generator';
import { getPdfExportBasename, getPdfExportFilename } from '../filename';
import { extractJobKeywords, scoreProjectMatch } from '../job-matcher';

const cv = sampleData as unknown as CvData;

describe('LaTeX Generator & Job Matcher Engine', () => {
  it('escapes special characters and converts markdown backticks into \\tech{}', () => {
    expect(escapeTex('100% accuracy & `FastAPI` service')).toBe(
      '100\\% accuracy \\& \\tech{FastAPI} service'
    );
  });

  it('generates valid main.tex and body.tex for English and French', () => {
    const mainEn = generateMainTex(cv, 'en');
    expect(mainEn).toContain('\\documentclass[11pt,a4paper]{article}');
    expect(mainEn).toContain('\\input{cv_latex_en}');

    const bodyEn = generateBodyTex(cv, 'en');
    expect(bodyEn).toContain('{\\Huge\\bfseries Alex MERCER}');
    expect(bodyEn).toContain('\\section*{Projects}');

    const bodyFr = generateBodyTex(cv, 'fr');
    expect(bodyFr).toContain('\\section*{Projets Techniques}');
    // French spacing before colon
    expect(bodyFr).toContain(' :}');

    const standalone = generateStandaloneTex(cv, 'en');
    expect(standalone).not.toContain('\\input{cv_latex_en}');
    expect(standalone).toContain('\\section*{Projects}');
  });

  it('computes smart PDF export filenames', () => {
    expect(getPdfExportBasename(cv, 'en')).toBe(
      'alex_mercer_genai_llm_en_cv'
    );
    expect(getPdfExportFilename(cv, 'fr')).toBe(
      'alex_mercer_genai_llm_fr_cv.pdf'
    );
  });

  it('extracts keywords and scores project relevance', () => {
    const kws = extractJobKeywords(
      'Looking for an AI Engineer skilled in Python, FastAPI, LangChain, Qdrant, RAG, and Docker.',
      cv
    );
    expect(kws).toContain('python');
    expect(kws).toContain('langchain');
    expect(kws).toContain('qdrant');

    const ragProj = cv.projects[0];
    const score = scoreProjectMatch(ragProj, kws);
    expect(score.score).toBeGreaterThanOrEqual(75);
  });
});
