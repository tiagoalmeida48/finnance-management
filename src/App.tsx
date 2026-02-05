import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/supabase/auth-context';
import { LandingPage } from './features/landing/pages/LandingPage';
import { LoginPage } from './features/auth/pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { Sidebar } from './components/layout/Sidebar';
import { Box, CircularProgress } from '@mui/material';
import { AccountsPage } from './features/accounts/pages/AccountsPage';
import { TransactionsPage } from './features/transactions/pages/TransactionsPage';
import { CategoriesPage } from './features/transactions/pages/CategoriesPage';
import { CreditCardsPage } from './features/cards/pages/CreditCardsPage';
import { CreditCardDetailsPage } from './features/cards/pages/CreditCardDetailsPage';
import { ProfilePage } from './features/auth/pages/ProfilePage';
import { BillTrackingPage } from './features/tracking/pages/BillTrackingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { user } = useAuth();

  return (
    <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
      {user && <Sidebar />}
      <Box component="main" sx={{ flexGrow: 1, p: 0 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/auth/register" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} /> // Reusing LoginPage for demo
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards"
            element={
              <ProtectedRoute>
                <CreditCardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cards/:id"
            element={
              <ProtectedRoute>
                <CreditCardDetailsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tracking"
            element={
              <ProtectedRoute>
                <BillTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
