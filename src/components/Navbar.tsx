"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowLeftRight, Droplets, PieChart, Shuffle, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./icons";
import { ChainSelector } from "./ChainSelector";
import { WalletButton } from "./WalletButton";
import { useDexStore } from "@/store/useDexStore";

const LINKS = [
  { href: "/swap", label: "Swap", icon: ArrowLeftRight },
  { href: "/bridge", label: "Bridge", icon: Shuffle },
  { href: "/pools", label: "Pools", icon: Droplets },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { selectedChain, setChain } = useDexStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      <div className="absolute inset-0 bg-bg/70 backdrop-blur-xl border-b border-white/5" />
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo />
          <span className="text-lg">Prism</span>
          <span className="hidden md:inline text-[10px] uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-2 py-0.5 ml-1">beta</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 ml-6 rounded-full glass p-1">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={clsx(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition",
                  active ? "bg-white/10 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]" : "text-white/55 hover:text-white",
                )}
              >
                <l.icon size={15} />
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ChainSelector value={selectedChain} onChange={setChain} />
          <WalletButton />
          <button className="md:hidden h-9 w-9 grid place-items-center rounded-full hover:bg-white/10" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      {mobileOpen && (
        <div className="relative md:hidden border-t border-white/5 bg-bg/90 backdrop-blur-xl px-4 py-3 grid grid-cols-2 gap-2 animate-fade-up">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className={clsx("flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm", pathname.startsWith(l.href) ? "bg-white/10" : "bg-white/5")}>
              <l.icon size={15} /> {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
