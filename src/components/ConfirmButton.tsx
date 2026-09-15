"use client";

import { SubmitButton } from "@/components/SubmitButton";
import type { ButtonProps } from "@mui/material/Button";

export function ConfirmButton({
  confirmText,
  ...props
}: ButtonProps & { pendingText?: string; confirmText: string }) {
  return (
    <SubmitButton
      {...props}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    />
  );
}
