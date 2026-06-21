import { lazy, Suspense } from 'react';
import { useAuth } from './lib/supabase/use-auth';
import { AppRoutes } from './routes/AppRouter';

const MainLayout = lazy(() =>
  import('./shared/layouts/MainLayout').then((module) => ({
    default: module.MainLayout,
  })),
);

const LazyToastProvider = lazy(() =>
  import('./shared/contexts/ToastContext').then((module) => ({
    default: module.ToastProvider,
  })),
);

function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <AppRoutes />;
  }

  return (
    <Suspense fallback={null}>
      <LazyToastProvider>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </LazyToastProvider>
    </Suspense>
  );
}

export default App;
