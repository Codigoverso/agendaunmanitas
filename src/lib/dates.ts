export const WEEKDAY_LABELS: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export const WEEKDAY_SHORT: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};

// 1 = lunes ... 7 = domingo (a diferencia de Date#getDay, que empieza en domingo=0).
export function isoWeekday(dateStr: string): number {
  const day = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function upcomingDates(days: number): string[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Lunes de la semana que contiene dateStr (o de esta semana si se omite).
export function startOfWeek(dateStr?: string): string {
  const date = dateStr ?? todayISO();
  return addDays(date, -(isoWeekday(date) - 1));
}

export function weekDates(mondayStr: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(mondayStr, i));
}

export function shiftWeek(mondayStr: string, weeks: number): string {
  return addDays(mondayStr, weeks * 7);
}

export function formatDayMonth(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

// "HH:MM" cada media hora entre startHour y endHour (excluido), ej. 8, 20 -> 08:00..19:30
export function halfHourSlots(startHour: number, endHour: number): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

// Compara "HH:MM" o "HH:MM:SS" (el time de Postgres llega con segundos).
export function timeInRange(time: string, start: string, end: string): boolean {
  const t = time.slice(0, 5);
  return t >= start.slice(0, 5) && t < end.slice(0, 5);
}

// Medias horas entre un start_time/end_time arbitrarios (no solo en punto),
// tal como los guarda el horario semanal de cada profesional.
export function halfHourSlotsInRange(startTime: string, endTime: string): string[] {
  const [sh, sm] = startTime.slice(0, 5).split(":").map(Number);
  const [eh, em] = endTime.slice(0, 5).split(":").map(Number);
  const endMin = eh * 60 + em;
  const slots: string[] = [];
  for (let t = sh * 60 + sm; t < endMin; t += 30) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return slots;
}
