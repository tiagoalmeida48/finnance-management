import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '@/shared/components/ui';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { MainLayout } from '@/layouts/MainLayout';

const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TransactionsPage = lazy(() =>
  import('@/pages/transactions/TransactionsPage').then((m) => ({ default: m.TransactionsPage })),
);
const FinancesPage = lazy(() =>
  import('@/pages/finances/FinancesPage').then((m) => ({ default: m.FinancesPage })),
);
const CategoriesPage = lazy(() =>
  import('@/pages/categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const SalaryPage = lazy(() =>
  import('@/pages/salary/SalaryPage').then((m) => ({ default: m.SalaryPage })),
);
const CreditCardDetailsPage = lazy(() =>
  import('@/pages/cards/CreditCardDetailsPage').then((m) => ({ default: m.CreditCardDetailsPage })),
);
const TrackingPage = lazy(() =>
  import('@/pages/tracking/TrackingPage').then((m) => ({ default: m.TrackingPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const UsersPage = lazy(() =>
  import('@/pages/users/UsersPage').then((m) => ({ default: m.UsersPage })),
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
        <Route path="/finances" element={<Lazy><FinancesPage /></Lazy>} />
        <Route path="/accounts" element={<Navigate to="/finances" replace />} />
        <Route path="/cards" element={<Navigate to="/finances" replace />} />
        <Route path="/cards/:id" element={<Lazy><CreditCardDetailsPage /></Lazy>} />
        <Route path="/categories" element={<Lazy><CategoriesPage /></Lazy>} />
        <Route
          path="/salary"
          element={
            <AdminRoute>
              <Lazy><SalaryPage /></Lazy>
            </AdminRoute>
          }
        />
        <Route path="/tracking" element={<Lazy><TrackingPage /></Lazy>} />
        <Route path="/profile" element={<Lazy><ProfilePage /></Lazy>} />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Lazy><UsersPage /></Lazy>
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
