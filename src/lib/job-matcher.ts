import type { CvData, ProjectItem } from '../types/cv';
import { loc } from './latex-generator';

const BASE_LEXICON = [
  'python', 'rust', 'sql', 'typescript', 'javascript', 'java', 'react', 'next.js', 'nextjs', 'vue.js', 'laravel',
  'fastapi', 'spring boot', 'axum', 'tauri', 'docker', 'kubernetes', 'aws', 'linux', 'git', 'github actions', 'ci/cd',
  'llm', 'llms', 'rag', 'langchain', 'langgraph', 'agents', 'agentic', 'prompt engineering', 'llama.cpp', 'onnx',
  'whisper', 'faster-whisper', 'tts', 'stt', 'voice', 'speech', 'nlp', 'ocr', 'embeddings', 'reranking', 'hybrid search',
  'bm25', 'qdrant', 'lancedb', 'faiss', 'milvus', 'chromadb', 'vector', 'postgresql', 'postgis', 'mysql', 'redis',
  'sqlite', 'duckdb', 'clickhouse', 's3', 'minio', 'rustfs', 'kafka', 'redpanda', 'airflow', 'dbt', 'pyspark', 'spark',
  'etl', 'data warehouse', 'medallion', 'streaming', 'metabase', 'bi', 'geospatial', 'pytorch', 'scikit-learn',
  'xgboost', 'optuna', 'shap', 'mlflow', 'prometheus', 'mlops', 'machine learning', 'deep learning', 'data science',
  'classification', 'recommendation', 'pandas', 'numpy', 'pydantic', 'websocket', 'sse', 'rest', 'api', 'agile', 'scrum',
];

export function extractJobKeywords(jobOfferText: string, data: CvData): string[] {
  const text = (jobOfferText || '').toLowerCase();
  if (!text.trim()) return [];

  const vocabulary = new Set<string>(BASE_LEXICON);
  (data?.projects || []).forEach((p) => {
    (p.tags || []).forEach((t) => vocabulary.add(t.toLowerCase()));
    loc(p.techStack, 'en')
      .split(',')
      .forEach((t) => {
        const clean = t.trim().toLowerCase();
        if (clean.length > 1) vocabulary.add(clean);
      });
  });

  const matched: string[] = [];
  vocabulary.forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i');
    if (regex.test(text)) {
      matched.push(term);
    }
  });

  return matched.sort();
}

export function scoreProjectMatch(
  proj: ProjectItem,
  extractedKeywords: string[]
): { score: number; matched: string[] } {
  if (!extractedKeywords.length) return { score: 0, matched: [] };

  const haystack = [
    loc(proj.name, 'en'),
    loc(proj.name, 'fr'),
    loc(proj.techStack, 'en'),
    loc(proj.description, 'en'),
    loc(proj.description, 'fr'),
    ...(proj.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  const hits = extractedKeywords.filter((kw) => haystack.includes(kw));
  const rawRatio = hits.length / Math.min(extractedKeywords.length, 7);
  const pct = Math.min(99, Math.round(rawRatio * 100));
  return { score: pct, matched: hits };
}
