import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { activateProfessional } from "./actions";
import { OptionalLocationFields } from "@/components/OptionalLocationFields";

export default async function ActivateProfessionalPage({
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
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (professional) redirect("/panel");

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-zinc-900">Activar modo profesional</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Rellena tus datos para empezar a recibir solicitudes.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form action={activateProfessional} className="mt-6 flex flex-col gap-4">
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
        <fieldset className="flex flex-col gap-4">
          <legend className="text-sm font-medium text-zinc-700">Radio de actuación</legend>
          <p className="text-xs text-zinc-500">
            Sin mapa todavía: elige hasta qué nivel quieres acotar dónde trabajas. Puedes
            dejarlo en &quot;Toda España&quot; si te desplazas a cualquier sitio.
          </p>
          <OptionalLocationFields />
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
