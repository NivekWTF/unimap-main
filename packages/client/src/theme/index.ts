import { createTheme, responsiveFontSizes } from '@mui/material';

let theme = createTheme({
  typography: {
    fontFamily: '"Avenir",Helvetica,sans-serif',
  },
  components: {
    MuiTextField: {
      defaultProps: {
        InputProps: {
          sx: {
            borderRadius: 12,
            height: 50,
            background: 'common.white'
          },
        },
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          height: 50,
          backgroundColor: 'common.white',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'common.white'
          }
        }
      }
    },
    MuiInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          height: 50,
          backgroundColor: 'common.white'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          backgroundColor: 'common.white'
        }
      }
    }
  },
});

theme = responsiveFontSizes(theme);

export default theme;
