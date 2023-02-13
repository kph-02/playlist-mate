import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  transitions: {
    easing: {
      easeInCirc: 'cubic-bezier(0.600, 0.040, 0.980, 0.335)',
      eastOutCirc: 'cubic-bezier(0.075, 0.820, 0.165, 1.000)',
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    button: {
      fontSize: 15,
      fontWeight: 600,
      textTransform: 'none',
      
    },
    h2: {
      fontSize: 60,
      fontWeight: 600,
    },
    h3: {
      fontSize: 40,
      fontWeight: 600,
    },
    h4: {
      fontSize:20,
    },
    body2: {
      fontStyle: 'italic',
    },
  },

  palette: {
    mode: 'dark',
    primary: {
      main: '#4287C8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ffffff',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ffffff',
    },
    info: {
      main: '#1db954',
      contrastText: '#ffffff',
    },
  }, 

});