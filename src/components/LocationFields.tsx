"use client";

import { useState } from "react";
import { AUTONOMOUS_COMMUNITIES, PROVINCES_BY_COMMUNITY } from "@/lib/spain-locations";

export function LocationFields({
  defaultRegion = "",
}: {
  defaultRegion?: string;
}) {
  const [region, setRegion] = useState(defaultRegion);
  const provinces = region ? (PROVINCES_BY_COMMUNITY[region] ?? []) : [];

  return (
    <>
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-zinc-700">
          País
        </label>
        <select
          id="country"
          name="country"
          disabled
          defaultValue="España"
          className="mt-1 block w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-500"
        >
          <option>España</option>
        </select>
      </div>
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-zinc-700">
          Comunidad autónoma
        </label>
        <select
          id="region"
          name="region"
          required
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
        >
          <option value="">Selecciona...</option>
          {AUTONOMOUS_COMMUNITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
          Provincia / ciudad
        </label>
        <select
          id="city"
          name="city"
          required
          disabled={!region}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none disabled:bg-zinc-50 disabled:text-zinc-400"
        >
          <option value="">{region ? "Selecciona..." : "Elige antes una comunidad"}</option>
          {provinces.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
