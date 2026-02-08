import { Box } from '@mui/material';
import { useAuth } from './lib/supabase/auth-context';
import { Sidebar } from './shared/components/layout/Sidebar';
import { AppRoutes } from './app-routes/AppRouter';

function App() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {user && <Sidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          position: 'relative',
          overflow: 'hidden',
          isolation: 'isolate',
          backgroundColor: '#090B12',
            backgroundImage: `
            radial-gradient(circle at 18% 12%, rgba(201, 168, 76, 0.12), transparent 38%),
            radial-gradient(circle at 78% 82%, rgba(59, 130, 246, 0.09), transparent 32%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '34px 34px',
            transform: 'perspective(1200px) rotateX(20deg) scale(1.25)',
            transformOrigin: 'center top',
            opacity: 0.52,
          },
        }}
      >
        <AppRoutes />
      </Box>
    </Box>
  );
}

export default App;
