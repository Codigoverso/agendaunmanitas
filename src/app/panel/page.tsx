import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, city")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">
        Hola, {profile?.full_name || user.email}
      </h1>
      {profile?.city && <p className="mt-1 text-sm text-zinc-600">{profile.city}</p>}
      <Link
        href="/profesional"
        className="mt-6 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
      >
        Modo profesional
      </Link>
      <form action={signOut} className="mt-4">
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
