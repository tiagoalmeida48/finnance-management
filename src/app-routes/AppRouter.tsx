import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/supabase/auth-context';
import { LoginPage } from '../pages/LoginPage';
import { Box, CircularProgress } from '@mui/material';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const AccountsPage = lazy(() => import('../pages/AccountsPage').then((module) => ({ default: module.AccountsPage })));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage').then((module) => ({ default: module.TransactionsPage })));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const CreditCardsPage = lazy(() => import('../pages/CreditCardsPage').then((module) => ({ default: module.CreditCardsPage })));
const CreditCardDetailsPage = lazy(() => import('../pages/CreditCardDetailsPage').then((module) => ({ default: module.CreditCardDetailsPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const BillTrackingPage = lazy(() => import('../pages/BillTrackingPage').then((module) => ({ default: module.BillTrackingPage })));
const SalarySimulatorPage = lazy(() => import('../pages/SalarySimulatorPage').then((module) => ({ default: module.SalarySimulatorPage })));
const UsersManagementPage = lazy(() => import('../pages/UsersManagementPage').then((module) => ({ default: module.UsersManagementPage })));


function RouteFallback() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
            <CircularProgress color="primary" />
        </Box>
    );
}

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

function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!user) return <Navigate to="/auth/login" replace />;
    if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;

    return <>{children}</>;
}

export function AppRoutes() {
    const { user } = useAuth();

    return (
        <Suspense fallback={<RouteFallback />}>
            <Routes>
                <Route path="/" element={<Navigate to={user ? '/dashboard' : '/auth/login'} replace />} />
                <Route path="/auth/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route path="/auth/register" element={<Navigate to="/auth/login" replace />} />


                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
                <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                <Route path="/cards" element={<ProtectedRoute><CreditCardsPage /></ProtectedRoute>} />
                <Route path="/cards/:id" element={<ProtectedRoute><CreditCardDetailsPage /></ProtectedRoute>} />
                <Route path="/tracking" element={<ProtectedRoute><BillTrackingPage /></ProtectedRoute>} />
                <Route path="/salary-simulator" element={<ProtectedRoute><SalarySimulatorPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/users" element={<AdminRoute><UsersManagementPage /></AdminRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
}
