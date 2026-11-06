import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  HIPP_OPTIONS,
  MAX_DOCUMENTS,
  MIN_DOCUMENTS,
  type DbqBodyParagraph,
  type DbqDocument,
  type HippElement,
} from '../lib/dbq';
import { SENTENCE_COLORS } from '../lib/mpe';
import SentenceField from './SentenceField';

type DbqBodyCardProps = {
  index: number;
  paragraph: DbqBodyParagraph;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (paragraph: DbqBodyParagraph) => void;
  onAddDocument: () => void;
};

function updateDocument(
  paragraph: DbqBodyParagraph,
  documentIndex: number,
  patch: Partial<DbqDocument>,
): DbqBodyParagraph {
  return {
    ...paragraph,
    documents: paragraph.documents.map((document, index) =>
      index === documentIndex ? { ...document, ...patch } : document,
    ),
  };
}

export default function DbqBodyCard({
  index,
  paragraph,
  canRemove,
  onRemove,
  onChange,
  onAddDocument,
}: DbqBodyCardProps) {
  const hipp = SENTENCE_COLORS.hipp;
  const outside = SENTENCE_COLORS.outsideEvidence;
  const canAddDocument = paragraph.documents.length < MAX_DOCUMENTS;
  const canRemoveDocument = paragraph.documents.length > MIN_DOCUMENTS;

  return (
    <Card variant="outlined" sx={{ borderTop: '3px solid #15803d' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
          >
            <Box>
              <Typography variant="h6">Body Paragraph {index + 1}</Typography>
              <Typography variant="body2" color="text.secondary">
                Prove one part of your line of reasoning with documents, sourcing,
                and outside evidence. Row C is worth up to 3 points. Row D sourcing
                is worth 1 point across the essay.
              </Typography>
            </Box>
            <Tooltip title={canRemove ? 'Remove this paragraph' : 'Keep at least one body paragraph'}>
              <span>
                <IconButton
                  aria-label={`Remove body paragraph ${index + 1}`}
                  onClick={onRemove}
                  disabled={!canRemove}
                >
                  <DeleteOutlinedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <SentenceField
            kind="ts"
            label="Topic Sentence"
            placeholder="State the part of your line of reasoning this paragraph will prove."
            helperText="Connect this claim back to the thesis."
            value={paragraph.topicSentence}
            onChange={(topicSentence) => onChange({ ...paragraph, topicSentence })}
          />

          {paragraph.documents.map((document, documentIndex) => (
            <Stack
              key={documentIndex}
              spacing={2}
              sx={{
                p: 1.5,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {paragraph.documents.length > 1
                    ? `Document ${documentIndex + 1}`
                    : 'Document'}
                </Typography>
                {canRemoveDocument ? (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<RemoveCircleOutlinedIcon />}
                    onClick={() =>
                      onChange({
                        ...paragraph,
                        documents: paragraph.documents.filter(
                          (_, current) => current !== documentIndex,
                        ),
                      })
                    }
                  >
                    Remove document
                  </Button>
                ) : null}
              </Stack>

              <TextField
                label="Document label"
                placeholder="Document 1 — speech, letter, cartoon, or chart"
                value={document.label}
                onChange={(event) =>
                  onChange(
                    updateDocument(paragraph, documentIndex, {
                      label: event.target.value,
                    }),
                  )
                }
                helperText="Use the label from the document set."
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <SentenceField
                kind="cd"
                label="Evidence from the document"
                placeholder="Accurately describe what this document says or shows."
                helperText="Describe the content that addresses the prompt."
                value={document.content}
                onChange={(content) =>
                  onChange(updateDocument(paragraph, documentIndex, { content }))
                }
              />
              <SentenceField
                kind="cm"
                label="Use in the argument"
                placeholder="Explain how this document supports this paragraph’s claim and the thesis."
                helperText="Explain how this document supports the paragraph’s claim."
                value={document.argumentLink}
                onChange={(argumentLink) =>
                  onChange(updateDocument(paragraph, documentIndex, { argumentLink }))
                }
              />
              <FormControl fullWidth>
                <InputLabel
                  id={`hipp-${index}-${documentIndex}`}
                  shrink
                  sx={{
                    color: hipp.main,
                    fontWeight: 800,
                    '&.Mui-focused': { color: hipp.main },
                  }}
                >
                  HIPP element
                </InputLabel>
                <Select
                  labelId={`hipp-${index}-${documentIndex}`}
                  label="HIPP element"
                  displayEmpty
                  notched
                  value={document.hippElement}
                  onChange={(event) =>
                    onChange(
                      updateDocument(paragraph, documentIndex, {
                        hippElement: String(event.target.value) as HippElement,
                      }),
                    )
                  }
                  sx={{
                    bgcolor: hipp.bg,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: hipp.main,
                      borderWidth: 2,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: hipp.main,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: hipp.main,
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Choose situation, audience, purpose, or point of view</em>
                  </MenuItem>
                  {HIPP_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Choose the HIPP element you will explain. Do this for at least two documents.
                </FormHelperText>
              </FormControl>
              <SentenceField
                kind="hipp"
                label="Sourcing — how HIPP matters"
                placeholder="Explain how or why that situation, audience, purpose, or point of view is relevant to your argument."
                helperText="Explain how or why this element is relevant to your argument."
                value={document.hippExplanation}
                onChange={(hippExplanation) =>
                  onChange(
                    updateDocument(paragraph, documentIndex, { hippExplanation }),
                  )
                }
              />
            </Stack>
          ))}

          {canAddDocument ? (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddDocument}>
              Add document
            </Button>
          ) : null}

          <Stack
            spacing={2}
            sx={{
              p: 1.5,
              border: '1px dashed',
              borderColor: outside.main,
              borderRadius: 2,
              bgcolor: outside.bg,
            }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ color: outside.main }}>
                Evidence beyond the documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Row C · 1 point. The essay needs at least one specific fact that is
                not in the document set.
              </Typography>
            </Box>
            <SentenceField
              kind="outsideEvidence"
              label="Outside evidence"
              placeholder="Name a specific event, person, law, or example that the documents do not provide."
              value={paragraph.outsideEvidence}
              onChange={(outsideEvidence) =>
                onChange({ ...paragraph, outsideEvidence })
              }
            />
            <SentenceField
              kind="outsideEvidence"
              label="How the outside evidence supports the argument"
              placeholder="Show how that fact proves this paragraph’s claim."
              value={paragraph.outsideEvidenceLink}
              onChange={(outsideEvidenceLink) =>
                onChange({ ...paragraph, outsideEvidenceLink })
              }
            />
          </Stack>

          <SentenceField
            kind="cs"
            label="Concluding Sentence"
            placeholder="Close this paragraph’s claim and lead into the next part of your line of reasoning."
            value={paragraph.concludingSentence}
            onChange={(concludingSentence) =>
              onChange({ ...paragraph, concludingSentence })
            }
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
