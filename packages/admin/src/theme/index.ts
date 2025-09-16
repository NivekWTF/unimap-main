import { createTheme, responsiveFontSizes } from '@mui/material';

let theme = createTheme({
  palette: {
    primary: {
      main: '#3468C0',
      200: '#0766AD10',
      400: '#0766AD',
      300: '#50C4ED',
      700: '#1B3C73',
      800: '#0766AD'
    },
    secondary: {
      main: '#B7E5B4',
    },
    success: {
      main: '#9BCF53',
    },
    info: {
      main: '#333A73',
    },
    warning: {
      main: '#6C22A6',
    },
    grey: {
      '500': '#C7C8CC',
    },
  },
  typography: {
    caption: {
      color: 'rgb(99, 115, 129)',
      fontSize: 14,
    },
    fontFamily: ['LTSuperior', 'sans-serif'].join(','),
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        size: 'large',
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          fontSize: 14,
          fontWeight: 500,
          borderRadius: '0.5em',
          textTransform: 'none',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 2,
      },
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: 45,
          },
        },
      },
      defaultProps: {
        size: 'small',
        fullWidth: true,
        InputProps: {
          style: {
            borderRadius: 4,
            fontWeight: 500,
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        fullWidth: true,
        size: 'medium',
        MenuProps: {
          sx: {
            zIndex: 1501,
          },
        },
      },
      styleOverrides: {
        root: {
          minHeight: 45,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#D32F2F',
        },
      },
    },
    MuiPagination: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontSize: 16,
          textTransform: 'capitalize',
          fontWeight: 'bold',
        },
      },
    },
    MuiDrawer: {
      defaultProps: {
        hideBackdrop: true,
        sx: { zIndex: 1500 },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          zIndex: 1501,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 15,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
