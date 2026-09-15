import { createTheme } from "@mui/material/styles";

// Paleta de AgendaUnManitas (la misma usada en el documento de referencia).
export const theme = createTheme({
  palette: {
    primary: { main: "#028090" },
    secondary: { main: "#00A896" },
    background: { default: "#fafafa" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "var(--font-roboto), Roboto, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: "none" } },
    },
  },
});
