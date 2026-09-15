"use client";

import Link from "next/link";
import MuiLink, { LinkProps } from "@mui/material/Link";

export function LinkText({ href, ...props }: LinkProps & { href: string }) {
  return <MuiLink component={Link} href={href} {...props} />;
}
