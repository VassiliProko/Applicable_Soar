import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { MantineProvider } from "@mantine/core";
import Navbar from "./components/Navbar";
import LayoutFooter from "./components/LayoutFooter";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Applicable",
  description:
    "Launch projects, find talent. Set up a project page to share, track, and discover talent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <MantineProvider>
          <Navbar />
          {children}
          <LayoutFooter />
        </MantineProvider>
        <Analytics />
      </body>
    </html>
  );
}
