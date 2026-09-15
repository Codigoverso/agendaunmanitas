import { createTheme } from "@mui/material/styles";

// Paleta de AgendaUnManitas (la misma usada en el documento de referencia).
export const theme = createTheme({
  palette: {
    primary: { main: "#028090" },
    secondary: { main: "#00A896" },
    background: { default: "#f6f8f8" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-roboto), Roboto, Arial, sans-serif",
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: "none", borderRadius: 999, paddingLeft: 20, paddingRight: 20 },
        sizeLarge: { paddingTop: 10, paddingBottom: 10, fontSize: "1rem" },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: {
          border: "none",
          boxShadow: "0 1px 2px rgba(16,24,24,0.06), 0 1px 10px rgba(16,24,24,0.05)",
        },
        rounded: { borderRadius: 16 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 1px 2px rgba(16,24,24,0.06), 0 1px 10px rgba(16,24,24,0.05)",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});
