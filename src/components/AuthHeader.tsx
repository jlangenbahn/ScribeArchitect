import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function AuthHeader() {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        color: '#fff',
        mb: 2,
        mx: 'auto',
        width: '100%',
        maxWidth: 448,
        alignItems: 'center',
      }}
    >
      <Box
        component="img"
        src="/scribe-architect.svg"
        alt=""
        sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: '#fff' }}
      />
      <Box>
        <Typography
          sx={{
            m: 0,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: 'secondary.main',
          }}
        >
          ScribeArchitect
        </Typography>
        <Typography variant="h6" sx={{ m: 0, color: '#fff' }}>
          Sign in to continue
        </Typography>
      </Box>
    </Stack>
  );
}
