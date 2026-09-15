import Box from "@mui/material/Box";
import { SiteHeader } from "@/components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <SiteHeader />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>{children}</Box>
    </Box>
  );
}
