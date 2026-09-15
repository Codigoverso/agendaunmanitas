import { createClient } from "@/lib/supabase/server";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import { LinkButton } from "@/components/LinkButton";
import { LinkText } from "@/components/LinkText";

export async function SiteHeader() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single()
    : { data: null };

  const displayName = profile?.full_name || user?.email || "";

  return (
    <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "#fff" }}>
      <Container maxWidth="lg">
        <Stack direction="row" sx={{ py: 1.5, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <LinkText href="/" underline="none">
            <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
              AgendaUnManitas
            </Typography>
          </LinkText>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <LinkText href="/buscar" underline="none" sx={{ fontWeight: 500, display: { xs: "none", sm: "inline" } }}>
              Buscar profesional
            </LinkText>
            {user ? (
              <LinkText
                href="/panel/perfil"
                underline="none"
                sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}
              >
                <Avatar src={profile?.avatar_url ?? undefined} sx={{ width: 32, height: 32, fontSize: 15 }}>
                  {displayName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: "none", sm: "block" } }}>
                  {displayName}
                </Typography>
              </LinkText>
            ) : (
              <>
                <LinkButton href="/entrar" variant="text">
                  Entrar
                </LinkButton>
                <LinkButton href="/registro" variant="contained">
                  Crear cuenta
                </LinkButton>
              </>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
