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
    default: "Lexio Underground — Level up your language.",
    template: "%s | Lexio Underground",
  },
  description:
    "The gamified, AI-powered language training platform from the makers of Liceu Underground. CEFR-aligned exercises, AI tutor, streaks, leaderboards.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Lexio Underground",
    title: "Lexio Underground — Level up your language.",
    description: "AI-powered, gamified ESL training for Brazilian professionals.",
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
