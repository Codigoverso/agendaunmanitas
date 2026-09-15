import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SolicitudesPage() {
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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-900">Solicitudes</h1>
      <p className="mt-2 text-sm text-zinc-500">Todavía no has recibido ninguna solicitud.</p>
    </div>
  );
}
