import type { SvgIconComponent } from "@mui/icons-material";
import ElectricalServicesOutlined from "@mui/icons-material/ElectricalServicesOutlined";
import PlumbingOutlined from "@mui/icons-material/PlumbingOutlined";
import CarpenterOutlined from "@mui/icons-material/CarpenterOutlined";
import ConstructionOutlined from "@mui/icons-material/ConstructionOutlined";
import FormatPaintOutlined from "@mui/icons-material/FormatPaintOutlined";
import VpnKeyOutlined from "@mui/icons-material/VpnKeyOutlined";
import AcUnitOutlined from "@mui/icons-material/AcUnitOutlined";
import ThermostatOutlined from "@mui/icons-material/ThermostatOutlined";
import GrassOutlined from "@mui/icons-material/GrassOutlined";
import CleaningServicesOutlined from "@mui/icons-material/CleaningServicesOutlined";
import LocalShippingOutlined from "@mui/icons-material/LocalShippingOutlined";
import RoofingOutlined from "@mui/icons-material/RoofingOutlined";
import WindowOutlined from "@mui/icons-material/WindowOutlined";
import KitchenOutlined from "@mui/icons-material/KitchenOutlined";
import SettingsInputAntennaOutlined from "@mui/icons-material/SettingsInputAntennaOutlined";
import HandymanOutlined from "@mui/icons-material/HandymanOutlined";

const ICONS_BY_SLUG: Record<string, SvgIconComponent> = {
  electricista: ElectricalServicesOutlined,
  fontanero: PlumbingOutlined,
  carpintero: CarpenterOutlined,
  albanil: ConstructionOutlined,
  pintor: FormatPaintOutlined,
  cerrajero: VpnKeyOutlined,
  climatizacion: AcUnitOutlined,
  calefaccion: ThermostatOutlined,
  jardineria: GrassOutlined,
  limpieza: CleaningServicesOutlined,
  mudanzas: LocalShippingOutlined,
  tejados: RoofingOutlined,
  cristaleria: WindowOutlined,
  persianas: WindowOutlined,
  electrodomesticos: KitchenOutlined,
  antenista: SettingsInputAntennaOutlined,
};

export function tradeIcon(slug: string): SvgIconComponent {
  return ICONS_BY_SLUG[slug] ?? HandymanOutlined;
}
