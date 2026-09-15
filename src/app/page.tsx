import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        AgendaUnManitas
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600">
        Encuentra un profesional según su disponibilidad real — no una lista
        de contactos a ciegas.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Crear cuenta
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-white"
        >
          Entrar
        </Link>
      </div>
    </div>
  );
}
