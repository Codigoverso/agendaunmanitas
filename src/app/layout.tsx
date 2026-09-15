import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ThemeRegistry } from "@/components/ThemeRegistry";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AgendaUnManitas",
  description:
    "Encuentra un electricista, fontanero, carpintero, albañil, pintor o cerrajero según su disponibilidad real.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={roboto.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
