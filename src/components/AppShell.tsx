import CreateIcon from '@mui/icons-material/Create';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import Alert from '@mui/material/Alert';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { AuthUser } from 'aws-amplify/auth';
import { useEffect, useMemo, useState } from 'react';
import { client, type EssayRecord } from '../lib/client';
import { downloadMpeDocx } from '../lib/exportDocx';
import {
  createEmptyMpe,
  displayTitle,
  parseMpeContent,
  type EssayTemplateType,
  type MpeContent,
} from '../lib/mpe';
import MultiParagraphEssay from './MultiParagraphEssay';
import TemplatePicker from './TemplatePicker';

const DRAWER_WIDTH = 300;
const RECENT_LIMIT = 5;

type AppShellProps = {
  user?: AuthUser;
  signOut?: () => void;
};

type ToastState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

function formatUpdatedAt(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AppShell({ user, signOut }: AppShellProps) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [essays, setEssays] = useState<EssayRecord[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [view, setView] = useState<'pick' | 'editor'>('pick');
  const [essayId, setEssayId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<MpeContent>(createEmptyMpe);
  const [loadingEssay, setLoadingEssay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const loginId = user?.signInDetails?.loginId;

  useEffect(() => {
    const sub = client.models.Essay.observeQuery().subscribe({
      next: ({ items }) => {
        const sorted = [...items].sort((left, right) =>
          String(right.updatedAt ?? '').localeCompare(String(left.updatedAt ?? '')),
        );
        setEssays(sorted);
      },
      error: () => {
        setToast({
          open: true,
          message: 'Could not load recent essays.',
          severity: 'error',
        });
      },
    });
    return () => sub.unsubscribe();
  }, []);

  const visibleEssays = useMemo(
    () => (showAllRecent ? essays : essays.slice(0, RECENT_LIMIT)),
    [essays, showAllRecent],
  );

  function showToast(message: string, severity: ToastState['severity']) {
    setToast({ open: true, message, severity });
  }

  function startNewEssay() {
    setView('pick');
    setEssayId(null);
    setTitle('');
    setContent(createEmptyMpe());
    setMobileOpen(false);
  }

  function handleTemplateSelect(template: EssayTemplateType) {
    if (template !== 'MULTI_PARAGRAPH') return;
    setEssayId(null);
    setTitle('');
    setContent(createEmptyMpe());
    setView('editor');
  }

  async function openEssay(id: string) {
    setLoadingEssay(true);
    setView('editor');
    setMobileOpen(false);
    try {
      const { data, errors } = await client.models.Essay.get({ id });
      if (errors?.length || !data) {
        showToast('Could not open that essay.', 'error');
        return;
      }
      setEssayId(data.id);
      setTitle(data.title ?? '');
      setContent(parseMpeContent(data.content));
    } catch {
      showToast('Could not open that essay.', 'error');
    } finally {
      setLoadingEssay(false);
    }
  }

  async function saveEssay() {
    setSaving(true);
    const payload = {
      title: displayTitle(title),
      templateType: 'MULTI_PARAGRAPH' as const,
      content,
    };
    try {
      if (essayId) {
        const { errors } = await client.models.Essay.update({
          id: essayId,
          ...payload,
        });
        if (errors?.length) {
          showToast('Save failed. Please try again.', 'error');
          return;
        }
      } else {
        const { data, errors } = await client.models.Essay.create(payload);
        if (errors?.length || !data?.id) {
          showToast('Save failed. Please try again.', 'error');
          return;
        }
        setEssayId(data.id);
      }
      setTitle(payload.title);
      showToast('Essay saved.', 'success');
    } catch {
      showToast('Save failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function downloadEssay() {
    try {
      await downloadMpeDocx(title, content);
    } catch {
      showToast('Could not download the Word file.', 'error');
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <List sx={{ px: 1, pt: 1 }}>
        <ListItemButton
          selected={view === 'pick' || (view === 'editor' && !essayId)}
          onClick={startNewEssay}
        >
          <ListItemIcon>
            <CreateIcon
              color={view === 'pick' || (view === 'editor' && !essayId) ? 'primary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText
            primary="Write Essay"
            slotProps={{ primary: { sx: { fontWeight: 800 } } }}
          />
        </ListItemButton>
      </List>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div" sx={{ bgcolor: 'transparent', fontWeight: 800 }}>
            Recent Essays
          </ListSubheader>
        }
        sx={{ px: 1, flex: 1, overflow: 'auto' }}
      >
        {visibleEssays.length === 0 ? (
          <ListItemText
            sx={{ px: 2, py: 1 }}
            secondary="No saved essays yet."
          />
        ) : (
          visibleEssays.map((essay) => (
            <ListItemButton
              key={essay.id}
              selected={view === 'editor' && essayId === essay.id}
              onClick={() => openEssay(essay.id)}
            >
              <ListItemText
                primary={displayTitle(essay.title)}
                secondary={formatUpdatedAt(essay.updatedAt)}
                slotProps={{
                  primary: { noWrap: true, sx: { fontWeight: 700 } },
                  secondary: { noWrap: true },
                }}
              />
            </ListItemButton>
          ))
        )}
        {essays.length > RECENT_LIMIT ? (
          <ListItemButton onClick={() => setShowAllRecent((current) => !current)}>
            <ListItemIcon>
              {showAllRecent ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemIcon>
            <ListItemText
              primary={showAllRecent ? 'Show fewer' : `Show all (${essays.length})`}
            />
          </ListItemButton>
        ) : null}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: '3px solid',
          borderColor: 'secondary.main',
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          {!mdUp ? (
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          <Box
            component="img"
            src="/scribe-architect.svg"
            alt=""
            sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#fff' }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#fff' }}>
            ScribeArchitect
          </Typography>
          {loginId ? (
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, opacity: 0.85 }}>
              {loginId}
            </Typography>
          ) : null}
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={signOut}>
            Sign out
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {mdUp ? (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 960, mx: 'auto' }}>
          {view === 'pick' ? (
            <TemplatePicker onSelect={handleTemplateSelect} />
          ) : loadingEssay ? (
            <Stack sx={{ py: 8, alignItems: 'center' }}>
              <CircularProgress />
            </Stack>
          ) : (
            <MultiParagraphEssay
              title={title}
              content={content}
              saving={saving}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onSave={saveEssay}
              onDownload={downloadEssay}
            />
          )}
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast((current) => ({ ...current, open: false }))}
          severity={toast.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
