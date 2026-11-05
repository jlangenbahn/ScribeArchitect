import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
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

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

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
