import { createClient } from "@/lib/supabase/server";

const TIMEFRAME_LABEL: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
};

type ProfessionalResult = {
  id: string;
  city: string;
  bio: string | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
  professional_trades: { trade_id: number; trades: { label: string } | { label: string }[] | null }[];
  availability_slots: { date: string; timeframe: string }[];
};

function firstOf<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ trade?: string; city?: string; date?: string }>;
}) {
  const { trade, city, date } = await searchParams;
  const supabase = await createClient();

  const { data: trades } = await supabase.from("trades").select("id, slug, label").order("id");

  const selectTrades = trade
    ? "professional_trades!inner(trade_id, trades(label))"
    : "professional_trades(trade_id, trades(label))";
  const selectSlots = date
    ? "availability_slots!inner(date, timeframe)"
    : "availability_slots(date, timeframe)";

  let query = supabase
    .from("professional_profiles")
    .select(`id, city, bio, profiles(full_name), ${selectTrades}, ${selectSlots}`)
    .eq("is_active", true);

  if (city) query = query.ilike("city", `%${city}%`);
  if (trade) query = query.eq("professional_trades.trade_id", Number(trade));
  if (date) query = query.eq("availability_slots.date", date);

  const { data: results, error } = await query.returns<ProfessionalResult[]>();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">Buscar un profesional</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Filtra por oficio, ciudad y, si quieres, una fecha concreta.
      </p>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="trade" className="block text-sm font-medium text-zinc-700">
            Oficio
          </label>
          <select
            id="trade"
            name="trade"
            defaultValue={trade ?? ""}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          >
            <option value="">Todos</option>
            {trades?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
            Ciudad
          </label>
          <input
            id="city"
            name="city"
            type="text"
            defaultValue={city ?? ""}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-zinc-700">
            Fecha
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={date ?? ""}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Buscar
        </button>
      </form>

      {error && (
        <p className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error.message}</p>
      )}

      <ul className="mt-8 flex flex-col gap-4">
        {results && results.length > 0 ? (
          results.map((pro) => {
            const name = firstOf(pro.profiles)?.full_name ?? "Profesional";
            return (
              <li key={pro.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-medium text-zinc-900">{name}</h2>
                  <span className="text-sm text-zinc-500">{pro.city}</span>
                </div>
                {pro.bio && <p className="mt-1 text-sm text-zinc-600">{pro.bio}</p>}
                <p className="mt-2 text-xs text-zinc-500">
                  {pro.professional_trades
                    .map((pt) => firstOf(pt.trades)?.label)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {date && pro.availability_slots.length > 0 && (
                  <p className="mt-2 text-sm text-teal-700">
                    Libre el {date}:{" "}
                    {pro.availability_slots
                      .map((s) => TIMEFRAME_LABEL[s.timeframe])
                      .join(", ")}
                  </p>
                )}
              </li>
            );
          })
        ) : (
          <li className="py-6 text-center text-sm text-zinc-500">
            No hay profesionales que encajen con esa búsqueda todavía.
          </li>
        )}
      </ul>
    </div>
  );
}
