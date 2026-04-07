import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lexio Underground — Evolua seu idioma.",
    template: "%s | Lexio Underground",
  },
  description:
    "A plataforma gamificada de treinamento de idiomas com IA dos criadores do Liceu Underground. Exercícios alinhados ao CEFR, tutor de IA, sequências, classificações.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Lexio Underground",
    title: "Lexio Underground — Evolua seu idioma.",
    description: "Treinamento ESL gamificado e com IA para profissionais brasileiros.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
