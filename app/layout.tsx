import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import WiiCursor from "@/components/WiiCursor";

export const metadata: Metadata = {
  title: "design archive",
  description: "An archive of iconic design objects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col relative">
        <WiiCursor />
        <Navigation />
        <main className="flex-1 relative z-10">{children}</main>
      </body>
    </html>
  );
}
