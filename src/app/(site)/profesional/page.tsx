import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { activateProfessional } from "./actions";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export default async function ActivateProfessionalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: trades } = await supabase.from("trades").select("id, label").order("id");

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (professional) redirect("/panel/perfil");

  return (
    <Box
      sx={{
        display: "flex",
        flexGrow: 1,
        justifyContent: "center",
        px: 2,
        py: 8,
        bgcolor: "background.default",
      }}
    >
      <Paper elevation={0} variant="outlined" sx={{ width: "100%", maxWidth: 480, p: 4, alignSelf: "flex-start" }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Activar modo profesional
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Rellena tus datos para empezar a recibir solicitudes.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Notice type="error">{error}</Notice>
        </Box>

        <Stack component="form" action={activateProfessional} spacing={3} sx={{ mt: 1 }}>
          <TextField name="bio" label="Descripción breve" multiline rows={3} fullWidth />

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Oficios
            </Typography>
            <FormGroup row>
              {trades?.map((trade) => (
                <FormControlLabel
                  key={trade.id}
                  sx={{ width: "48%" }}
                  control={<Checkbox name="trade_ids" value={trade.id} />}
                  label={trade.label}
                />
              ))}
            </FormGroup>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Radio de actuación
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
              Sin mapa todavía: elige hasta qué nivel quieres acotar dónde trabajas. Puedes
              dejarlo en &quot;Toda España&quot; si te desplazas a cualquier sitio.
            </Typography>
            <Stack spacing={2.5}>
              <OptionalLocationFields />
            </Stack>
          </Box>

          <SubmitButton pendingText="Activando...">Activar</SubmitButton>
        </Stack>
      </Paper>
    </Box>
  );
}
