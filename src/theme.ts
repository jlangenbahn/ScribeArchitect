import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#10233f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c9a227',
      contrastText: '#10233f',
    },
    background: {
      default: '#f6f3ec',
      paper: '#ffffff',
    },
    text: {
      primary: '#10233f',
      secondary: '#4b5870',
    },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
    h5: { fontWeight: 800, letterSpacing: '-0.03em' },
    h6: { fontWeight: 800, letterSpacing: '-0.02em' },
    subtitle2: { fontWeight: 800 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        'html, body, #root': {
          height: '100%',
          margin: 0,
        },
      },
    },
  },
});
