"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlineOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";

const NAV_ITEMS = [
  { href: "/panel/perfil", label: "Perfil", icon: PersonOutlineIcon, professionalOnly: false },
  { href: "/buscar", label: "Buscar profesional", icon: SearchOutlinedIcon, professionalOnly: false },
  { href: "/panel/solicitudes", label: "Solicitudes", icon: AssignmentOutlinedIcon, professionalOnly: true },
  { href: "/panel/horario", label: "Horario", icon: ScheduleOutlinedIcon, professionalOnly: true },
  { href: "/panel/calendario", label: "Calendario", icon: CalendarMonthOutlinedIcon, professionalOnly: true },
];

export function PanelNav({ isProfessional }: { isProfessional: boolean }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.professionalOnly || isProfessional);

  return (
    <Box sx={{ mt: 3 }}>
      <List sx={{ py: 0 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              sx={{ mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" color={pathname === item.href ? "primary" : "inherit"} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      {!isProfessional && (
        <Button
          component={Link}
          href="/profesional"
          variant="contained"
          fullWidth
          startIcon={<WorkOutlineIcon />}
          sx={{ mt: 1 }}
        >
          Activar modo profesional
        </Button>
      )}
    </Box>
  );
}
