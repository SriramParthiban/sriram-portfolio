import type { Metadata } from "next";
import { Archivo, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE = "https://sriram-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Sriram Parthiban — AI Automation Engineer",
    template: "%s — Sriram Parthiban",
  },
  description:
    "AI automation engineer building end-to-end workflows that cut manual work and move business metrics. n8n, API integration, data analytics.",
  keywords: [
    "AI Automation Engineer",
    "n8n",
    "workflow automation",
    "data analytics",
    "API integration",
    "Sriram Parthiban",
  ],
  authors: [{ name: "Sriram Parthiban" }],
  creator: "Sriram Parthiban",
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Sriram Parthiban",
    title: "Sriram Parthiban — AI Automation Engineer",
    description:
      "Automation workflows that cut manual processing by 70% and lift campaign performance by 40%.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sriram Parthiban — AI Automation Engineer",
    description:
      "Automation workflows that cut manual processing by 70% and lift campaign performance by 40%.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${instrument.variable} ${geistMono.variable} antialiased`}
    >
      <body className="grain bg-ink text-bone">
        <Preloader />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
