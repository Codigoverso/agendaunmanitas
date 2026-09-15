import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { setWeeklyAvailability, toggleBlockedSlot } from "./actions";
import { WEEKDAY_LABELS, isoWeekday, upcomingDates } from "@/lib/dates";

const TIMEFRAMES = ["morning", "afternoon"] as const;
const TIMEFRAME_LABEL: Record<string, string> = { morning: "Mañana", afternoon: "Tarde" };
const DAYS_AHEAD = 14;

export default async function PanelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city")
    .eq("id", user.id)
    .single();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  let weeklySet = new Set<string>();
  let blockedSet = new Set<string>();
  const dates = upcomingDates(DAYS_AHEAD);

  if (professional) {
    const [{ data: weekly }, { data: blocked }] = await Promise.all([
      supabase.from("weekly_availability").select("day_of_week, timeframe").eq("professional_id", user.id),
      supabase
        .from("blocked_slots")
        .select("date, timeframe")
        .eq("professional_id", user.id)
        .gte("date", dates[0])
        .lte("date", dates[dates.length - 1]),
    ]);
    weeklySet = new Set((weekly ?? []).map((w) => `${w.day_of_week}_${w.timeframe}`));
    blockedSet = new Set((blocked ?? []).map((b) => `${b.date}_${b.timeframe}`));
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">
            Hola, {profile?.full_name || user.email}
          </h1>
          {profile?.city && <p className="mt-1 text-sm text-zinc-600">{profile.city}</p>}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cerrar sesión
          </button>
        </form>
      </div>

      {!professional ? (
        <Link
          href="/profesional"
          className="mt-8 inline-block rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Activar modo profesional
        </Link>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Solicitudes</h2>
            <p className="mt-2 text-sm text-zinc-500">Todavía no has recibido ninguna solicitud.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Tu horario semanal</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Marca los días y franjas en los que trabajas habitualmente. Estarán disponibles por
              defecto — luego puedes marcar como ocupada una fecha concreta en el calendario.
            </p>
            <form action={setWeeklyAvailability} className="mt-4 flex flex-col gap-2">
              {Object.entries(WEEKDAY_LABELS).map(([day, label]) => (
                <div key={day} className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                  <span className="text-sm text-zinc-800">{label}</span>
                  <div className="flex gap-4">
                    {TIMEFRAMES.map((tf) => (
                      <label key={tf} className="flex items-center gap-1.5 text-sm text-zinc-600">
                        <input
                          type="checkbox"
                          name={`d${day}_${tf}`}
                          defaultChecked={weeklySet.has(`${day}_${tf}`)}
                          className="rounded"
                        />
                        {TIMEFRAME_LABEL[tf]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="submit"
                className="mt-2 self-start rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
              >
                Guardar horario
              </button>
            </form>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">Calendario</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Próximos {DAYS_AHEAD} días. Todo lo que marcaste en tu horario semanal aparece
              disponible — pulsa para marcarlo como ocupado si ya no puedes atender ese día.
            </p>
            <ul className="mt-4 divide-y divide-zinc-200 border-t border-zinc-200">
              {dates.map((date) => {
                const dow = isoWeekday(date);
                const workingTimeframes = TIMEFRAMES.filter((tf) => weeklySet.has(`${dow}_${tf}`));
                return (
                  <li key={date} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-zinc-800">
                      {WEEKDAY_LABELS[dow]} {date}
                    </span>
                    <div className="flex gap-2">
                      {workingTimeframes.length === 0 ? (
                        <span className="text-xs text-zinc-400">No trabajas este día</span>
                      ) : (
                        workingTimeframes.map((tf) => {
                          const blocked = blockedSet.has(`${date}_${tf}`);
                          return (
                            <form key={tf} action={toggleBlockedSlot.bind(null, date, tf, blocked)}>
                              <button
                                type="submit"
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  blocked
                                    ? "bg-zinc-100 text-zinc-500"
                                    : "bg-teal-50 text-teal-700"
                                }`}
                              >
                                {TIMEFRAME_LABEL[tf]} · {blocked ? "Ocupado" : "Disponible"}
                              </button>
                            </form>
                          );
                        })
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
