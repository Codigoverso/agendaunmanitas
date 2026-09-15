import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createUnclaimedListing } from "../actions";
import { ADMIN_EMAIL } from "@/lib/admin";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/panel/perfil");

  const { data: trades } = await supabase.from("trades").select("id, label").order("id");

  const { data: unclaimed } = await supabase
    .from("professional_profiles")
    .select(
      "id, full_name, coverage_city, coverage_region, contact_email, contact_phone, professional_trades(trades(label))"
    )
    .eq("claimed", false)
    .order("id");

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Directorio de negocios (sin reclamar)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Estos negocios se muestran en la búsqueda marcados como &quot;no registrado&quot; —
        sirven solo para no arrancar con la base de datos vacía. Puedes añadir un teléfono o
        email de referencia (por ejemplo, encontrado en Google) aunque el negocio no tenga
        cuenta: se mostrará igualmente, dejando claro que no está verificado ni gestionado desde
        la plataforma.
      </Typography>

      <Box sx={{ mt: 2 }}>
        <Notice type="success">{message}</Notice>
        <Notice type="error">{error}</Notice>
      </Box>

      <Card variant="outlined" sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            Añadir negocio
          </Typography>
          <Stack component="form" action={createUnclaimedListing} spacing={2.5} sx={{ mt: 1 }}>
            <TextField name="full_name" label="Nombre del negocio" required fullWidth />
            <TextField name="bio" label="Descripción breve" multiline rows={3} fullWidth />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Oficios
              </Typography>
              <FormGroup row>
                {trades?.map((trade) => (
                  <FormControlLabel
                    key={trade.id}
                    sx={{ width: { xs: "100%", sm: "48%" } }}
                    control={<Checkbox name="trade_ids" value={trade.id} />}
                    label={trade.label}
                  />
                ))}
              </FormGroup>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Ubicación / radio de actuación
              </Typography>
              <Stack spacing={2.5}>
                <OptionalLocationFields />
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Contacto de referencia (opcional, sin verificar)
              </Typography>
              <Stack spacing={2.5}>
                <TextField name="contact_email" type="email" label="Email" fullWidth />
                <TextField name="contact_phone" type="tel" label="Teléfono" fullWidth />
                <TextField name="contact_address" label="Dirección" fullWidth />
              </Stack>
            </Box>
            <SubmitButton sx={{ alignSelf: "flex-start" }}>Añadir</SubmitButton>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 4 }}>
        Ya añadidos ({unclaimed?.length ?? 0})
      </Typography>
      <Stack spacing={1.5} sx={{ mt: 2 }}>
        {unclaimed?.map((biz) => {
          const tradeLabels = biz.professional_trades
            .map((pt) => {
              const t = Array.isArray(pt.trades) ? pt.trades[0] : pt.trades;
              return t?.label;
            })
            .filter(Boolean)
            .join(", ");
          return (
            <Card key={biz.id} variant="outlined">
              <CardContent
                sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {biz.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tradeLabels || "Sin oficios"} · {biz.coverage_city || biz.coverage_region || "Toda España"}
                  </Typography>
                  {(biz.contact_email || biz.contact_phone) && (
                    <Typography variant="caption" color="text.secondary">
                      {[biz.contact_email, biz.contact_phone].filter(Boolean).join(" · ")}
                    </Typography>
                  )}
                </Box>
                <Chip size="small" label="No registrado" color="default" />
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
