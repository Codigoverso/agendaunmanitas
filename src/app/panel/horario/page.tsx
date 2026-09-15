import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setWeeklyAvailability } from "../actions";
import { WEEKDAY_LABELS } from "@/lib/dates";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";

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
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Tu horario semanal</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Marca los días que trabajas habitualmente y de qué hora a qué hora. Se usará como base
        del calendario — luego puedes marcar como ocupado cualquier hueco concreto.
      </p>

      <div className="mt-4">
        <Notice type="success">{message}</Notice>
      </div>

      <form action={setWeeklyAvailability} className="mt-6 flex flex-col gap-2">
        {Object.entries(WEEKDAY_LABELS).map(([day, label]) => {
          const existing = byDay.get(Number(day));
          return (
            <div
              key={day}
              className="flex flex-wrap items-center gap-3 rounded-md border border-zinc-200 px-3 py-2"
            >
              <label className="flex w-28 items-center gap-2 text-sm font-medium text-zinc-800">
                <input
                  type="checkbox"
                  name={`work_${day}`}
                  defaultChecked={!!existing}
                  className="rounded"
                />
                {label}
              </label>
              <label className="flex items-center gap-1.5 text-sm text-zinc-600">
                De
                <input
                  type="time"
                  name={`start_${day}`}
                  step={1800}
                  defaultValue={existing?.start_time?.slice(0, 5) || "09:00"}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                />
              </label>
              <label className="flex items-center gap-1.5 text-sm text-zinc-600">
                a
                <input
                  type="time"
                  name={`end_${day}`}
                  step={1800}
                  defaultValue={existing?.end_time?.slice(0, 5) || "19:00"}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm"
                />
              </label>
            </div>
          );
        })}
        <SubmitButton className="mt-2 self-start rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
          Guardar horario
        </SubmitButton>
      </form>
    </div>
  );
}
