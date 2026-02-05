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
            default: '#222222ff', // Slightly lighter than #0A0A0A
            paper: '#1e1e1eff', // Slightly lighter than #121212
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B0B0B0',
        },
        success: {
            main: '#2E7D32',
        },
        error: {
            main: '#D32F2F',
        },
    },
    shape: {
        borderRadius: 2, // Sharp corners for "Swiss Moral"
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
                    borderRadius: 2,
                    padding: '10px 24px',
                },
                containedPrimary: {
                    color: '#000000',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#121212',
                    borderBottom: '1px solid #2A2A2A',
                    boxShadow: 'none',
                },
            },
        },
    },
});
