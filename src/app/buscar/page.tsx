import { createClient } from "@/lib/supabase/server";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";
import { isoWeekday, halfHourSlotsInRange } from "@/lib/dates";
import { firstOf, coverageLabel } from "@/lib/professional";

type ProfessionalResult = {
  id: string;
  coverage_region: string | null;
  coverage_province: string | null;
  coverage_city: string | null;
  bio: string | null;
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
      `id, coverage_region, coverage_province, coverage_city, bio, profiles(full_name), ${selectTrades}, ${selectWeekly}${selectBlocked}`
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
            const { schedule, slots } = date ? freeSlotsOn(pro, date) : { schedule: null, slots: [] };
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
                {date && schedule && slots.length > 0 && (
                  <p className="mt-2 text-sm text-teal-700">
                    Libre el {date}, horario habitual {schedule.start_time.slice(0, 5)}–
                    {schedule.end_time.slice(0, 5)} ({slots.length} huecos de media hora)
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
