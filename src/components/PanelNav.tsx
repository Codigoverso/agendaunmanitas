"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const NAV_ITEMS = [
  { href: "/panel/perfil", label: "Perfil", professionalOnly: false },
  { href: "/panel/solicitudes", label: "Solicitudes", professionalOnly: true },
  { href: "/panel/horario", label: "Horario", professionalOnly: true },
  { href: "/panel/calendario", label: "Calendario", professionalOnly: true },
];

export function PanelNav({ isProfessional }: { isProfessional: boolean }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.professionalOnly || isProfessional);

  return (
    <Box sx={{ mt: 3 }}>
      <List sx={{ py: 0 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname === item.href}
            sx={{ borderRadius: 1, mb: 0.5 }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      {!isProfessional && (
        <Button
          component={Link}
          href="/profesional"
          variant="contained"
          fullWidth
          sx={{ mt: 1 }}
        >
          Activar modo profesional
        </Button>
      )}
    </Box>
  );
}
