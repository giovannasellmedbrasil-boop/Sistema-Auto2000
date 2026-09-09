import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Auto2000 — Seu próximo carro começa aqui",
    template: "%s | Auto2000",
  },
  description:
    "Encontre, simule e negocie seu veículo seminovo de forma simples, rápida e segura na Auto2000.",
  openGraph: {
    title: "Auto2000 — Seu próximo carro começa aqui",
    description:
      "Encontre, simule e negocie seu veículo seminovo de forma simples, rápida e segura.",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div className="page-glow" aria-hidden />
        {children}
      </body>
    </html>
  );
}
