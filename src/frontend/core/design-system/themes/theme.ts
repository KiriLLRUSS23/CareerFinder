import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ruRU } from '@mui/x-date-pickers/locales';
import { deepmerge } from '@mui/utils';

// Base theme with accessibility focus
const baseTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc004e',
      light: '#e57373',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d32',
      light: '#66bb6a',
      dark: '#1b5e20',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0288d1',
      light: '#29b6f6',
      dark: '#01579b',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#bdbdbd',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 24px',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          color: '#212121',
        },
      },
    },
    MuiSvgIcon: {
      defaultProps: {
        fontSize: 'medium',
      },
    },
    MuiLink: {
      defaultProps: {
        underline: 'hover',
      },
      styleOverrides: {
        root: {
          color: '#1976d2',
          '&:hover': {
            color: '#0d47a1',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#212121',
          color: '#ffffff',
          fontSize: '0.875rem',
          padding: '8px 12px',
          borderRadius: '8px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },
});

// WCAG 2.2 AA Accessibility enhancements
const accessibilityTheme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '3px solid #ff9800',
            outlineOffset: '2px',
          },
        },
        contained: {
          '&:focus-visible': {
            outlineColor: '#ffffff',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '&:focus-within': {
            outline: '2px solid #1976d2',
            outlineOffset: '1px',
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '&:focus-within': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '1px',
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus': {
            backgroundColor: '#e3f2fd',
          },
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '-2px',
          },
        },
      },
    },
  },
  typography: {
    fontWeightBold: 700,
    button: {
      fontWeight: 600,
    },
  },
});

// Merge themes with accessibility as priority
export const theme = responsiveFontSizes(deepmerge(baseTheme, accessibilityTheme));

// High contrast theme variant
export const highContrastTheme = createTheme({
  ...theme,
  palette: {
    ...theme.palette,
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff0000',
      light: '#ff6666',
      dark: '#cc0000',
      contrastText: '#ffffff',
    },
    background: {
      default: '#000000',
      paper: '#111111',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      disabled: '#888888',
    },
    divider: '#444444',
  },
  components: {
    ...theme.components,
    MuiButton: {
      ...theme.components?.MuiButton,
      styleOverrides: {
        ...theme.components?.MuiButton?.styleOverrides,
        root: {
          ...theme.components?.MuiButton?.styleOverrides?.root,
          '&:focus-visible': {
            outline: '3px solid #ffffff',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiPaper: {
      ...theme.components?.MuiPaper,
      styleOverrides: {
        ...theme.components?.MuiPaper?.styleOverrides,
        root: {
          ...theme.components?.MuiPaper?.styleOverrides?.root,
          backgroundColor: '#111111',
          border: '1px solid #444444',
        },
      },
    },
    MuiCard: {
      ...theme.components?.MuiCard,
      styleOverrides: {
        ...theme.components?.MuiCard?.styleOverrides,
        root: {
          ...theme.components?.MuiCard?.styleOverrides?.root,
          backgroundColor: '#1a1a1a',
          border: '1px solid #555555',
        },
      },
    },
  },
});

// Large text theme variant
export const largeTextTheme = createTheme({
  ...theme,
  typography: {
    ...theme.typography,
    fontSize: 16,
    htmlFontSize: 16,
    h1: {
      ...theme.typography.h1,
      fontSize: '3rem',
    },
    h2: {
      ...theme.typography.h2,
      fontSize: '2.5rem',
    },
    h3: {
      ...theme.typography.h3,
      fontSize: '2.125rem',
    },
    h4: {
      ...theme.typography.h4,
      fontSize: '1.875rem',
    },
    h5: {
      ...theme.typography.h5,
      fontSize: '1.5rem',
    },
    h6: {
      ...theme.typography.h6,
      fontSize: '1.25rem',
    },
    body1: {
      ...theme.typography.body1,
      fontSize: '1.125rem',
      lineHeight: 1.7,
    },
    body2: {
      ...theme.typography.body2,
      fontSize: '1rem',
      lineHeight: 1.7,
    },
  },
  components: {
    ...theme.components,
    MuiButton: {
      ...theme.components?.MuiButton,
      defaultProps: {
        ...theme.components?.MuiButton?.defaultProps,
        size: 'large',
      },
      styleOverrides: {
        ...theme.components?.MuiButton?.styleOverrides,
        root: {
          ...theme.components?.MuiButton?.styleOverrides?.root,
          padding: '12px 32px',
          fontSize: '1.125rem',
        },
      },
    },
    MuiTextField: {
      ...theme.components?.MuiTextField,
      defaultProps: {
        ...theme.components?.MuiTextField?.defaultProps,
        margin: 'normal',
        fullWidth: true,
      },
    },
    MuiInputBase: {
      ...theme.components?.MuiInputBase,
      styleOverrides: {
        ...theme.components?.MuiInputBase?.styleOverrides,
        input: {
          fontSize: '1.125rem',
          padding: '16px 14px',
        },
      },
    },
  },
});

// Regional theme variants
export const regionalThemes = {
  tatarstan: createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        main: '#2e7d32', // Green - Tatarstan colors
        light: '#66bb6a',
        dark: '#1b5e20',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ff9800', // Orange - cultural significance
        light: '#ffb74d',
        dark: '#f57c00',
        contrastText: '#ffffff',
      },
    },
    components: {
      ...theme.components,
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#2e7d32',
          },
        },
      },
    },
  }),
  samara: createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        main: '#1565c0', // Blue - Samara river
        light: '#42a5f5',
        dark: '#0d47a1',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#d32f2f', // Red - industrial heritage
        light: '#ef5350',
        dark: '#b71c1c',
        contrastText: '#ffffff',
      },
    },
  }),
  bashkortostan: createTheme({
    ...theme,
    palette: {
      ...theme.palette,
      primary: {
        main: '#7b1fa2', // Purple - Bashkir cultural colors
        light: '#ba68c8',
        dark: '#4a148c',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#388e3c', // Green - Bashkir nature
        light: '#66bb6a',
        dark: '#1b5e20',
        contrastText: '#ffffff',
      },
    },
  }),
};
