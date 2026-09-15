import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar } from "../actions";
import { firstOf, coverageLabel } from "@/lib/professional";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <Stack direction="row" spacing={1}>
      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
        {label}:
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {value}
      </Typography>
    </Stack>
  );
}

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
    .select("bio, coverage_region, coverage_province, coverage_city")
    .eq("id", user.id)
    .maybeSingle();

  const { data: trades } = professional
    ? await supabase
        .from("professional_trades")
        .select("trades(label)")
        .eq("professional_id", user.id)
    : { data: null };

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
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <InfoRow label="Nombre" value={profile?.full_name} />
            <InfoRow
              label="Ubicación"
              value={[profile?.city, profile?.province, profile?.region].filter(Boolean).join(", ")}
            />
          </Stack>
        </CardContent>
      </Card>

      {professional && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Como profesional
            </Typography>
            <Stack spacing={0.5} sx={{ mt: 1 }}>
              <InfoRow
                label="Oficios"
                value={
                  trades
                    ?.map((t) => firstOf(t.trades)?.label)
                    .filter(Boolean)
                    .join(", ") || "—"
                }
              />
              <InfoRow label="Cobertura" value={coverageLabel(professional)} />
              {professional.bio && <InfoRow label="Descripción" value={professional.bio} />}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
