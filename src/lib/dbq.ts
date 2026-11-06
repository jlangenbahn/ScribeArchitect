export const DBQ_MAX_POINTS = 7;
export const MIN_BODY_PARAGRAPHS = 1;
export const DEFAULT_BODY_PARAGRAPHS = 2;
export const MAX_BODY_PARAGRAPHS = 6;
export const MIN_DOCUMENTS = 1;
export const DEFAULT_DOCUMENTS = 2;
export const MAX_DOCUMENTS = 4;

export const HIPP_OPTIONS = [
  { value: 'historicalSituation', label: 'Historical situation' },
  { value: 'audience', label: 'Audience' },
  { value: 'purpose', label: 'Purpose' },
  { value: 'pointOfView', label: 'Point of view' },
] as const;

export type HippElement = (typeof HIPP_OPTIONS)[number]['value'] | '';

export type DbqDocument = {
  label: string;
  content: string;
  argumentLink: string;
  hippElement: HippElement;
  hippExplanation: string;
};

export type DbqBodyParagraph = {
  topicSentence: string;
  documents: DbqDocument[];
  outsideEvidence: string;
  outsideEvidenceLink: string;
  concludingSentence: string;
};

export type DbqContent = {
  prompt: string;
  introduction: {
    contextualization: string;
    contextualizationLink: string;
    thesis: string;
  };
  bodyParagraphs: DbqBodyParagraph[];
  conclusion: {
    restatedThesis: string;
    complexity: string;
  };
};

export type DbqSignal = {
  id: 'thesis' | 'context' | 'docEvidence' | 'outside' | 'sourcing' | 'complexity';
  row: 'A' | 'B' | 'C' | 'D';
  name: string;
  max: number;
  earned: number;
  detail: string;
};

export function hippLabel(value: string): string {
  return HIPP_OPTIONS.find((option) => option.value === value)?.label ?? 'HIPP';
}

export function createDocument(label: string): DbqDocument {
  return {
    label,
    content: '',
    argumentLink: '',
    hippElement: '',
    hippExplanation: '',
  };
}

export function createDbqBodyParagraph(
  firstNumber: number,
  count = DEFAULT_DOCUMENTS,
): DbqBodyParagraph {
  return {
    topicSentence: '',
    documents: Array.from({ length: count }, (_, index) =>
      createDocument(`Document ${firstNumber + index}`),
    ),
    outsideEvidence: '',
    outsideEvidenceLink: '',
    concludingSentence: '',
  };
}

export function createEmptyDbq(): DbqContent {
  return {
    prompt: '',
    introduction: {
      contextualization: '',
      contextualizationLink: '',
      thesis: '',
    },
    bodyParagraphs: Array.from({ length: DEFAULT_BODY_PARAGRAPHS }, (_, index) =>
      createDbqBodyParagraph(1 + index * DEFAULT_DOCUMENTS),
    ),
    conclusion: {
      restatedThesis: '',
      complexity: '',
    },
  };
}

export function documentCount(paragraphs: DbqBodyParagraph[]): number {
  return paragraphs.reduce((sum, paragraph) => sum + paragraph.documents.length, 0);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function parseHipp(value: unknown): HippElement {
  const text = asString(value);
  return HIPP_OPTIONS.some((option) => option.value === text)
    ? (text as HippElement)
    : '';
}

function parseDocument(value: unknown, index: number): DbqDocument {
  const row = asRecord(value);
  return {
    label: asString(row.label) || `Document ${index + 1}`,
    content: asString(row.content),
    argumentLink: asString(row.argumentLink),
    hippElement: parseHipp(row.hippElement),
    hippExplanation: asString(row.hippExplanation),
  };
}

function parseBodyParagraph(value: unknown): DbqBodyParagraph {
  const row = asRecord(value);
  const documents = Array.isArray(row.documents)
    ? row.documents.map(parseDocument).slice(0, MAX_DOCUMENTS)
    : [];
  return {
    topicSentence: asString(row.topicSentence),
    documents: documents.length > 0 ? documents : [createDocument('Document 1')],
    outsideEvidence: asString(row.outsideEvidence),
    outsideEvidenceLink: asString(row.outsideEvidenceLink),
    concludingSentence: asString(row.concludingSentence),
  };
}

export function parseDbqContent(raw: unknown): DbqContent {
  let value = raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return createEmptyDbq();
    }
  }
  const row = asRecord(value);
  const intro = asRecord(row.introduction);
  const conclusion = asRecord(row.conclusion);
  const bodyParagraphs = Array.isArray(row.bodyParagraphs)
    ? row.bodyParagraphs.map(parseBodyParagraph).slice(0, MAX_BODY_PARAGRAPHS)
    : [];

  return {
    prompt: asString(row.prompt),
    introduction: {
      contextualization: asString(intro.contextualization),
      contextualizationLink: asString(intro.contextualizationLink),
      thesis: asString(intro.thesis),
    },
    bodyParagraphs:
      bodyParagraphs.length > 0
        ? bodyParagraphs
        : createEmptyDbq().bodyParagraphs,
    conclusion: {
      restatedThesis: asString(conclusion.restatedThesis),
      complexity: asString(conclusion.complexity),
    },
  };
}

