import type { Metadata } from "next";
import { Amatic_SC, Cabin } from "next/font/google";
import "./globals.css";

const amatic = Amatic_SC({
  variable: "--font-amatic",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Artesanías Melanie — Hecho con manos y corazón",
  description:
    "Amigurumis tejidos a mano, patrones para crochet y agendas personalizadas. Pequeño taller artesanal con envíos a todo el país.",
  keywords: [
    "amigurumis",
    "crochet",
    "artesanías",
    "patrones de amigurumi",
    "agendas personalizadas",
    "hecho a mano",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${amatic.variable} ${cabin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-foreground">
        {children}
      </body>
    </html>
  );
}
