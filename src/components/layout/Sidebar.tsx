import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, IconButton, Tooltip, Stack, Button } from '@mui/material';
import {
    LayoutDashboard, Wallet, Receipt, CreditCard, Tag, BarChart3,
    LogOut, ChevronLeft, ChevronRight, CalendarCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/supabase/auth-context';

const drawerWidth = 260;
const collapsedWidth = 80;

const menuItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Contas', icon: <Wallet size={20} />, path: '/accounts' },
    { label: 'Categorias', icon: <Tag size={20} />, path: '/categories' },
    { label: 'Transações', icon: <Receipt size={20} />, path: '/transactions' },
    { label: 'Cartões', icon: <CreditCard size={20} />, path: '/cards' },
    { label: 'Tracking', icon: <CalendarCheck size={20} />, path: '/tracking' },
];

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile, signOut } = useAuth();
    const [open, setOpen] = useState(true);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : collapsedWidth,
                flexShrink: 0,
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                [`& .MuiDrawer-paper`]: {
                    width: open ? drawerWidth : collapsedWidth,
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    bgcolor: '#080808', // Darker background
                    borderRight: '1px solid #1F1F1F',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            }}
        >
            <Box>
                {/* Logo & Toggle Section */}
                <Box sx={{
                    p: open ? 3 : 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'space-between' : 'center',
                    minHeight: 80
                }}>
                    {open && (
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '-1px' }}>
                            FINNANCE
                        </Typography>
                    )}
                    <IconButton
                        onClick={() => setOpen(!open)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </IconButton>
                </Box>

                <List sx={{ px: 2 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={!open ? item.label : ""} placement="right">
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 1,
                                            px: open ? 2 : 1.5,
                                            justifyContent: open ? 'initial' : 'center',
                                            color: isActive ? '#D4AF37' : 'text.secondary',
                                            bgcolor: isActive ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: 'primary.main'
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            color: 'inherit',
                                            minWidth: open ? 40 : 0,
                                            justifyContent: 'center',
                                            transition: 'inherit'
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {open && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500 }}
                                            />
                                        )}
                                    </ListItemButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* User Profile & Logout Section */}
            <Box sx={{ p: 2, borderTop: '1px solid #1F1F1F', bgcolor: 'rgba(255,255,255,0.01)' }}>
                <Stack spacing={2} alignItems={open ? 'stretch' : 'center'}>
                    <Box
                        onClick={() => navigate('/profile')}
                        sx={{
                            p: open ? 1.5 : 0.5,
                            borderRadius: 1,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: open ? 'flex-start' : 'center',
                            gap: open ? 2 : 0,
                            transition: 'hover 0.2s',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.03)' }
                        }}
                    >
                        <Tooltip title={!open ? (profile?.full_name || 'Perfil') : ""} placement="right">
                            <Avatar
                                src={profile?.avatar_url || undefined}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main',
                                    color: 'background.default',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                }}
                            >
                                {!profile?.avatar_url && (profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase())}
                            </Avatar>
                        </Tooltip>
                        {open && (
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" noWrap sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {profile?.full_name || 'Usuário'}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                                    {user?.email}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {open ? (
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<LogOut size={18} />}
                            onClick={handleLogout}
                            sx={{
                                py: 1,
                                borderRadius: 1.5,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderColor: 'rgba(211, 47, 47, 0.2)',
                                bgcolor: 'rgba(211, 47, 47, 0.02)',
                                '&:hover': {
                                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                                    borderColor: 'error.main',
                                }
                            }}
                        >
                            Sair
                        </Button>
                    ) : (
                        <Tooltip title="Sair" placement="right">
                            <IconButton
                                size="small"
                                onClick={handleLogout}
                                sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' } }}
                            >
                                <LogOut size={20} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Box>
        </Drawer>
    );
}
