import Alert from "@mui/material/Alert";

export function Notice({
  type,
  children,
}: {
  type: "success" | "error";
  children?: string;
}) {
  if (!children) return null;
  return (
    <Alert severity={type} sx={{ mb: 2 }}>
      {children}
    </Alert>
  );
}
