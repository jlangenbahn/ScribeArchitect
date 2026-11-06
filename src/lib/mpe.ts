export const TEMPLATE_OPTIONS = [
  {
    value: 'MULTI_PARAGRAPH' as const,
    label: 'Multi-Paragraph Essay',
    shortLabel: 'Multi-Paragraph',
  },
  {
    value: 'DOCUMENT_BASED_QUESTION' as const,
    label: 'Document-Based Question (DBQ)',
    shortLabel: 'DBQ',
  },
];

export type EssayTemplateType = (typeof TEMPLATE_OPTIONS)[number]['value'];

export type SentenceKind =
  | 'hook'
  | 'bridge'
  | 'context'
  | 'thesis'
  | 'ts'
  | 'cd'
  | 'cm'
  | 'cs'
  | 'hipp'
  | 'outsideEvidence'
  | 'restatedThesis'
  | 'summary'
  | 'complexity'
  | 'clincher';

export const SENTENCE_COLORS: Record<
  SentenceKind,
  { main: string; bg: string }
> = {
  hook: { main: '#b45309', bg: '#fff7ed' },
  bridge: { main: '#0f766e', bg: '#f0fdfa' },
  context: { main: '#0f766e', bg: '#f0fdfa' },
  thesis: { main: '#6d28d9', bg: '#f5f3ff' },
  ts: { main: '#15803d', bg: '#f0fdf4' },
  cd: { main: '#111827', bg: '#f8fafc' },
  cm: { main: '#1d4ed8', bg: '#eff6ff' },
  cs: { main: '#c2410c', bg: '#fff7ed' },
  hipp: { main: '#b45309', bg: '#fff7ed' },
  outsideEvidence: { main: '#4338ca', bg: '#eef2ff' },
  restatedThesis: { main: '#a21caf', bg: '#fdf4ff' },
  summary: { main: '#334155', bg: '#f8fafc' },
  complexity: { main: '#be123c', bg: '#fff1f2' },
  clincher: { main: '#be123c', bg: '#fff1f2' },
};

export type EvidenceChunk = {
  concreteDetail: string;
  commentary1: string;
  commentary2: string;
};

export type BodyParagraph = {
  topicSentence: string;
  chunks: EvidenceChunk[];
  concludingSentence: string;
};

export type MpeContent = {
  introduction: {
    hook: string;
    bridge1: string;
    bridge2: string;
    bridge3: string;
    thesis: string;
  };
  bodyParagraphs: BodyParagraph[];
  conclusion: {
    restatedThesis: string;
    summary1: string;
    summary2: string;
    summary3: string;
    clincher: string;
  };
};

export const MIN_BODY_PARAGRAPHS = 1;
export const DEFAULT_BODY_PARAGRAPHS = 3;
export const MAX_BODY_PARAGRAPHS = 8;
export const MAX_EVIDENCE_CHUNKS = 2;

export function createEvidenceChunk(): EvidenceChunk {
  return {
    concreteDetail: '',
    commentary1: '',
    commentary2: '',
  };
}

export function createBodyParagraph(): BodyParagraph {
  return {
    topicSentence: '',
    chunks: [createEvidenceChunk()],
    concludingSentence: '',
  };
}

export function createEmptyMpe(): MpeContent {
  return {
    introduction: {
      hook: '',
      bridge1: '',
      bridge2: '',
      bridge3: '',
      thesis: '',
    },
    bodyParagraphs: Array.from(
      { length: DEFAULT_BODY_PARAGRAPHS },
      createBodyParagraph,
    ),
    conclusion: {
      restatedThesis: '',
      summary1: '',
      summary2: '',
      summary3: '',
      clincher: '',
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseChunk(value: unknown): EvidenceChunk {
  const row = asRecord(value);
  return {
    concreteDetail: asString(row.concreteDetail),
    commentary1: asString(row.commentary1),
    commentary2: asString(row.commentary2),
  };
}

function parseBodyParagraph(value: unknown): BodyParagraph {
  const row = asRecord(value);
  const chunks = Array.isArray(row.chunks)
    ? row.chunks.map(parseChunk).slice(0, MAX_EVIDENCE_CHUNKS)
    : [];
  return {
    topicSentence: asString(row.topicSentence),
    chunks: chunks.length > 0 ? chunks : [createEvidenceChunk()],
    concludingSentence: asString(row.concludingSentence),
  };
}

export function parseMpeContent(raw: unknown): MpeContent {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return createEmptyMpe();
    }
  }
  const row = asRecord(value);
  const intro = asRecord(row.introduction);
  const conclusion = asRecord(row.conclusion);
  const bodyParagraphs = Array.isArray(row.bodyParagraphs)
    ? row.bodyParagraphs.map(parseBodyParagraph)
    : [];

  return {
    introduction: {
      hook: asString(intro.hook),
      bridge1: asString(intro.bridge1),
      bridge2: asString(intro.bridge2),
      bridge3: asString(intro.bridge3),
      thesis: asString(intro.thesis),
    },
    bodyParagraphs:
      bodyParagraphs.length > 0
        ? bodyParagraphs.slice(0, MAX_BODY_PARAGRAPHS)
        : createEmptyMpe().bodyParagraphs,
    conclusion: {
      restatedThesis: asString(conclusion.restatedThesis),
      summary1: asString(conclusion.summary1),
      summary2: asString(conclusion.summary2),
      summary3: asString(conclusion.summary3),
      clincher: asString(conclusion.clincher),
    },
  };
}

export function displayTitle(title?: string | null): string {
  const trimmed = String(title ?? '').trim();
  return trimmed || 'Untitled essay';
}

export function templateShortLabel(value?: string | null): string {
  const match = TEMPLATE_OPTIONS.find((option) => option.value === value);
  return match?.shortLabel ?? 'Essay';
}
