"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/panel/perfil", label: "Perfil", professionalOnly: false },
  { href: "/panel/solicitudes", label: "Solicitudes", professionalOnly: true },
  { href: "/panel/horario", label: "Horario", professionalOnly: true },
  { href: "/panel/calendario", label: "Calendario", professionalOnly: true },
];

export function PanelNav({ isProfessional }: { isProfessional: boolean }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.professionalOnly || isProfessional);

  return (
    <nav className="mt-6 flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              active ? "bg-teal-50 text-teal-800" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      {!isProfessional && (
        <Link
          href="/profesional"
          className="mt-2 rounded-md bg-teal-700 px-3 py-2 text-center text-sm font-medium text-white hover:bg-teal-800"
        >
          Activar modo profesional
        </Link>
      )}
    </nav>
  );
}
