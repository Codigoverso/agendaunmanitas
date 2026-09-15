import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import { createClient } from "@/lib/supabase/server";
import { firstOf, coverageLabel } from "@/lib/professional";
import { tradeIcon } from "@/lib/trade-icons";
import { LinkButton } from "@/components/LinkButton";
import { LinkText } from "@/components/LinkText";

type FeaturedProfessional = {
  id: string;
  full_name: string | null;
  claimed: boolean;
  coverage_region: string | null;
  coverage_province: string | null;
  coverage_city: string | null;
  professional_trades: { trades: { label: string } | { label: string }[] | null }[];
};

export default async function Home() {
  const supabase = await createClient();

  const { data: trades } = await supabase.from("trades").select("id, slug, label").order("id");

  const { data: featured } = await supabase
    .from("professional_profiles")
    .select("id, full_name, claimed, coverage_region, coverage_province, coverage_city, professional_trades(trades(label))")
    .eq("is_active", true)
    .order("id", { ascending: false })
    .limit(8)
    .returns<FeaturedProfessional[]>();

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* Hero con buscador, al estilo de la portada de Wallapop */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #028090 0%, #00A896 100%)",
          color: "#fff",
          py: { xs: 5, sm: 7 },
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: "1.9rem", sm: "2.8rem" } }}>
            Encuentra un profesional según su disponibilidad real
          </Typography>
          <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 400, opacity: 0.92, maxWidth: 560 }}>
            Nada de listas de contactos a ciegas: elige oficio y ve quién tiene hueco de verdad.
          </Typography>

          <Card sx={{ mt: 4, p: { xs: 1.5, sm: 2 }, maxWidth: 720 }}>
            <Stack
              component="form"
              action="/buscar"
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
            >
              <TextField name="trade" select defaultValue="" label="¿Qué necesitas?" fullWidth>
                <MenuItem value="">Cualquier oficio</MenuItem>
                {trades?.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                sx={{ flexShrink: 0, px: 4 }}
              >
                Buscar
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>

      {/* Categorías, al estilo de los iconos de categoría de Wallapop */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Oficios más buscados
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2.5,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { height: 6 },
          }}
        >
          {trades?.map((t) => {
            const Icon = tradeIcon(t.slug);
            return (
              <LinkText
                key={t.id}
                href={`/buscar?trade=${t.id}`}
                underline="none"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  flexShrink: 0,
                  width: 88,
                  textAlign: "center",
                }}
              >
                <Avatar sx={{ width: 56, height: 56, bgcolor: "secondary.main", color: "#fff" }}>
                  <Icon />
                </Avatar>
                <Typography variant="caption" color="text.primary" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                  {t.label}
                </Typography>
              </LinkText>
            );
          })}
        </Box>
      </Container>

      {/* Profesionales, al estilo de la rejilla de anuncios de Wallapop */}
      {featured && featured.length > 0 && (
        <Container maxWidth="lg" sx={{ pb: 5 }}>
          <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Profesionales disponibles
            </Typography>
            <LinkText href="/buscar" underline="none" sx={{ fontWeight: 500 }}>
              Ver todos
            </LinkText>
          </Stack>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                sm: "repeat(3, 1fr)",
                md: "repeat(4, 1fr)",
              },
            }}
          >
            {featured.map((pro) => {
              const name = pro.full_name || "Profesional";
              const trade = firstOf(pro.professional_trades[0]?.trades)?.label;
              return (
                <Card key={pro.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>{name.charAt(0).toUpperCase()}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap component="div">
                          {coverageLabel(pro)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
                      {trade && <Chip size="small" label={trade} />}
                      {!pro.claimed && <Chip size="small" label="No registrado" variant="outlined" />}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Container>
      )}

      {/* Llamada a la acción para profesionales */}
      <Container maxWidth="lg" sx={{ pb: 7 }}>
        <Card
          sx={{
            background: "linear-gradient(135deg, #00A896 0%, #028090 100%)",
            color: "#fff",
          }}
        >
          <CardContent sx={{ py: { xs: 3, sm: 4 } }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{ alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ¿Tienes un oficio?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5 }}>
                  Date de alta gratis y recibe solicitudes según tu disponibilidad real.
                </Typography>
              </Box>
              <LinkButton
                href="/registro"
                variant="contained"
                size="large"
                sx={{ bgcolor: "#fff", color: "primary.main", "&:hover": { bgcolor: "#f0f0f0" }, flexShrink: 0 }}
              >
                Crear cuenta profesional
              </LinkButton>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
