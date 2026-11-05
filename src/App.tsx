import { Authenticator } from '@aws-amplify/ui-react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import AppShell from './components/AppShell';
import AuthHeader from './components/AuthHeader';
import { theme } from './theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Authenticator
        loginMechanisms={['email']}
        components={{ Header: AuthHeader }}
      >
        {({ signOut, user }) => <AppShell user={user} signOut={signOut} />}
      </Authenticator>
    </ThemeProvider>
  );
}
