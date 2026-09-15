export function firstOf<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function coverageLabel(coverage: {
  coverage_region: string | null;
  coverage_province: string | null;
  coverage_city: string | null;
}): string {
  if (coverage.coverage_city) return `${coverage.coverage_city} (${coverage.coverage_province})`;
  if (coverage.coverage_province) return `Toda la provincia de ${coverage.coverage_province}`;
  if (coverage.coverage_region) return `Toda ${coverage.coverage_region}`;
  return "Toda España";
}
