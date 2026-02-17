import { lazy, Suspense } from 'react';
import { useAuth } from './lib/supabase/auth-context';
import { AppRoutes } from './app-routes/AppRouter';

const MainLayout = lazy(() => import('./shared/layouts/MainLayout').then((module) => ({ default: module.MainLayout })));

function App() {
  const { user } = useAuth();

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
