import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { LocationFields } from "@/components/LocationFields";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Como cliente o como profesional — puedes activar el modo profesional
          más adelante.
        </p>

        {error && (
          <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signUp} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700">
              Nombre
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>
          <LocationFields />
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="mt-2 rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600">
          ¿Ya tienes cuenta?{" "}
          <Link href="/entrar" className="font-medium text-teal-700 hover:underline">
            Entra
          </Link>
        </p>
      </div>
    </div>
  );
}
