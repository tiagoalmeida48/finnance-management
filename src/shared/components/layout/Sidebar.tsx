import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, IconButton, Tooltip, Stack, Button } from '@mui/material';
import {
    LayoutDashboard, Wallet, Receipt, CreditCard, Tag,
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
                transition: 'width 0.3s ease-in-out',
                [`& .MuiDrawer-paper`]: {
                    width: open ? drawerWidth : collapsedWidth,
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                    bgcolor: '#1C1C1C',
                    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'width 0.3s ease-in-out',
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
                    minHeight: 80,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                    {open && (
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            FINNANCE
                        </Typography>
                    )}
                    <IconButton
                        onClick={() => setOpen(!open)}
                        size="small"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'rgba(255, 255, 255, 0.04)' } }}
                    >
                        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </IconButton>
                </Box>

                <List sx={{ px: 1.5, py: 2 }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                                <Tooltip title={!open ? item.label : ""} placement="right">
                                    <ListItemButton
                                        onClick={() => navigate(item.path)}
                                        sx={{
                                            borderRadius: 2,
                                            px: open ? 2 : 1.5,
                                            py: 1.25,
                                            justifyContent: open ? 'initial' : 'center',
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                            bgcolor: isActive ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                                            borderLeft: isActive ? '3px solid' : '3px solid transparent',
                                            borderColor: isActive ? 'primary.main' : 'transparent',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                                color: isActive ? 'primary.main' : 'text.primary',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            color: 'inherit',
                                            minWidth: open ? 40 : 0,
                                            justifyContent: 'center',
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        {open && (
                                            <ListItemText
                                                primary={item.label}
                                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }}
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
            <Box sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <Stack spacing={2} alignItems={open ? 'stretch' : 'center'}>
                    <Box
                        onClick={() => navigate('/profile')}
                        sx={{
                            p: open ? 1.5 : 0.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: open ? 'flex-start' : 'center',
                            gap: open ? 2 : 0,
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' }
                        }}
                    >
                        <Tooltip title={!open ? (profile?.full_name || 'Perfil') : ""} placement="right">
                            <Avatar
                                src={profile?.avatar_url || undefined}
                                sx={{
                                    width: 38,
                                    height: 38,
                                    bgcolor: 'primary.main',
                                    color: '#000',
                                    fontSize: '0.9rem',
                                    fontWeight: 700
                                }}
                            >
                                {!profile?.avatar_url && (profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase())}
                            </Avatar>
                        </Tooltip>
                        {open && (
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
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
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderColor: 'rgba(239, 83, 80, 0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(239, 83, 80, 0.08)',
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
                                sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 83, 80, 0.08)' } }}
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

