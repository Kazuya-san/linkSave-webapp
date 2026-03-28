import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const sans = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LinkSave",
  description:
    "Save articles, generate structured summaries, and search your reading library.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${sans.variable} ${mono.variable} antialiased`}
        >
          <SiteHeader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
