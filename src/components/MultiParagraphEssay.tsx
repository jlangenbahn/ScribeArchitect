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
  createBodyParagraph,
  MAX_BODY_PARAGRAPHS,
  MIN_BODY_PARAGRAPHS,
  type MpeContent,
} from '../lib/mpe';
import BodyParagraphCard from './BodyParagraphCard';
import SentenceField from './SentenceField';

type MultiParagraphEssayProps = {
  title: string;
  content: MpeContent;
  saving: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: MpeContent) => void;
  onSave: () => void;
  onDownload: () => void;
};

export default function MultiParagraphEssay({
  title,
  content,
  saving,
  onTitleChange,
  onContentChange,
  onSave,
  onDownload,
}: MultiParagraphEssayProps) {
  const intro = content.introduction;
  const conclusion = content.conclusion;
  const canAddParagraph =
    content.bodyParagraphs.length < MAX_BODY_PARAGRAPHS;
  const canRemoveParagraph =
    content.bodyParagraphs.length > MIN_BODY_PARAGRAPHS;

  function updateIntro(patch: Partial<MpeContent['introduction']>) {
    onContentChange({
      ...content,
      introduction: { ...intro, ...patch },
    });
  }

  function updateConclusion(patch: Partial<MpeContent['conclusion']>) {
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
            <Typography variant="h5">Multi-Paragraph Essay</Typography>
            <Typography variant="body2" color="text.secondary">
              Fill each color-coded sentence to build a complete essay.
            </Typography>
          </Box>
          <Chip label="Template: Multi-Paragraph Essay" />
        </Stack>

        <TextField
          label="Essay title"
          placeholder="Give this essay a name you will recognize later"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />

        <Card variant="outlined" sx={{ borderTop: '3px solid #6d28d9' }}>
          <CardContent>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6">Introduction Paragraph</Typography>
                <Typography variant="body2" color="text.secondary">
                  Move from broad to narrow, ending with your core argument.
                </Typography>
              </Box>
              <SentenceField
                kind="hook"
                label="Hook"
                placeholder="Open with a quote, a bold statement, a question, or a brief anecdote."
                value={intro.hook}
                onChange={(hook) => updateIntro({ hook })}
              />
              <SentenceField
                kind="bridge"
                label="Bridge (Context) — Sentence 1"
                placeholder="Connect the hook to the topic with necessary background."
                value={intro.bridge1}
                onChange={(bridge1) => updateIntro({ bridge1 })}
              />
              <SentenceField
                kind="bridge"
                label="Bridge (Context) — Sentence 2"
                placeholder="Define key terms or introduce the text or subject being analyzed."
                value={intro.bridge2}
                onChange={(bridge2) => updateIntro({ bridge2 })}
              />
              <SentenceField
                kind="bridge"
                label="Bridge (Context) — Sentence 3 (optional)"
                placeholder="Add one more background sentence if the reader still needs context."
                value={intro.bridge3}
                onChange={(bridge3) => updateIntro({ bridge3 })}
              />
              <SentenceField
                kind="thesis"
                label="Thesis Statement"
                placeholder="Write the overarching argument. Everything that follows must prove this sentence."
                value={intro.thesis}
                onChange={(thesis) => updateIntro({ thesis })}
              />
            </Stack>
          </CardContent>
        </Card>

        {content.bodyParagraphs.map((paragraph, index) => (
          <BodyParagraphCard
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
                  createBodyParagraph(),
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
                <Typography variant="h6">Conclusion Paragraph</Typography>
                <Typography variant="body2" color="text.secondary">
                  Move from narrow back to broad, leaving the reader with a
                  final impression.
                </Typography>
              </Box>
              <SentenceField
                kind="restatedThesis"
                label="Restated Thesis"
                placeholder="State your thesis again in new wording now that you have proven your point."
                value={conclusion.restatedThesis}
                onChange={(restatedThesis) =>
                  updateConclusion({ restatedThesis })
                }
              />
              <SentenceField
                kind="summary"
                label="Summary of Main Points — Sentence 1"
                placeholder="Remind the reader of a key argument from your body paragraphs."
                value={conclusion.summary1}
                onChange={(summary1) => updateConclusion({ summary1 })}
              />
              <SentenceField
                kind="summary"
                label="Summary of Main Points — Sentence 2"
                placeholder="Remind the reader of another key argument."
                value={conclusion.summary2}
                onChange={(summary2) => updateConclusion({ summary2 })}
              />
              <SentenceField
                kind="summary"
                label="Summary of Main Points — Sentence 3 (optional)"
                placeholder="Add a third reminder if you need one more main point."
                value={conclusion.summary3}
                onChange={(summary3) => updateConclusion({ summary3 })}
              />
              <SentenceField
                kind="clincher"
                label="The Clincher (Final Thought)"
                placeholder="Answer “So what?” with a broader real-world context, universal theme, or call to action."
                value={conclusion.clincher}
                onChange={(clincher) => updateConclusion({ clincher })}
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
