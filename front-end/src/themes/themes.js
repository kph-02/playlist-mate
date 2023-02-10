import { createTheme } from "@mui/material";

export const appTheme = createTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#408c51',
      light: '#69a576',
      dark: '#1c662d',
      contrastText: '#f5e3cf',
    },
    secondary: {
      main: '#f50057',
    },
    text: {
      primary: '#000000',
    },
  }, 
});