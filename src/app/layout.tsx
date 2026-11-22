import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "PizzaHub — Hot & Fresh Pizza Delivered", template: "%s | PizzaHub" },
  description: "Discover local pizzerias, browse their menus and order fresh pizza for delivery. Vendors manage menus and orders in one place.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
