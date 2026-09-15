"use client";

import { useFormStatus } from "react-dom";
import Button, { ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

export function SubmitButton({
  children,
  pendingText = "Guardando...",
  ...props
}: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={pending}
      startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
      {...props}
    >
      {pending ? pendingText : children}
    </Button>
  );
}
