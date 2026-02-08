import { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Tooltip, IconButton } from '@mui/material';
import {
    LayoutDashboard, Wallet, Receipt, CreditCard, Tag,
    LogOut, CalendarCheck, ChevronsLeft, ChevronsRight, Calculator, Users
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/supabase/auth-context';
import { colors } from '@/shared/theme';
import { useSiteBranding } from '@/shared/hooks/useSiteBranding';

const collapsedWidth = 72;
const expandedWidth = 220;
const sectionPaddingX = 1;
const sectionPaddingY = 1.5;
const itemHeight = 44;
const itemGap = 1;

const baseMenuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Contas', icon: Wallet, path: '/accounts' },
    { label: 'Categorias', icon: Tag, path: '/categories' },
    { label: 'Transações', icon: Receipt, path: '/transactions' },
    { label: 'Cartões', icon: CreditCard, path: '/cards' },
    { label: 'Tracking', icon: CalendarCheck, path: '/tracking' },
    { label: 'Holerite', icon: Calculator, path: '/salary-simulator' },
];

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profile, signOut } = useAuth();
    const { siteTitle, logoImage } = useSiteBranding();
    const [isExpanded, setIsExpanded] = useState(true);

    const open = isExpanded;
    const menuItems = profile?.is_admin
        ? [...baseMenuItems, { label: 'Usuários', icon: Users, path: '/users' }]
        : baseMenuItems;

    const handleLogout = async () => {
        await signOut();
        navigate('/auth/login');
    };

    return (
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Tooltip title={open ? 'Retrair menu' : 'Expandir menu'} placement="right">
                <IconButton
                    size="small"
                    onClick={() => setIsExpanded((prev) => !prev)}
                    sx={{
                        position: 'fixed',
                        top: 36,
                        left: open ? expandedWidth - 16 : collapsedWidth - 16,
                        width: 32,
                        height: 32,
                        transform: 'translateY(-50%)',
                        color: colors.textMuted,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '50%',
                        bgcolor: colors.bgCard,
                        boxShadow: '0 8px 18px rgba(0,0,0,0.35)',
                        zIndex: 1300,
                        transition: 'left 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            color: colors.textPrimary,
                            bgcolor: 'rgba(255,255,255,0.08)'
                        }
                    }}
                >
                    {open ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
                </IconButton>
            </Tooltip>

            <Drawer
                variant="permanent"
                sx={{
                    width: open ? expandedWidth : collapsedWidth,
                    flexShrink: 0,
                    transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    [`& .MuiDrawer-paper`]: {
                        width: open ? expandedWidth : collapsedWidth,
                        overflowX: 'hidden',
                        overflowY: 'auto',
                        boxSizing: 'border-box',
                        bgcolor: colors.bgSecondary,
                        borderRight: `1px solid ${colors.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    },
                }}
            >
                <Box>
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            minHeight: 72,
                            borderBottom: `1px solid ${colors.border}`,
                            gap: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden',
                            }}
                        >
                            {logoImage ? (
                                <Box
                                    component="img"
                                    src={logoImage}
                                    alt="Logo do site"
                                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <Typography
                                    sx={{
                                        color: colors.bgPrimary,
                                        fontWeight: 700,
                                        fontSize: '16px',
                                        fontFamily: '"Plus Jakarta Sans", sans-serif',
                                    }}
                                >
                                    {siteTitle[0]?.toUpperCase() || 'F'}
                                </Typography>
                            )}
                        </Box>

                        <Typography
                            sx={{
                                color: colors.textPrimary,
                                fontWeight: 700,
                                fontSize: '15px',
                                fontFamily: '"Plus Jakarta Sans", sans-serif',
                                letterSpacing: '-0.02em',
                                opacity: open ? 1 : 0,
                                width: open ? 'auto' : 0,
                                transform: open ? 'translateX(0)' : 'translateX(-8px)',
                                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                            }}
                        >
                            {siteTitle}
                        </Typography>
                    </Box>

                    <List
                        sx={{
                            px: sectionPaddingX,
                            py: sectionPaddingY,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: itemGap
                        }}
                    >
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <ListItem key={item.label} disablePadding>
                                    <Tooltip title={!open ? item.label : ''} placement="right">
                                        <ListItemButton
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                width: '100%',
                                                height: itemHeight,
                                                minHeight: itemHeight,
                                                borderRadius: '12px',
                                                px: 1.5,
                                                py: 0,
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                                display: 'flex',
                                                position: 'relative',
                                                color: isActive ? colors.accent : colors.textMuted,
                                                bgcolor: isActive ? colors.accentGlow : 'transparent',
                                                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&::before': isActive
                                                    ? {
                                                        content: '""',
                                                        position: 'absolute',
                                                        left: 0,
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        width: '3px',
                                                        height: '20px',
                                                        borderRadius: '0 4px 4px 0',
                                                        bgcolor: colors.accent,
                                                    }
                                                    : {},
                                                '&:hover': {
                                                    bgcolor: isActive ? colors.accentGlow : 'rgba(255, 255, 255, 0.04)',
                                                    color: isActive ? colors.accent : colors.textSecondary,
                                                },
                                            }}
                                        >
                                            <ListItemIcon
                                                sx={{
                                                    color: 'inherit',
                                                    minWidth: 36,
                                                    lineHeight: 0,
                                                    justifyContent: 'center',
                                                    '& svg': {
                                                        width: 20,
                                                        height: 20,
                                                        display: 'block'
                                                    }
                                                }}
                                            >
                                                <Icon size={20} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={item.label}
                                                sx={{
                                                    opacity: open ? 1 : 0,
                                                    transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                                    '& .MuiTypography-root': {
                                                        fontSize: '13.5px',
                                                        fontWeight: isActive ? 600 : 500,
                                                        whiteSpace: 'nowrap',
                                                    }
                                                }}
                                            />
                                        </ListItemButton>
                                    </Tooltip>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                <Box sx={{ px: sectionPaddingX, py: sectionPaddingY, borderTop: `1px solid ${colors.border}` }}>
                    <Tooltip title={!open ? (profile?.full_name || 'Perfil') : ''} placement="right">
                        <Box
                            onClick={() => navigate('/profile')}
                            sx={{
                                width: '100%',
                                height: itemHeight,
                                px: 1,
                                py: 0,
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                gap: 1.5,
                                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.04)' }
                            }}
                        >
                            <Avatar
                                src={profile?.avatar_url || undefined}
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                    color: '#FFF',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                }}
                            >
                                {!profile?.avatar_url && (profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase())}
                            </Avatar>
                            <Box
                                sx={{
                                    overflow: 'hidden',
                                    opacity: open ? 1 : 0,
                                    transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        color: colors.textPrimary,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {profile?.full_name || 'Usuário'}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '11px',
                                        color: colors.textMuted,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {user?.email}
                                </Typography>
                            </Box>
                        </Box>
                    </Tooltip>

                    <ListItem disablePadding sx={{ mt: itemGap }}>
                        <Tooltip title={!open ? 'Sair' : ''} placement="right">
                            <ListItemButton
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: '10px',
                                    width: '100%',
                                    height: itemHeight,
                                    px: 1.5,
                                    py: 0,
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    display: 'flex',
                                    color: colors.red,
                                    '&:hover': { bgcolor: colors.redBg }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: 'inherit',
                                        minWidth: 36,
                                        lineHeight: 0,
                                        justifyContent: 'center',
                                        '& svg': {
                                            width: 20,
                                            height: 20,
                                            display: 'block'
                                        }
                                    }}
                                >
                                    <LogOut size={18} />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Sair"
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                                        '& .MuiTypography-root': {
                                            fontSize: '13px',
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }
                                    }}
                                />
                            </ListItemButton>
                        </Tooltip>
                    </ListItem>
                </Box>
            </Drawer>
        </Box>
    );
}
