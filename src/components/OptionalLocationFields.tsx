"use client";

import { useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
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
      <FormControl fullWidth>
        <InputLabel id="region-label">{regionLabel}</InputLabel>
        <Select
          labelId="region-label"
          name="region"
          label={regionLabel}
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setProvince("");
          }}
        >
          <MenuItem value="">{regionAnyLabel}</MenuItem>
          {AUTONOMOUS_COMMUNITIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {region && (
        <FormControl fullWidth>
          <InputLabel id="province-label">{provinceLabel}</InputLabel>
          <Select
            labelId="province-label"
            name="province"
            label={provinceLabel}
            value={province}
            onChange={(e) => setProvince(e.target.value)}
          >
            <MenuItem value="">{provinceAnyLabel}</MenuItem>
            {provinces.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {province && (
        <FormControl fullWidth>
          <InputLabel id="city-label">{cityLabel}</InputLabel>
          <Select
            key={province}
            labelId="city-label"
            name="city"
            label={cityLabel}
            defaultValue={defaultCity}
          >
            <MenuItem value="">{cityAnyLabel}</MenuItem>
            {municipalities.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </>
  );
}
