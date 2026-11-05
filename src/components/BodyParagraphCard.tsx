import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import RemoveCircleOutlinedIcon from '@mui/icons-material/RemoveCircleOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  MAX_EVIDENCE_CHUNKS,
  type BodyParagraph,
  type EvidenceChunk,
} from '../lib/mpe';
import SentenceField from './SentenceField';

type BodyParagraphCardProps = {
  index: number;
  paragraph: BodyParagraph;
  canRemove: boolean;
  onRemove: () => void;
  onChange: (paragraph: BodyParagraph) => void;
};

function updateChunk(
  paragraph: BodyParagraph,
  chunkIndex: number,
  patch: Partial<EvidenceChunk>,
): BodyParagraph {
  return {
    ...paragraph,
    chunks: paragraph.chunks.map((chunk, index) =>
      index === chunkIndex ? { ...chunk, ...patch } : chunk,
    ),
  };
}

export default function BodyParagraphCard({
  index,
  paragraph,
  canRemove,
  onRemove,
  onChange,
}: BodyParagraphCardProps) {
  const canAddChunk = paragraph.chunks.length < MAX_EVIDENCE_CHUNKS;

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
                Prove one specific part of your thesis, then transition to the
                next idea.
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
            label="Topic Sentence (TS)"
            placeholder="State this paragraph’s main idea and connect it back to the thesis."
            value={paragraph.topicSentence}
            onChange={(topicSentence) =>
              onChange({ ...paragraph, topicSentence })
            }
          />

          {paragraph.chunks.map((chunk, chunkIndex) => (
            <Stack
              key={chunkIndex}
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
                  {paragraph.chunks.length > 1
                    ? `Evidence chunk ${chunkIndex + 1}`
                    : 'Evidence chunk'}
                </Typography>
                {chunkIndex > 0 ? (
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={<RemoveCircleOutlinedIcon />}
                    onClick={() =>
                      onChange({
                        ...paragraph,
                        chunks: paragraph.chunks.filter(
                          (_, current) => current !== chunkIndex,
                        ),
                      })
                    }
                  >
                    Remove chunk
                  </Button>
                ) : null}
              </Stack>
              <SentenceField
                kind="cd"
                label="Concrete Detail (CD)"
                placeholder="Add a fact, quote, statistic, or specific example that supports the topic sentence."
                value={chunk.concreteDetail}
                onChange={(concreteDetail) =>
                  onChange(updateChunk(paragraph, chunkIndex, { concreteDetail }))
                }
              />
              <SentenceField
                kind="cm"
                label="Commentary (CM) — What it means"
                placeholder="Explain what this evidence means."
                value={chunk.commentary1}
                onChange={(commentary1) =>
                  onChange(updateChunk(paragraph, chunkIndex, { commentary1 }))
                }
              />
              <SentenceField
                kind="cm"
                label="Commentary (CM) — Why it matters"
                placeholder="Explain why this evidence matters and how it proves the topic sentence and thesis."
                value={chunk.commentary2}
                onChange={(commentary2) =>
                  onChange(updateChunk(paragraph, chunkIndex, { commentary2 }))
                }
              />
            </Stack>
          ))}

          {canAddChunk ? (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() =>
                onChange({
                  ...paragraph,
                  chunks: [
                    ...paragraph.chunks,
                    {
                      concreteDetail: '',
                      commentary1: '',
                      commentary2: '',
                    },
                  ],
                })
              }
            >
              Add second evidence chunk (CD + CM + CM)
            </Button>
          ) : null}

          <SentenceField
            kind="cs"
            label="Concluding Sentence (CS)"
            placeholder="Wrap up this paragraph’s main idea and transition to the next paragraph."
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
