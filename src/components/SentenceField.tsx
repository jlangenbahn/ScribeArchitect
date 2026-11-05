import TextField from '@mui/material/TextField';
import { SENTENCE_COLORS, type SentenceKind } from '../lib/mpe';

type SentenceFieldProps = {
  kind: SentenceKind;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
};

export default function SentenceField({
  kind,
  label,
  placeholder,
  value,
  onChange,
  helperText,
}: SentenceFieldProps) {
  const color = SENTENCE_COLORS[kind];

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      helperText={helperText}
      multiline
      minRows={2}
      fullWidth
      slotProps={{ inputLabel: { shrink: true } }}
      sx={{
        '& .MuiInputLabel-root': {
          color: color.main,
          fontWeight: 800,
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: color.main,
        },
        '& .MuiFormHelperText-root': {
          color: 'text.secondary',
        },
        '& .MuiOutlinedInput-root': {
          backgroundColor: color.bg,
          '& fieldset': {
            borderColor: color.main,
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: color.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: color.main,
          },
        },
      }}
    />
  );
}
