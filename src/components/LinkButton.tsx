"use client";

import Link from "next/link";
import Button, { ButtonProps } from "@mui/material/Button";

// MUI's Button + Link composition needs to happen client-side: passing the
// Link component itself as a prop from a Server Component fails to
// serialize across the RSC boundary.
export function LinkButton({ href, ...props }: ButtonProps & { href: string }) {
  return <Button component={Link} href={href} {...props} />;
}
