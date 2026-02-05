import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/supabase/auth-context';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AccountsPage } from '../pages/AccountsPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { CreditCardsPage } from '../pages/CreditCardsPage';
import { CreditCardDetailsPage } from '../pages/CreditCardDetailsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { BillTrackingPage } from '../pages/BillTrackingPage';
import { Box, CircularProgress } from '@mui/material';

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

export function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
            <Route path="/auth/register" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />

            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/cards" element={<ProtectedRoute><CreditCardsPage /></ProtectedRoute>} />
            <Route path="/cards/:id" element={<ProtectedRoute><CreditCardDetailsPage /></ProtectedRoute>} />
            <Route path="/tracking" element={<ProtectedRoute><BillTrackingPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
