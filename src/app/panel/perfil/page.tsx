import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadAvatar } from "../actions";
import { firstOf, coverageLabel } from "@/lib/professional";
import { Notice } from "@/components/Notice";
import { SubmitButton } from "@/components/SubmitButton";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city, province, region")
    .eq("id", user.id)
    .single();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("bio, coverage_region, coverage_province, coverage_city")
    .eq("id", user.id)
    .maybeSingle();

  const { data: trades } = professional
    ? await supabase
        .from("professional_trades")
        .select("trades(label)")
        .eq("professional_id", user.id)
    : { data: null };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Tu perfil</h1>

      <div className="mt-4">
        <Notice type="success">{message}</Notice>
        <Notice type="error">{error}</Notice>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-zinc-700">Foto de perfil</h2>
        <form action={uploadAvatar} className="mt-2 flex flex-wrap items-center gap-3">
          <input type="file" name="avatar" accept="image/*" required className="text-sm" />
          <SubmitButton
            pendingText="Subiendo..."
            className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            Subir
          </SubmitButton>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-zinc-700">Datos personales</h2>
        <dl className="mt-2 flex flex-col gap-1 text-sm text-zinc-600">
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-800">Nombre:</dt>
            <dd>{profile?.full_name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-zinc-800">Ubicación:</dt>
            <dd>{[profile?.city, profile?.province, profile?.region].filter(Boolean).join(", ")}</dd>
          </div>
        </dl>
      </section>

      {professional && (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-zinc-700">Como profesional</h2>
          <dl className="mt-2 flex flex-col gap-1 text-sm text-zinc-600">
            <div className="flex gap-2">
              <dt className="font-medium text-zinc-800">Oficios:</dt>
              <dd>
                {trades
                  ?.map((t) => firstOf(t.trades)?.label)
                  .filter(Boolean)
                  .join(", ") || "—"}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-medium text-zinc-800">Cobertura:</dt>
              <dd>{coverageLabel(professional)}</dd>
            </div>
            {professional.bio && (
              <div className="flex gap-2">
                <dt className="font-medium text-zinc-800">Descripción:</dt>
                <dd>{professional.bio}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}
