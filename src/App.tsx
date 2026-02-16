import { lazy, Suspense } from 'react';
import { useAuth } from './lib/supabase/auth-context';
import { AppRoutes } from './app-routes/AppRouter';

const MainLayout = lazy(() => import('./shared/layouts/MainLayout').then((module) => ({ default: module.MainLayout })));

function App() {
  const { user } = useAuth();
  // MainLayout is only used when user is authenticated, otherwise direct route rendering
  // Actually, MainLayout expects children.
  // The original App had conditional Sidebar rendering.
  // If user is not authenticated, we probably want a different layout or just current behavior.
  // Sidebar is only shown if user is present. MainLayout includes Sidebar.

  if (!user) {
    return <AppRoutes />;
  }

  return (
    <Suspense fallback={null}>
      <MainLayout>
        <AppRoutes />
      </MainLayout>
    </Suspense>
  );
}

export default App;
