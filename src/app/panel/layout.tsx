import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { PanelNav } from "@/components/PanelNav";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name || user.email || "?";

  return (
    <Box
      sx={{
        mx: "auto",
        display: "flex",
        flexGrow: 1,
        width: "100%",
        maxWidth: 1100,
        flexDirection: { xs: "column", md: "row" },
        gap: 4,
        px: 2,
        py: 5,
        bgcolor: "background.default",
      }}
    >
      <Box component="aside" sx={{ width: { md: 224 }, flexShrink: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Avatar src={profile?.avatar_url ?? undefined} sx={{ width: 80, height: 80, fontSize: 28 }}>
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mt: 1.5 }}>
            {displayName}
          </Typography>
        </Box>

        <PanelNav isProfessional={!!professional} />

        <Box component="form" action={signOut} sx={{ mt: 3 }}>
          <Button type="submit" variant="outlined" color="inherit" fullWidth>
            Cerrar sesión
          </Button>
        </Box>
      </Box>
      <Box component="main" sx={{ minWidth: 0, flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
}
