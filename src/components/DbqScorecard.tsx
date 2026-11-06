import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  DBQ_MAX_POINTS,
  dbqDraftPoints,
  dbqSignals,
  type DbqContent,
} from '../lib/dbq';

type DbqScorecardProps = {
  content: DbqContent;
};

export default function DbqScorecard({ content }: DbqScorecardProps) {
  const signals = dbqSignals(content);
  const points = dbqDraftPoints(content);

  return (
    <Card variant="outlined" sx={{ borderTop: '3px solid', borderTopColor: 'secondary.main' }}>
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Box>
              <Typography variant="h6">Draft checklist</Typography>
              <Typography variant="body2" color="text.secondary">
                Tracks the pieces of the 7-point DBQ rubric. A reader still has to
                judge whether the history is defensible.
              </Typography>
            </Box>
            <Chip
              label={`${points} / ${DBQ_MAX_POINTS} drafted`}
              sx={{
                alignSelf: 'flex-start',
                fontWeight: 800,
                bgcolor: points === DBQ_MAX_POINTS ? 'success.main' : 'secondary.main',
                color: points === DBQ_MAX_POINTS ? '#fff' : 'secondary.contrastText',
              }}
            />
          </Stack>
          <Stack spacing={1.25}>
            {signals.map((signal) => {
              const complete = signal.earned === signal.max;
              return (
                <Stack
                  key={signal.id}
                  direction="row"
                  spacing={1.5}
                  sx={{
                    alignItems: 'flex-start',
                    pl: 1.5,
                    borderLeft: '3px solid',
                    borderColor: complete ? 'success.main' : 'divider',
                  }}
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Row ${signal.row}`}
                    sx={{ mt: 0.25, fontWeight: 800 }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2">{signal.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {signal.detail}
                    </Typography>
                  </Box>
                  <Typography
                    variant="subtitle2"
                    color={complete ? 'success.main' : 'text.secondary'}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {signal.earned}/{signal.max}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
