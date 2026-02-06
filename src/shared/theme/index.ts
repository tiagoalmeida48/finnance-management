import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#D4AF37', // Gold
            light: '#E5C158',
            dark: '#B38F24',
        },
        secondary: {
            main: '#FFFFFF',
        },
        background: {
            default: '#151515', // Dark gray (not ultra-dark)
            paper: '#1C1C1C', // Slightly lighter gray
        },
        text: {
            primary: '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.6)',
        },
        success: {
            main: '#4CAF50',
        },
        error: {
            main: '#EF5350',
        },
        divider: 'rgba(255, 255, 255, 0.08)',
    },
    shape: {
        borderRadius: 12, // Smooth rounded corners
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    transition: 'all 0.2s ease-in-out',
                },
                containedPrimary: {
                    color: '#000000',
                    boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25)',
                    '&:hover': {
                        boxShadow: '0 6px 20px rgba(212, 175, 55, 0.35)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1C1C1C',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        borderColor: 'rgba(212, 175, 55, 0.2)',
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1C1C1C',
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.12)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#D4AF37',
                        },
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
    },
});
