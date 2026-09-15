import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setWeeklyAvailability } from "../actions";
import { WEEKDAY_LABELS } from "@/lib/dates";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";

export default async function HorarioPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
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

  const { data: weekly } = await supabase
    .from("weekly_availability")
    .select("day_of_week, start_time, end_time")
    .eq("professional_id", user.id);

  const byDay = new Map((weekly ?? []).map((w) => [w.day_of_week, w]));

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600 }}>
        Tu horario semanal
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Marca los días que trabajas habitualmente y de qué hora a qué hora. Se usará como base
        del calendario — luego puedes marcar como ocupado cualquier hueco concreto.
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Notice type="success">{message}</Notice>
      </Box>

      <Stack component="form" action={setWeeklyAvailability} spacing={1.5} sx={{ mt: 2 }}>
        {Object.entries(WEEKDAY_LABELS).map(([day, label]) => {
          const existing = byDay.get(Number(day));
          return (
            <Paper
              key={day}
              variant="outlined"
              sx={{
                px: 2,
                py: 1,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
              }}
            >
              <FormControlLabel
                sx={{ width: 130 }}
                control={<Checkbox name={`work_${day}`} defaultChecked={!!existing} />}
                label={label}
              />
              <TextField
                label="De"
                type="time"
                name={`start_${day}`}
                defaultValue={existing?.start_time?.slice(0, 5) || "09:00"}
                size="small"
                slotProps={{ htmlInput: { step: 1800 }, inputLabel: { shrink: true } }}
              />
              <TextField
                label="a"
                type="time"
                name={`end_${day}`}
                defaultValue={existing?.end_time?.slice(0, 5) || "19:00"}
                size="small"
                slotProps={{ htmlInput: { step: 1800 }, inputLabel: { shrink: true } }}
              />
            </Paper>
          );
        })}
        <SubmitButton sx={{ alignSelf: "flex-start", mt: 1 }}>Guardar horario</SubmitButton>
      </Stack>
    </Box>
  );
}
