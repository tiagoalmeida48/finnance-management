import { Box } from '@mui/material';
import { useAuth } from './lib/supabase/auth-context';
import { Sidebar } from './shared/components/layout/Sidebar';
import { AppRoutes } from './app-routes/AppRouter';

function App() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {user && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;