function countLabel(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

export function dbqSignals(content: DbqContent): DbqSignal[] {
  const documents = content.bodyParagraphs.flatMap((paragraph) => paragraph.documents);
  const described = documents.filter((document) => document.content.trim()).length;
  const argued = documents.filter(
    (document) => document.content.trim() && document.argumentLink.trim(),
  ).length;
  const sourced = documents.filter(
    (document) => document.hippElement && document.hippExplanation.trim(),
  ).length;
  const outsideNamed = content.bodyParagraphs.some((paragraph) =>
    paragraph.outsideEvidence.trim(),
  );
  const outsideIntegrated = content.bodyParagraphs.some(
    (paragraph) =>
      paragraph.outsideEvidence.trim() && paragraph.outsideEvidenceLink.trim(),
  );
  const thesisInIntro = Boolean(content.introduction.thesis.trim());
  const thesisInConclusion = Boolean(content.conclusion.restatedThesis.trim());
  const hasContext = Boolean(
    content.introduction.contextualization.trim() ||
      content.introduction.contextualizationLink.trim(),
  );
  const hasComplexity = Boolean(content.conclusion.complexity.trim());
  const docPoints = argued >= 4 ? 2 : described >= 3 ? 1 : 0;

  let thesisDetail = 'Add a historically defensible thesis in the introduction or conclusion.';
  if (thesisInIntro && thesisInConclusion) {
    thesisDetail = 'A thesis is in the introduction and restated in the conclusion.';
  } else if (thesisInIntro) {
    thesisDetail = 'A thesis is in the introduction.';
  } else if (thesisInConclusion) {
    thesisDetail = 'A thesis is in the conclusion.';
  }

  let docDetail = `${countLabel(described, 'document')} described. Describe at least three.`;
  if (docPoints === 2) {
    docDetail = `${countLabel(argued, 'document')} support the argument.`;
  } else if (docPoints === 1) {
    docDetail = `${countLabel(described, 'document')} described and ${countLabel(argued, 'document')} used in the argument. Use at least four in the argument for the second point.`;
  }

  let outsideDetail =
    'Add one specific historical fact that is not in the documents, then show how it supports the argument.';
  if (outsideIntegrated) {
    outsideDetail = 'Outside evidence is connected to the argument.';
  } else if (outsideNamed) {
    outsideDetail = 'Outside evidence is named. Explain how it supports the argument.';
  }

  return [
    {
      id: 'thesis',
      row: 'A',
      name: 'Thesis / Claim',
      max: 1,
      earned: thesisInIntro || thesisInConclusion ? 1 : 0,
      detail: thesisDetail,
    },
    {
      id: 'context',
      row: 'B',
      name: 'Contextualization',
      max: 1,
      earned: hasContext ? 1 : 0,
      detail: hasContext
        ? 'Broader historical context is drafted.'
        : 'Describe the setting before, during, or after the prompt’s timeframe.',
    },
    {
      id: 'docEvidence',
      row: 'C',
      name: 'Evidence from documents',
      max: 2,
      earned: docPoints,
      detail: docDetail,
    },
    {
      id: 'outside',
      row: 'C',
      name: 'Evidence beyond documents',
      max: 1,
      earned: outsideIntegrated ? 1 : 0,
      detail: outsideDetail,
    },
    {
      id: 'sourcing',
      row: 'D',
      name: 'Sourcing (HIPP)',
      max: 1,
      earned: sourced >= 2 ? 1 : 0,
      detail:
        sourced >= 2
          ? `HIPP is explained for ${countLabel(sourced, 'document')}.`
          : `HIPP is explained for ${sourced} of 2 documents.`,
    },
    {
      id: 'complexity',
      row: 'D',
      name: 'Complexity',
      max: 1,
      earned: hasComplexity ? 1 : 0,
      detail: hasComplexity
        ? 'A qualifying, modifying, or corroborating move is drafted.'
        : 'Qualify, modify, or corroborate the argument.',
    },
  ];
}

export function dbqDraftPoints(content: DbqContent): number {
  return dbqSignals(content).reduce((sum, signal) => sum + signal.earned, 0);
}
