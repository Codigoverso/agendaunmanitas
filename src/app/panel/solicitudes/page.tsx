import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default async function SolicitudesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!professional) redirect("/panel/perfil");

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Solicitudes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Todavía no has recibido ninguna solicitud.
      </Typography>
    </Box>
  );
}
