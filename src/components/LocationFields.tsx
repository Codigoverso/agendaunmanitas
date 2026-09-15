"use client";

import { useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { AUTONOMOUS_COMMUNITIES, PROVINCES_BY_COMMUNITY, MUNICIPALITIES_BY_PROVINCE } from "@/lib/spain-locations";

export function LocationFields({
  defaultRegion = "",
  defaultProvince = "",
  defaultCity = "",
}: {
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
      <FormControl fullWidth disabled>
        <InputLabel id="country-label">País</InputLabel>
        <Select labelId="country-label" name="country" label="País" value="España">
          <MenuItem value="España">España</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth required>
        <InputLabel id="region-label">Comunidad autónoma</InputLabel>
        <Select
          labelId="region-label"
          name="region"
          label="Comunidad autónoma"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setProvince("");
          }}
        >
          {AUTONOMOUS_COMMUNITIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={!region}>
        <InputLabel id="province-label">Provincia</InputLabel>
        <Select
          labelId="province-label"
          name="province"
          label="Provincia"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        >
          {provinces.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth required disabled={!province}>
        <InputLabel id="city-label">Población</InputLabel>
        <Select
          key={province}
          labelId="city-label"
          name="city"
          label="Población"
          defaultValue={defaultCity}
        >
          {municipalities.map((m) => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
