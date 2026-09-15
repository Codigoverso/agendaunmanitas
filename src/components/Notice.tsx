export function Notice({
  type,
  children,
}: {
  type: "success" | "error";
  children?: string;
}) {
  if (!children) return null;
  const styles = type === "success" ? "bg-teal-50 text-teal-800" : "bg-red-50 text-red-700";
  return <p className={`mb-4 rounded-md px-3 py-2 text-sm ${styles}`}>{children}</p>;
}
