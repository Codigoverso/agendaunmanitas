import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar, updateProfile, updateProfessionalInfo, updateTrades } from "../actions";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import { LocationFields } from "@/components/LocationFields";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city, province, region")
    .eq("id", user.id)
    .single();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select(
      "bio, coverage_region, coverage_province, coverage_city, contact_email, contact_phone, contact_address, is_active"
    )
    .eq("id", user.id)
    .maybeSingle();

  const { data: allTrades, error: tradesError } = professional
    ? await supabase.from("trades").select("id, label").order("id")
    : { data: null, error: null };

  const { data: myTrades } = professional
    ? await supabase.from("professional_trades").select("trade_id").eq("professional_id", user.id)
    : { data: null };

  const selectedTradeIds = new Set((myTrades ?? []).map((t) => t.trade_id));

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Tu perfil
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Notice type="success">{message}</Notice>
        <Notice type="error">{error}</Notice>
      </Box>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Foto de perfil
          </Typography>
          <Stack
            component="form"
            action={uploadAvatar}
            direction="row"
            spacing={2}
            sx={{ mt: 1, alignItems: "center", flexWrap: "wrap" }}
          >
            <input type="file" name="avatar" accept="image/*" required />
            <SubmitButton pendingText="Subiendo...">Subir</SubmitButton>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Datos personales
          </Typography>
          <Stack component="form" action={updateProfile} spacing={2.5} sx={{ mt: 1 }}>
            <TextField name="full_name" label="Nombre" defaultValue={profile?.full_name} required fullWidth />
            <LocationFields
              defaultRegion={profile?.region ?? ""}
              defaultProvince={profile?.province ?? ""}
              defaultCity={profile?.city ?? ""}
            />
            <SubmitButton sx={{ alignSelf: "flex-start" }}>Guardar datos personales</SubmitButton>
          </Stack>
        </CardContent>
      </Card>

      {professional && (
        <>
          {!professional.is_active && (
            <Box sx={{ mt: 3 }}>
              <Notice type="error">
                Tu perfil está en revisión y no aparece en las búsquedas mientras tanto.
              </Notice>
            </Box>
          )}

          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Como profesional
              </Typography>
              <Stack component="form" action={updateProfessionalInfo} spacing={2.5} sx={{ mt: 1 }}>
                <TextField
                  name="bio"
                  label="Descripción breve"
                  defaultValue={professional.bio ?? ""}
                  multiline
                  rows={3}
                  fullWidth
                />
                <Typography variant="caption" color="text.secondary">
                  Radio de actuación — deja un nivel en blanco para no acotar a partir de ahí.
                </Typography>
                <OptionalLocationFields
                  defaultRegion={professional.coverage_region ?? ""}
                  defaultProvince={professional.coverage_province ?? ""}
                  defaultCity={professional.coverage_city ?? ""}
                />
                <Typography variant="caption" color="text.secondary">
                  Vías de contacto (opcionales) — solo se mostrarán si las rellenas.
                </Typography>
                <TextField
                  name="contact_email"
                  type="email"
                  label="Email de contacto"
                  defaultValue={professional.contact_email ?? ""}
                  fullWidth
                />
                <TextField
                  name="contact_phone"
                  type="tel"
                  label="Teléfono de contacto"
                  defaultValue={professional.contact_phone ?? ""}
                  fullWidth
                />
                <TextField
                  name="contact_address"
                  label="Dirección"
                  defaultValue={professional.contact_address ?? ""}
                  fullWidth
                />
                <SubmitButton sx={{ alignSelf: "flex-start" }}>Guardar</SubmitButton>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Tus oficios
              </Typography>
              {tradesError && (
                <Notice type="error">{`No se pudo cargar la lista de oficios: ${tradesError.message}`}</Notice>
              )}
              {!tradesError && allTrades?.length === 0 && (
                <Notice type="error">
                  No hay ningún oficio dado de alta todavía (la tabla &quot;trades&quot; está
                  vacía) — ejecuta la migración que crea los oficios en Supabase.
                </Notice>
              )}
              <Box component="form" action={updateTrades} sx={{ mt: 1 }}>
                <FormGroup row>
                  {allTrades?.map((trade) => (
                    <FormControlLabel
                      key={trade.id}
                      sx={{ width: { xs: "100%", sm: "48%" } }}
                      control={
                        <Checkbox
                          name="trade_ids"
                          value={trade.id}
                          defaultChecked={selectedTradeIds.has(trade.id)}
                        />
                      }
                      label={trade.label}
                    />
                  ))}
                </FormGroup>
                <SubmitButton sx={{ mt: 1 }}>Guardar oficios</SubmitButton>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
