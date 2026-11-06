import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import {
  createDbqBodyParagraph,
  createDocument,
  documentCount,
  MAX_BODY_PARAGRAPHS,
  MIN_BODY_PARAGRAPHS,
  type DbqContent,
} from '../lib/dbq';
import DbqBodyCard from './DbqBodyCard';
import DbqScorecard from './DbqScorecard';
import SentenceField from './SentenceField';

type DocumentBasedQuestionProps = {
  title: string;
  content: DbqContent;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: DbqContent) => void;
  onSave: () => void;
  onDownload: () => void;
};

export default function DocumentBasedQuestion({
  title,
  content,
  saving,
  onTitleChange,
  onContentChange,
  onSave,
  onDownload,
}: DocumentBasedQuestionProps) {
  const intro = content.introduction;
  const conclusion = content.conclusion;
  const canAddParagraph = content.bodyParagraphs.length < MAX_BODY_PARAGRAPHS;
  const canRemoveParagraph = content.bodyParagraphs.length > MIN_BODY_PARAGRAPHS;

  function updateIntro(patch: Partial<DbqContent['introduction']>) {
    onContentChange({
      ...content,
      introduction: { ...intro, ...patch },
    });
  }

  function updateConclusion(patch: Partial<DbqContent['conclusion']>) {
    onContentChange({
      ...content,
      conclusion: { ...conclusion, ...patch },
    });
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <Box>
            <Typography variant="h5">Document-Based Question</Typography>
            <Typography variant="body2" color="text.secondary">
              Build a 7-point essay: thesis, context, document evidence, outside
              evidence, HIPP sourcing, and complexity.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip label="Template: Document-Based Question" />
            <Chip label="7 points max" variant="outlined" />
          </Stack>
        </Stack>

        <TextField
          label="Essay title"
          placeholder="Give this essay a name you will recognize later"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <TextField
          label="DBQ prompt"
          placeholder="Paste the document-based question you are answering."
          helperText="Your thesis should respond to this prompt with a clear line of reasoning."
          value={content.prompt}
          onChange={(event) =>
            onContentChange({ ...content, prompt: event.target.value })
          }
          slotProps={{ inputLabel: { shrink: true } }}
          multiline
          minRows={2}
          fullWidth
        />

        <DbqScorecard content={content} />

        <Card variant="outlined" sx={{ borderTop: '3px solid #6d28d9' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Introduction</Typography>
                <Typography variant="body2" color="text.secondary">
                  Set the historical stage, then state a defensible claim. Row B
                  Contextualization is 0–1. Row A Thesis / Claim is 0–1 and can
                  live here or in the conclusion.
                </Typography>
              </Box>
              <SentenceField
                kind="context"
                label="Contextualization — broader setting"
                placeholder="Describe relevant events before, during, or after the prompt’s timeframe."
                helperText="Row B · 1 point. Describe the background that sets the stage for the prompt."
                value={intro.contextualization}
                onChange={(contextualization) => updateIntro({ contextualization })}
              />
              <SentenceField
                kind="context"
                label="Contextualization — link to the prompt (optional)"
                placeholder="Connect that background to the time and topic of the prompt."
                helperText="Show why this context matters to the question being asked."
                value={intro.contextualizationLink}
                onChange={(contextualizationLink) =>
                  updateIntro({ contextualizationLink })
                }
              />
              <SentenceField
                kind="thesis"
                label="Thesis / Claim"
                placeholder="State a historically defensible claim and the line of reasoning you will prove."
                helperText="Row A · 1 point. Write one or more sentences. The claim must answer the prompt."
                value={intro.thesis}
                onChange={(thesis) => updateIntro({ thesis })}
              />
            </Stack>
          </CardContent>
        </Card>

        {content.bodyParagraphs.map((paragraph, index) => (
          <DbqBodyCard
            key={index}
            index={index}
            paragraph={paragraph}
            canRemove={canRemoveParagraph}
            onRemove={() =>
              onContentChange({
                ...content,
                bodyParagraphs: content.bodyParagraphs.filter(
                  (_, current) => current !== index,
                ),
              })
            }
            onAddDocument={() =>
              onContentChange({
                ...content,
                bodyParagraphs: content.bodyParagraphs.map((current, currentIndex) =>
                  currentIndex === index
                    ? {
                        ...current,
                        documents: [
                          ...current.documents,
                          createDocument(
                            `Document ${documentCount(content.bodyParagraphs) + 1}`,
                          ),
                        ],
                      }
                    : current,
                ),
              })
            }
            onChange={(nextParagraph) =>
              onContentChange({
                ...content,
                bodyParagraphs: content.bodyParagraphs.map((current, currentIndex) =>
                  currentIndex === index ? nextParagraph : current,
                ),
              })
            }
          />
        ))}

        <Box>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            disabled={!canAddParagraph}
            onClick={() =>
              onContentChange({
                ...content,
                bodyParagraphs: [
                  ...content.bodyParagraphs,
                  createDbqBodyParagraph(documentCount(content.bodyParagraphs) + 1),
                ],
              })
            }
          >
            Add body paragraph
          </Button>
        </Box>

        <Card variant="outlined" sx={{ borderTop: '3px solid #be123c' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Conclusion</Typography>
                <Typography variant="body2" color="text.secondary">
                  Restate the claim and show a complex understanding. Row A can be
                  earned here. Row D Complexity is 0–1.
                </Typography>
              </Box>
              <SentenceField
                kind="restatedThesis"
                label="Restated Thesis / Claim"
                placeholder="State the claim again in new wording, with the line of reasoning still clear."
                helperText="Row A · 1 point. A thesis in the conclusion can earn this point."
                value={conclusion.restatedThesis}
                onChange={(restatedThesis) => updateConclusion({ restatedThesis })}
              />
              <SentenceField
                kind="complexity"
                label="Complexity"
                placeholder="Qualify, modify, or corroborate the argument. You might weigh another perspective, or show both continuity and change."
                helperText="Row D · 1 point. Explain how that nuance changes or confirms the argument."
                value={conclusion.complexity}
                onChange={(complexity) => updateConclusion({ complexity })}
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={onSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save essay'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
          >
            Download Word (.docx)
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
