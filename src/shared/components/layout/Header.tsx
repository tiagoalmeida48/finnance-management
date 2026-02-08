import { AppBar, Avatar, Box, IconButton, Toolbar, Typography, Menu, MenuItem } from '@mui/material';
import { useAuth } from '@/lib/supabase/auth-context';
import { useSiteBranding } from '@/shared/hooks/useSiteBranding';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Header() {
    const { user, profile, signOut } = useAuth();
    const { siteTitle } = useSiteBranding();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await signOut();
        handleClose();
        navigate('/');
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#D4AF37', fontWeight: 700 }}>
                    {siteTitle}
                </Typography>

                {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                            {profile?.full_name || user.email}
                        </Typography>
                        <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                            <Avatar src={profile?.avatar_url || undefined} sx={{ bgcolor: '#D4AF37', color: '#000', width: 32, height: 32 }}>
                                {!profile?.avatar_url && (profile?.full_name?.[0] || user.email?.[0]?.toUpperCase())}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                            PaperProps={{
                                sx: { mt: 1.5, minWidth: 150, bgcolor: '#121212', border: '1px solid #1F1F1F' }
                            }}
                        >
                            <MenuItem onClick={handleClose}>
                                <UserIcon size={16} style={{ marginRight: 8 }} /> Perfil
                            </MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <LogOut size={16} style={{ marginRight: 8 }} /> Sair
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
