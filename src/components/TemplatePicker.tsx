import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { TEMPLATE_OPTIONS, type EssayTemplateType } from '../lib/mpe';

type TemplatePickerProps = {
  onSelect: (template: EssayTemplateType) => void;
};

export default function TemplatePicker({ onSelect }: TemplatePickerProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        borderBottom: '3px solid',
        borderBottomColor: 'secondary.main',
      }}
    >
      <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
        <Stack spacing={0.75}>
          <Typography variant="h5">Write an essay</Typography>
          <Typography color="text.secondary">
            Choose a template to open a color-coded draft you can save and
            download.
          </Typography>
        </Stack>
        <FormControl fullWidth>
          <InputLabel id="essay-template-label" shrink>
            Essay template
          </InputLabel>
          <Select
            labelId="essay-template-label"
            label="Essay template"
            displayEmpty
            notched
            value=""
            onChange={(event) => {
              const next = String(event.target.value);
              const match = TEMPLATE_OPTIONS.find((option) => option.value === next);
              if (match) onSelect(match.value);
            }}
          >
            <MenuItem value="">
              <em>Select a template</em>
            </MenuItem>
            {TEMPLATE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}
