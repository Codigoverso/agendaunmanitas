import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { PanelNav } from "@/components/PanelNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const { data: professional } = await supabase
    .from("professional_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name || user.email || "?";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 md:flex-row">
      <aside className="w-full shrink-0 md:w-56">
        <div className="flex flex-col items-center text-center">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagen dinámica de Supabase Storage
            <img
              src={profile.avatar_url}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-semibold text-teal-700">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="mt-3 font-medium text-zinc-900">{displayName}</p>
        </div>

        <PanelNav isProfessional={!!professional} />

        <form action={signOut} className="mt-6">
          <button
            type="submit"
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
