"use client";

import { useState } from "react";
import {
  AUTONOMOUS_COMMUNITIES,
  PROVINCES_BY_COMMUNITY,
  MUNICIPALITIES_BY_PROVINCE,
} from "@/lib/spain-locations";

// Cascada de comunidad → provincia → población donde cada nivel es
// opcional: dejarlo en blanco significa "sin acotar" a partir de ahí
// (toda España, toda la comunidad, o toda la provincia).
export function OptionalLocationFields({
  regionLabel = "Comunidad autónoma",
  provinceLabel = "Provincia",
  cityLabel = "Población",
  regionAnyLabel = "Toda España",
  provinceAnyLabel = "Toda la comunidad",
  cityAnyLabel = "Toda la provincia",
  defaultRegion = "",
  defaultProvince = "",
  defaultCity = "",
}: {
  regionLabel?: string;
  provinceLabel?: string;
  cityLabel?: string;
  regionAnyLabel?: string;
  provinceAnyLabel?: string;
  cityAnyLabel?: string;
  defaultRegion?: string;
  defaultProvince?: string;
  defaultCity?: string;
}) {
  const [region, setRegion] = useState(defaultRegion);
  const [province, setProvince] = useState(defaultProvince);
  const provinces = region ? (PROVINCES_BY_COMMUNITY[region] ?? []) : [];
  const municipalities = province ? (MUNICIPALITIES_BY_PROVINCE[province] ?? []) : [];

  return (
    <>
      <div>
        <label htmlFor="region" className="block text-sm font-medium text-zinc-700">
          {regionLabel}
        </label>
        <select
          id="region"
          name="region"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setProvince("");
          }}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
        >
          <option value="">{regionAnyLabel}</option>
          {AUTONOMOUS_COMMUNITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {region && (
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-zinc-700">
            {provinceLabel}
          </label>
          <select
            id="province"
            name="province"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          >
            <option value="">{provinceAnyLabel}</option>
            {provinces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      )}
      {province && (
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-zinc-700">
            {cityLabel}
          </label>
          <select
            id="city"
            name="city"
            defaultValue={defaultCity}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none"
          >
            <option value="">{cityAnyLabel}</option>
            {municipalities.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
