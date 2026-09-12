import type { Metadata } from "next";
import { Archivo, Inter, Space_Mono } from "next/font/google";
import "./globals.css";

// Bolum 10-A: "Fontlar her iki kimlikte de ayni: Archivo (baslik), Inter (govde
// metni), Space Mono (veri/etiket)."
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IK Komuta Merkezi",
  description: "Mavi yaka/beyaz yaka karisik ekibi olan firmalar icin IK karar destek paneli",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${archivo.variable} ${inter.variable} ${spaceMono.variable}`}>{children}</body>
    </html>
  );
}
