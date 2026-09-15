import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toggleBlockedSlot } from "../actions";
import { CalendarSlotButton } from "@/components/CalendarSlotButton";
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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Calendario</h1>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/panel/calendario?week=${shiftWeek(monday, -1)}`}
            className="rounded-md border border-zinc-300 px-2 py-1 text-zinc-600 hover:bg-zinc-50"
          >
            ← Semana anterior
          </Link>
          <Link
            href={`/panel/calendario?week=${shiftWeek(monday, 1)}`}
            className="rounded-md border border-zinc-300 px-2 py-1 text-zinc-600 hover:bg-zinc-50"
          >
            Semana siguiente →
          </Link>
        </div>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        {formatDayMonth(dates[0])} – {formatDayMonth(dates[6])}. Verde = disponible, gris = fuera
        de horario, rojo = marcado como ocupado. Pulsa un hueco para cambiarlo.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-xs">
          <thead>
            <tr>
              <th className="w-14"></th>
              {dates.map((date) => (
                <th key={date} className="pb-1 text-center font-medium text-zinc-700">
                  {WEEKDAY_SHORT[isoWeekday(date)]}
                  <br />
                  {formatDayMonth(date)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((time) => (
              <tr key={time}>
                <td className="pr-1 text-right align-top text-zinc-400">
                  {time.endsWith(":00") ? time : ""}
                </td>
                {dates.map((date) => {
                  const dow = isoWeekday(date);
                  const daySchedule = weeklyByDay.get(dow);
                  const working =
                    daySchedule && timeInRange(time, daySchedule.start_time, daySchedule.end_time);

                  if (!working) {
                    return (
                      <td key={date} className="border border-zinc-100 bg-zinc-50 p-0">
                        <div className="h-4 w-full" />
                      </td>
                    );
                  }

                  const isBlocked = blockedSet.has(`${date}_${time}`);
                  return (
                    <td key={date} className="border border-zinc-100 p-0">
                      <form action={toggleBlockedSlot.bind(null, date, time, isBlocked)}>
                        <CalendarSlotButton isBlocked={isBlocked} time={time} />
                      </form>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
