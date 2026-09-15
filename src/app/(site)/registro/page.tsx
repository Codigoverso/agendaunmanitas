import { signUp } from "@/app/auth/actions";
import { LocationFields } from "@/components/LocationFields";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import { LinkText } from "@/components/LinkText";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
      <Paper elevation={0} variant="outlined" sx={{ width: "100%", maxWidth: 420, p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Crear cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Como cliente o como profesional — puedes activar el modo profesional más adelante.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Notice type="error">{error}</Notice>
        </Box>

        <Stack component="form" action={signUp} spacing={2.5} sx={{ mt: 1 }}>
          <TextField name="full_name" label="Nombre" required fullWidth />
          <LocationFields />
          <TextField name="email" type="email" label="Email" required fullWidth />
          <TextField
            name="password"
            type="password"
            label="Contraseña"
            required
            fullWidth
            slotProps={{ htmlInput: { minLength: 6 } }}
          />
          <SubmitButton>Crear cuenta</SubmitButton>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          ¿Ya tienes cuenta?{" "}
          <LinkText href="/entrar" sx={{ fontWeight: 500 }}>
            Entra
          </LinkText>
        </Typography>
      </Paper>
    </Box>
  );
}
