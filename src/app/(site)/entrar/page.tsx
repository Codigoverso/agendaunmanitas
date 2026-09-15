import { signIn } from "@/app/auth/actions";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import { LinkText } from "@/components/LinkText";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 8,
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={0} variant="outlined" sx={{ width: "100%", maxWidth: 400, p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Entrar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Accede a tu cuenta de AgendaUnManitas.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Notice type="success">{message}</Notice>
          <Notice type="error">{error}</Notice>
        </Box>

        <Stack component="form" action={signIn} spacing={2.5} sx={{ mt: 1 }}>
          <TextField name="email" type="email" label="Email" required fullWidth />
          <TextField name="password" type="password" label="Contraseña" required fullWidth slotProps={{ htmlInput: { minLength: 6 } }} />
          <SubmitButton>Entrar</SubmitButton>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          ¿No tienes cuenta?{" "}
          <LinkText href="/registro" sx={{ fontWeight: 500 }}>
            Regístrate
          </LinkText>
        </Typography>
      </Paper>
    </Box>
  );
}
