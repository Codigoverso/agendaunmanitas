import { createClient } from "@/lib/supabase/server";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";
import { isoWeekday } from "@/lib/dates";

const TIMEFRAME_LABEL: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
};

type ProfessionalResult = {
  id: string;
  coverage_region: string | null;
  coverage_province: string | null;
  coverage_city: string | null;
  bio: string | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
  professional_trades: { trade_id: number; trades: { label: string } | { label: string }[] | null }[];
  weekly_availability: { day_of_week: number; timeframe: string }[];
  blocked_slots: { date: string; timeframe: string }[];
};

function firstOf<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function coverageLabel(pro: ProfessionalResult) {
  if (pro.coverage_city) return `${pro.coverage_city} (${pro.coverage_province})`;
  if (pro.coverage_province) return `Toda la provincia de ${pro.coverage_province}`;
  if (pro.coverage_region) return `Toda ${pro.coverage_region}`;
  return "Toda España";
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

// Disponible esa fecha = franjas de su horario semanal para ese día de la
// semana, menos las que haya marcado como ocupadas justo esa fecha.
function availableTimeframesOn(pro: ProfessionalResult, date: string) {
  const dow = isoWeekday(date);
  const blocked = new Set(pro.blocked_slots.map((b) => b.timeframe));
  return pro.weekly_availability
    .filter((w) => w.day_of_week === dow)
    .map((w) => w.timeframe)
    .filter((tf) => !blocked.has(tf));
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
    ? "weekly_availability!inner(day_of_week, timeframe)"
    : "weekly_availability(day_of_week, timeframe)";
  const selectBlocked = date ? ", blocked_slots(date, timeframe)" : "";

  let query = supabase
    .from("professional_profiles")
    .select(
      `id, coverage_region, coverage_province, coverage_city, bio, profiles(full_name), ${selectTrades}, ${selectWeekly}${selectBlocked}`
    )
    .eq("is_active", true);

  if (trade) query = query.eq("professional_trades.trade_id", Number(trade));
  if (dow) query = query.eq("weekly_availability.day_of_week", dow);
  if (date) query = query.eq("blocked_slots.date", date);

  const { data: rawResults, error } = await query.returns<ProfessionalResult[]>();

  let results = rawResults?.filter((pro) => matchesLocation(pro, region, province, city));
  if (date) {
    results = results?.filter((pro) => availableTimeframesOn(pro, date).length > 0);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">Buscar un profesional</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Filtra por oficio, ubicación y, si quieres, una fecha concreta.
      </p>

      <form className="mt-6 flex flex-col gap-4">
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
        <OptionalLocationFields
          regionAnyLabel="Cualquier comunidad"
          provinceAnyLabel="Cualquier provincia"
          cityAnyLabel="Cualquier población"
          defaultRegion={region ?? ""}
          defaultProvince={province ?? ""}
          defaultCity={city ?? ""}
        />
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
          className="mt-2 self-start rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
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
            const availableToday = date ? availableTimeframesOn(pro, date) : [];
            return (
              <li key={pro.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-baseline justify-between">
                  <h2 className="font-medium text-zinc-900">{name}</h2>
                  <span className="text-sm text-zinc-500">{coverageLabel(pro)}</span>
                </div>
                {pro.bio && <p className="mt-1 text-sm text-zinc-600">{pro.bio}</p>}
                <p className="mt-2 text-xs text-zinc-500">
                  {pro.professional_trades
                    .map((pt) => firstOf(pt.trades)?.label)
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {date && availableToday.length > 0 && (
                  <p className="mt-2 text-sm text-teal-700">
                    Libre el {date}: {availableToday.map((tf) => TIMEFRAME_LABEL[tf]).join(", ")}
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
