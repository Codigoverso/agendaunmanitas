import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { LinkButton } from "@/components/LinkButton";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        textAlign: "center",
        bgcolor: "background.default",
      }}
    >
      <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", mb: 3 }}>
        <CalendarMonthIcon sx={{ fontSize: 36 }} />
      </Avatar>
      <Typography variant="h3" color="text.primary" sx={{ fontWeight: 700 }}>
        AgendaUnManitas
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2, maxWidth: 480, fontWeight: 400 }}>
        Encuentra un profesional según su disponibilidad real — no una lista de contactos a
        ciegas.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
        <LinkButton href="/buscar" variant="contained" size="large">
          Buscar profesional
        </LinkButton>
        <LinkButton href="/registro" variant="outlined" size="large">
          Crear cuenta
        </LinkButton>
        <LinkButton href="/entrar" variant="outlined" size="large">
          Entrar
        </LinkButton>
      </Stack>
    </Box>
  );
}
