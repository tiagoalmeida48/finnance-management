import { createTheme } from '@mui/material/styles';

// FINNANCE Design System Colors
const colors = {
    // Backgrounds (hierarchy of depth)
    bgPrimary: '#0A0A0F',
    bgSecondary: '#111118',
    bgCard: '#14141E',
    bgCardHover: '#1A1A28',

    // Borders
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.1)',

    // Text
    textPrimary: '#F0F0F5',
    textSecondary: '#8B8B9E',
    textMuted: '#5A5A6E',

    // Accent (Gold)
    accent: '#C9A84C',
    accentGlow: 'rgba(201, 168, 76, 0.15)',

    // Status/Semantic
    green: '#10B981',
    greenBg: 'rgba(16, 185, 129, 0.1)',
    red: '#EF4444',
    redBg: 'rgba(239, 68, 68, 0.1)',
    purple: '#8B5CF6',
    purpleBg: 'rgba(139, 92, 246, 0.1)',
    blue: '#3B82F6',
    yellow: '#F5A623',
    yellowBg: 'rgba(245, 166, 35, 0.1)',
};

export { colors };

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: colors.accent,
            light: '#D4B85C',
            dark: '#A88A3D',
        },
        secondary: {
            main: colors.purple,
        },
        background: {
            default: colors.bgPrimary,
            paper: colors.bgCard,
        },
        text: {
            primary: colors.textPrimary,
            secondary: colors.textSecondary,
        },
        success: {
            main: colors.green,
        },
        error: {
            main: colors.red,
        },
        warning: {
            main: colors.yellow,
        },
        info: {
            main: colors.blue,
        },
        divider: colors.border,
    },
    shape: {
        borderRadius: 16,
    },
    typography: {
        fontFamily: '"DM Sans", sans-serif',
        h1: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: colors.textPrimary,
        },
        h2: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h3: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h4: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '18px',
            fontWeight: 700,
        },
        h5: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '16px',
            fontWeight: 600,
        },
        h6: {
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: '16px',
            fontWeight: 600,
        },
        subtitle1: {
            fontSize: '14px',
            fontWeight: 500,
            color: colors.textSecondary,
        },
        subtitle2: {
            fontSize: '13px',
            fontWeight: 500,
            color: colors.textMuted,
        },
        body1: {
            fontSize: '14px',
            fontWeight: 400,
        },
        body2: {
            fontSize: '13px',
            fontWeight: 400,
        },
        caption: {
            fontSize: '12px',
            fontWeight: 500,
            color: colors.textMuted,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: colors.bgPrimary,
                    // Atmospheric glow effect
                    backgroundImage: `radial-gradient(ellipse 400px 400px at top right, ${colors.accentGlow}, transparent)`,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 20px',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    color: colors.bgPrimary,
                    fontWeight: 600,
                    boxShadow: `0 4px 16px ${colors.accentGlow}`,
                    '&:hover': {
                        boxShadow: `0 6px 24px rgba(201, 168, 76, 0.3)`,
                    },
                },
                outlined: {
                    borderColor: colors.border,
                    color: colors.textSecondary,
                    '&:hover': {
                        borderColor: colors.borderHover,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: colors.bgCard,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 16,
                    boxShadow: 'none',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        borderColor: colors.borderHover,
                        backgroundColor: colors.bgCardHover,
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: colors.bgCard,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: 10,
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: colors.accent,
                            boxShadow: `0 0 0 3px ${colors.accentGlow}`,
                        },
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: colors.border,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: '12px',
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 20, 0.95)',
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                    padding: '12px 16px',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: colors.bgSecondary,
                    borderRight: `1px solid ${colors.border}`,
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottomColor: colors.border,
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                outlined: {
                    backgroundColor: colors.bgCard,
                    borderRadius: 8,
                },
            },
        },
    },
});

