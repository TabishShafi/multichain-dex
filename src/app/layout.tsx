import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Background } from "@/components/Background";
import { TxToaster } from "@/components/TxToaster";
import { StoreHydrator } from "@/components/StoreHydrator";
import { Footer } from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prism — Multi-chain DEX",
  description: "Swap, bridge and provide liquidity across 8 chains from one interface. Prototype.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative">
        <StoreHydrator />
        <Background />
        <Navbar />
        <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-24">{children}</main>
        <Footer />
        <TxToaster />
      </body>
    </html>
  );
}
