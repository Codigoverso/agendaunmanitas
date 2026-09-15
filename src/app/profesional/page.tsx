import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { activateProfessional, addAvailability, removeAvailability } from "./actions";
import { LocationFields } from "@/components/LocationFields";

const TIMEFRAME_LABEL: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
};

export default async function ProfessionalPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: trades } = await supabase.from("trades").select("id, label").order("id");

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("city, bio")
    .eq("id", user.id)
    .maybeSingle();

  const errorBanner = error && (
    <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
  );

  if (!professional) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900">Activar modo profesional</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Rellena tus datos para empezar a recibir solicitudes.
        </p>

        {errorBanner}

        <form action={activateProfessional} className="mt-6 flex flex-col gap-4">
          <LocationFields />
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-zinc-700">
              Descripción breve
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-zinc-700">Oficios</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {trades?.map((trade) => (
                <label key={trade.id} className="flex items-center gap-2 text-sm text-zinc-700">
                  <input type="checkbox" name="trade_ids" value={trade.id} className="rounded" />
                  {trade.label}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="mt-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Activar
          </button>
        </form>
      </div>
    );
  }

  const { data: slots } = await supabase
    .from("availability_slots")
    .select("id, date, timeframe")
    .eq("professional_id", user.id)
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date")
    .order("timeframe");

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">Tu disponibilidad</h1>
      <p className="mt-1 text-sm text-zinc-600">
        {professional.city} · marca las franjas en las que puedes atender un trabajo.
      </p>

      {errorBanner}

      <form action={addAvailability} className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-zinc-700">
            Fecha
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-zinc-700">
            Franja
          </label>
          <select
            id="timeframe"
            name="timeframe"
            className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          >
            <option value="morning">Mañana</option>
            <option value="afternoon">Tarde</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Añadir hueco
        </button>
      </form>

      <ul className="mt-8 divide-y divide-zinc-200 border-t border-zinc-200">
        {slots && slots.length > 0 ? (
          slots.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between py-3 text-sm">
              <span className="text-zinc-800">
                {slot.date} · {TIMEFRAME_LABEL[slot.timeframe]}
              </span>
              <form action={removeAvailability.bind(null, slot.id)}>
                <button type="submit" className="text-red-600 hover:underline">
                  Eliminar
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="py-3 text-sm text-zinc-500">Todavía no has marcado ningún hueco.</li>
        )}
      </ul>
    </div>
  );
}
