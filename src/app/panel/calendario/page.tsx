import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleBlockedSlot } from "../actions";
import { CalendarSlotButton } from "@/components/CalendarSlotButton";
import { LinkButton } from "@/components/LinkButton";
import {
  WEEKDAY_SHORT,
  isoWeekday,
  startOfWeek,
  weekDates,
  shiftWeek,
  formatDayMonth,
  halfHourSlots,
  timeInRange,
} from "@/lib/dates";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

const GRID_START_HOUR = 7;
const GRID_END_HOUR = 21;

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
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

  const monday = startOfWeek(week);
  const dates = weekDates(monday);

  const [{ data: weekly }, { data: blocked }] = await Promise.all([
    supabase
      .from("weekly_availability")
      .select("day_of_week, start_time, end_time")
      .eq("professional_id", user.id),
    supabase
      .from("blocked_slots")
      .select("date, start_time")
      .eq("professional_id", user.id)
      .gte("date", dates[0])
      .lte("date", dates[6]),
  ]);

  const weeklyByDay = new Map((weekly ?? []).map((w) => [w.day_of_week, w]));
  const blockedSet = new Set((blocked ?? []).map((b) => `${b.date}_${b.start_time.slice(0, 5)}`));
  const slots = halfHourSlots(GRID_START_HOUR, GRID_END_HOUR);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Calendario
        </Typography>
        <Stack direction="row" spacing={1}>
          <LinkButton href={`/panel/calendario?week=${shiftWeek(monday, -1)}`} size="small" variant="outlined">
            ← Semana anterior
          </LinkButton>
          <LinkButton href={`/panel/calendario?week=${shiftWeek(monday, 1)}`} size="small" variant="outlined">
            Semana siguiente →
          </LinkButton>
        </Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {formatDayMonth(dates[0])} – {formatDayMonth(dates[6])}. Verde = disponible, gris = fuera
        de horario, rojo = marcado como ocupado. Pulsa un hueco para cambiarlo.
      </Typography>

      <Box sx={{ mt: 2, overflowX: "auto" }}>
        <Box
          component="table"
          sx={{
            width: "100%",
            minWidth: 640,
            borderCollapse: "collapse",
            fontSize: 12,
          }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{ width: 56 }} />
              {dates.map((date) => (
                <Box
                  component="th"
                  key={date}
                  sx={{ pb: 0.5, textAlign: "center", fontWeight: 600, color: "text.primary" }}
                >
                  {WEEKDAY_SHORT[isoWeekday(date)]}
                  <br />
                  {formatDayMonth(date)}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {slots.map((time) => (
              <Box component="tr" key={time}>
                <Box component="td" sx={{ pr: 1, textAlign: "right", verticalAlign: "top", color: "text.disabled" }}>
                  {time.endsWith(":00") ? time : ""}
                </Box>
                {dates.map((date) => {
                  const dow = isoWeekday(date);
                  const daySchedule = weeklyByDay.get(dow);
                  const working =
                    daySchedule && timeInRange(time, daySchedule.start_time, daySchedule.end_time);

                  if (!working) {
                    return (
                      <Box
                        component="td"
                        key={date}
                        sx={{ border: "1px solid", borderColor: "grey.100", bgcolor: "grey.50", p: 0 }}
                      >
                        <Box sx={{ height: 16, width: "100%" }} />
                      </Box>
                    );
                  }

                  const isBlocked = blockedSet.has(`${date}_${time}`);
                  return (
                    <Box
                      component="td"
                      key={date}
                      sx={{ border: "1px solid", borderColor: "grey.100", p: 0 }}
                    >
                      <form action={toggleBlockedSlot.bind(null, date, time, isBlocked)}>
                        <CalendarSlotButton isBlocked={isBlocked} time={time} />
                      </form>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
