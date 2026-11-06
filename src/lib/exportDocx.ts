import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import {
  hippLabel,
  type DbqBodyParagraph,
  type DbqContent,
  type DbqDocument,
} from './dbq';
import {
  displayTitle,
  type BodyParagraph,
  type MpeContent,
  SENTENCE_COLORS,
  type SentenceKind,
} from './mpe';

function hex(kind: SentenceKind): string {
  return SENTENCE_COLORS[kind].main.replace('#', '');
}

function heading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
  });
}

function labeledSentence(
  label: string,
  text: string,
  kind: SentenceKind,
): Paragraph | null {
  const value = text.trim();
  if (!value) return null;
  return new Paragraph({
    spacing: { after: 140 },
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
        color: hex(kind),
      }),
      new TextRun({
        text: value,
      }),
    ],
  });
}

function bodySection(paragraph: BodyParagraph, index: number): Paragraph[] {
  const blocks: Array<Paragraph | null> = [
    heading(`Body Paragraph ${index + 1}`),
    labeledSentence('Topic Sentence (TS)', paragraph.topicSentence, 'ts'),
  ];

  paragraph.chunks.forEach((chunk, chunkIndex) => {
    const prefix =
      paragraph.chunks.length > 1 ? `Evidence ${chunkIndex + 1} — ` : '';
    blocks.push(
      labeledSentence(
        `${prefix}Concrete Detail (CD)`,
        chunk.concreteDetail,
        'cd',
      ),
      labeledSentence(
        `${prefix}Commentary (CM)`,
        chunk.commentary1,
        'cm',
      ),
      labeledSentence(
        `${prefix}Commentary (CM) — Why it matters`,
        chunk.commentary2,
        'cm',
      ),
    );
  });

  blocks.push(
    labeledSentence(
      'Concluding Sentence (CS)',
      paragraph.concludingSentence,
      'cs',
    ),
  );

  return blocks.filter((block): block is Paragraph => block !== null);
}

function documentBlock(source: DbqDocument, index: number): Paragraph[] {
  const blocks = [
    labeledSentence('Evidence from the document', source.content, 'cd'),
    labeledSentence('Use in the argument', source.argumentLink, 'cm'),
    labeledSentence(
      source.hippElement
        ? `Sourcing — ${hippLabel(source.hippElement)}`
        : 'Sourcing (HIPP)',
      source.hippExplanation,
      'hipp',
    ),
  ].filter((block): block is Paragraph => block !== null);

  if (blocks.length === 0) return [];

  return [
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text: source.label.trim() || `Document ${index + 1}`,
          bold: true,
        }),
      ],
    }),
    ...blocks,
  ];
}

function dbqBodySection(paragraph: DbqBodyParagraph, index: number): Paragraph[] {
  const blocks: Array<Paragraph | null> = [
    heading(`Body Paragraph ${index + 1}`),
    labeledSentence('Topic Sentence', paragraph.topicSentence, 'ts'),
    ...paragraph.documents.flatMap(documentBlock),
    labeledSentence('Outside evidence', paragraph.outsideEvidence, 'outsideEvidence'),
    labeledSentence(
      'How the outside evidence supports the argument',
      paragraph.outsideEvidenceLink,
      'outsideEvidence',
    ),
    labeledSentence('Concluding Sentence', paragraph.concludingSentence, 'cs'),
  ];

  return blocks.filter((block): block is Paragraph => block !== null);
}

async function saveDocx(doc: Document, title: string) {
  const blob = await Packer.toBlob(doc);
  const slug = displayTitle(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${slug || 'scribe-architect-essay'}.docx`;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export async function downloadDbqDocx(title: string, content: DbqContent) {
  const intro = content.introduction;
  const conclusion = content.conclusion;
  const children = [
    new Paragraph({
      text: displayTitle(title),
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    labeledSentence('DBQ prompt', content.prompt, 'summary'),
    heading('Introduction'),
    labeledSentence(
      'Contextualization — broader setting',
      intro.contextualization,
      'context',
    ),
    labeledSentence(
      'Contextualization — link to the prompt',
      intro.contextualizationLink,
      'context',
    ),
    labeledSentence('Thesis / Claim', intro.thesis, 'thesis'),
    ...content.bodyParagraphs.flatMap(dbqBodySection),
    heading('Conclusion'),
    labeledSentence('Restated Thesis / Claim', conclusion.restatedThesis, 'restatedThesis'),
    labeledSentence('Complexity', conclusion.complexity, 'complexity'),
  ].filter((block): block is Paragraph => block !== null);

  await saveDocx(
    new Document({
      sections: [{ properties: {}, children }],
    }),
    title,
  );
}

export async function downloadMpeDocx(title: string, content: MpeContent) {
  const intro = content.introduction;
  const conclusion = content.conclusion;
  const children = [
    new Paragraph({
      text: displayTitle(title),
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    }),
    heading('Introduction'),
    labeledSentence('Hook', intro.hook, 'hook'),
    labeledSentence('Bridge (Context) 1', intro.bridge1, 'bridge'),
    labeledSentence('Bridge (Context) 2', intro.bridge2, 'bridge'),
    labeledSentence('Bridge (Context) 3', intro.bridge3, 'bridge'),
    labeledSentence('Thesis Statement', intro.thesis, 'thesis'),
    ...content.bodyParagraphs.flatMap(bodySection),
    heading('Conclusion'),
    labeledSentence('Restated Thesis', conclusion.restatedThesis, 'restatedThesis'),
    labeledSentence('Summary of Main Points 1', conclusion.summary1, 'summary'),
    labeledSentence('Summary of Main Points 2', conclusion.summary2, 'summary'),
    labeledSentence('Summary of Main Points 3', conclusion.summary3, 'summary'),
    labeledSentence('The Clincher', conclusion.clincher, 'clincher'),
  ].filter((block): block is Paragraph => block !== null);

  await saveDocx(
    new Document({
      sections: [{ properties: {}, children }],
    }),
    title,
  );
}
