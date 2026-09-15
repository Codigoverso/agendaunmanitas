"use client";

import { useFormStatus } from "react-dom";
import ButtonBase from "@mui/material/ButtonBase";

export function CalendarSlotButton({ isBlocked, time }: { isBlocked: boolean; time: string }) {
  const { pending } = useFormStatus();
  return (
    <ButtonBase
      type="submit"
      disabled={pending}
      title={`${time} · ${isBlocked ? "Ocupado" : "Disponible"}`}
      sx={{
        display: "block",
        width: "100%",
        height: 16,
        bgcolor: pending ? "grey.200" : isBlocked ? "error.light" : "secondary.light",
        "&:hover": { bgcolor: pending ? undefined : isBlocked ? "error.main" : "secondary.main" },
      }}
    />
  );
}
