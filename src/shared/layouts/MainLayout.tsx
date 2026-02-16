import { useState } from 'react';
import { Box, useMediaQuery, useTheme, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { colors } from '../theme';

interface MainLayoutProps {
    children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Mobile Header */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        bgcolor: 'background.default',
                        borderBottom: `1px solid ${colors.border}`,
                        zIndex: theme.zIndex.drawer + 1
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, color: colors.textPrimary }}
                        >
                            <Menu />
                        </IconButton>
                        <Typography variant="h6" noWrap component="div" sx={{ color: colors.textPrimary }}>
                            Finnance
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Sidebar */}
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={handleDrawerToggle}
            />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 0,
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: '#090B12',
                    // Global Background Styles moved from App.tsx
                    backgroundImage: `
                        radial-gradient(circle at 18% 12%, rgba(201, 168, 76, 0.12), transparent 38%),
                        radial-gradient(circle at 78% 82%, rgba(59, 130, 246, 0.09), transparent 32%),
                        linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
                    `,
                    backgroundSize: 'auto, auto, 34px 34px, 34px 34px',
                    backgroundPosition: '0 0, 0 0, 0 0, 0 0',
                    // Adjust padding for mobile header
                    pt: isMobile ? 10 : 0,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
