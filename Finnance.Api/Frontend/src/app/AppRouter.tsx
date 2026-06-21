import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spinner } from '@/shared/components/ui';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { MainLayout } from '@/layouts/MainLayout';

const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TransactionsPage = lazy(() =>
  import('@/pages/transactions/TransactionsPage').then((m) => ({ default: m.TransactionsPage })),
);
const AccountsPage = lazy(() =>
  import('@/pages/accounts/AccountsPage').then((m) => ({ default: m.AccountsPage })),
);
const CardsPage = lazy(() =>
  import('@/pages/cards/CardsPage').then((m) => ({ default: m.CardsPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const SalaryPage = lazy(() =>
  import('@/pages/salary/SalaryPage').then((m) => ({ default: m.SalaryPage })),
);

const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner />
  </div>
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Lazy><DashboardPage /></Lazy>} />
        <Route path="/transactions" element={<Lazy><TransactionsPage /></Lazy>} />
        <Route path="/accounts" element={<Lazy><AccountsPage /></Lazy>} />
        <Route path="/cards" element={<Lazy><CardsPage /></Lazy>} />
        <Route path="/categories" element={<Lazy><CategoriesPage /></Lazy>} />
        <Route path="/salary" element={<Lazy><SalaryPage /></Lazy>} />
      </Route>
    </Routes>
  );
}
