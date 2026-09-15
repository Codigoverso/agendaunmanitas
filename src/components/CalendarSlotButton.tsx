"use client";

import { useFormStatus } from "react-dom";

export function CalendarSlotButton({ isBlocked, time }: { isBlocked: boolean; time: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title={`${time} · ${isBlocked ? "Ocupado" : "Disponible"}`}
      className={`h-4 w-full ${
        pending
          ? "animate-pulse bg-zinc-200"
          : isBlocked
            ? "bg-red-100 hover:bg-red-200"
            : "bg-teal-100 hover:bg-teal-200"
      }`}
    />
  );
}
