import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppSessionProvider } from "@/components/common/session-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Smart Inventory System",
  description: "Production-ready inventory and order management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
