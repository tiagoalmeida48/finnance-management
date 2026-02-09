import { lazy, Suspense } from 'react';
import { Box } from '@mui/material';
import { useAuth } from './lib/supabase/auth-context';
import { AppRoutes } from './app-routes/AppRouter';

const Sidebar = lazy(() => import('./shared/components/layout/Sidebar').then((module) => ({ default: module.Sidebar })));

function App() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {user && (
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#090B12',
          backgroundImage: `
            radial-gradient(circle at 18% 12%, rgba(201, 168, 76, 0.12), transparent 38%),
            radial-gradient(circle at 78% 82%, rgba(59, 130, 246, 0.09), transparent 32%),
            linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: 'auto, auto, 34px 34px, 34px 34px',
          backgroundPosition: '0 0, 0 0, 0 0, 0 0',
        }}
      >
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;
