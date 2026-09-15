import { createClient } from "@/lib/supabase/server";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";
import { isoWeekday, halfHourSlotsInRange } from "@/lib/dates";
import { firstOf, coverageLabel } from "@/lib/professional";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { Notice } from "@/components/Notice";

type ProfessionalResult = {
  id: string;
  full_name: string | null;
  claimed: boolean;
  coverage_region: string | null;
  coverage_province: string | null;
  coverage_city: string | null;
  bio: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
  professional_trades: { trade_id: number; trades: { label: string } | { label: string }[] | null }[];
  weekly_availability: { day_of_week: number; start_time: string; end_time: string }[];
  blocked_slots: { date: string; start_time: string }[];
};

// Huecos libres ese día = medias horas de su horario habitual para ese día
// de la semana, menos las que haya marcado como ocupadas justo esa fecha.
function freeSlotsOn(pro: ProfessionalResult, date: string) {
  const dow = isoWeekday(date);
  const schedule = pro.weekly_availability.find((w) => w.day_of_week === dow);
  if (!schedule) return { schedule: null, slots: [] as string[] };
  const blocked = new Set(pro.blocked_slots.map((b) => b.start_time.slice(0, 5)));
  const slots = halfHourSlotsInRange(schedule.start_time, schedule.end_time).filter(
    (t) => !blocked.has(t)
  );
  return { schedule, slots };
}

// Un profesional encaja si, en cada nivel que el cliente ha acotado, su
// cobertura es "sin límite" ahí (null) o coincide exactamente.
function matchesLocation(
  pro: ProfessionalResult,
  region?: string,
  province?: string,
  city?: string
) {
  if (region && pro.coverage_region && pro.coverage_region !== region) return false;
  if (province && pro.coverage_province && pro.coverage_province !== province) return false;
  if (city && pro.coverage_city && pro.coverage_city !== city) return false;
  return true;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string; region?: string; province?: string; city?: string; date?: string }>;
}) {
  const { trade, region, province, city, date } = await searchParams;
  const supabase = await createClient();

  const { data: trades } = await supabase.from("trades").select("id, slug, label").order("id");

  const dow = date ? isoWeekday(date) : null;
  const selectTrades = trade
    ? "professional_trades!inner(trade_id, trades(label))"
    : "professional_trades(trade_id, trades(label))";
  const selectWeekly = dow
    ? "weekly_availability!inner(day_of_week, start_time, end_time)"
    : "weekly_availability(day_of_week, start_time, end_time)";
  const selectBlocked = date ? ", blocked_slots(date, start_time)" : "";

  let query = supabase
    .from("professional_profiles")
    .select(
      `id, full_name, claimed, coverage_region, coverage_province, coverage_city, bio, contact_email, contact_phone, contact_address, profiles(full_name), ${selectTrades}, ${selectWeekly}${selectBlocked}`
    )
    .eq("is_active", true);

  if (trade) query = query.eq("professional_trades.trade_id", Number(trade));
  if (dow) query = query.eq("weekly_availability.day_of_week", dow);
  if (date) query = query.eq("blocked_slots.date", date);

  const { data: rawResults, error } = await query.returns<ProfessionalResult[]>();

  let results = rawResults?.filter((pro) => matchesLocation(pro, region, province, city));
  if (date) {
    results = results?.filter((pro) => freeSlotsOn(pro, date).slots.length > 0);
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Buscar un profesional
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        Filtra por oficio, ubicación y, si quieres, una fecha concreta.
      </Typography>

      <Stack component="form" spacing={2.5} sx={{ mt: 3 }}>
        <TextField name="trade" label="Oficio" select defaultValue={trade ?? ""} fullWidth>
          <MenuItem value="">Todos</MenuItem>
          {trades?.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.label}
            </MenuItem>
          ))}
        </TextField>
        <OptionalLocationFields
          regionAnyLabel="Cualquier comunidad"
          provinceAnyLabel="Cualquier provincia"
          cityAnyLabel="Cualquier población"
          defaultRegion={region ?? ""}
          defaultProvince={province ?? ""}
          defaultCity={city ?? ""}
        />
        <TextField
          name="date"
          type="date"
          label="Fecha"
          defaultValue={date ?? ""}
          slotProps={{ inputLabel: { shrink: true } }}
          fullWidth
        />
        <Button type="submit" variant="contained" sx={{ alignSelf: "flex-start" }}>
          Buscar
        </Button>
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Notice type="error">{error?.message}</Notice>
      </Box>

      <Stack spacing={2} sx={{ mt: 4 }}>
        {results && results.length > 0 ? (
          results.map((pro) => {
            const name = pro.full_name || firstOf(pro.profiles)?.full_name || "Profesional";
            const { schedule, slots } = date ? freeSlotsOn(pro, date) : { schedule: null, slots: [] };
            return (
              <Card key={pro.id} variant="outlined">
                <CardContent>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {name}
                      </Typography>
                      {!pro.claimed && <Chip size="small" label="No registrado" />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {coverageLabel(pro)}
                    </Typography>
                  </Stack>
                  {!pro.claimed && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      Este negocio todavía no se ha dado de alta en AgendaUnManitas — no se puede
                      contactar con él a través de la plataforma.
                    </Typography>
                  )}
                  {pro.bio && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {pro.bio}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                    {pro.professional_trades
                      .map((pt) => firstOf(pt.trades)?.label)
                      .filter(Boolean)
                      .join(" · ")}
                  </Typography>
                  {date && schedule && slots.length > 0 && (
                    <Typography variant="body2" color="secondary.dark" sx={{ mt: 1 }}>
                      Libre el {date}, horario habitual {schedule.start_time.slice(0, 5)}–
                      {schedule.end_time.slice(0, 5)} ({slots.length} huecos de media hora)
                    </Typography>
                  )}
                  {pro.claimed && (pro.contact_email || pro.contact_phone || pro.contact_address) && (
                    <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                      {pro.contact_email && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <EmailOutlinedIcon fontSize="small" color="action" />
                          <Typography variant="body2">{pro.contact_email}</Typography>
                        </Stack>
                      )}
                      {pro.contact_phone && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <PhoneOutlinedIcon fontSize="small" color="action" />
                          <Typography variant="body2">{pro.contact_phone}</Typography>
                        </Stack>
                      )}
                      {pro.contact_address && (
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <PlaceOutlinedIcon fontSize="small" color="action" />
                          <Typography variant="body2">{pro.contact_address}</Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No hay profesionales que encajen con esa búsqueda todavía.
          </Typography>
        )}
      </Stack>
    </Container>
  );
}
