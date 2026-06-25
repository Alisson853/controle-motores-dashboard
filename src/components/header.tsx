"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Painel" },
  { href: "/importar", label: "Importar" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <circle cx="8" cy="8" r="3" fill="#2D9D78" />
            <circle cx="8" cy="8" r="6" stroke="#2D9D78" strokeWidth="0.75" opacity="0.3" />
          </svg>
          <span className="text-[10px] font-semibold tracking-[2px] sm:tracking-[2.5px] uppercase text-zinc-500 hidden sm:inline">
            Controle de motores
          </span>
          <span className="text-[10px] font-semibold tracking-[2px] uppercase text-zinc-500 sm:hidden">
            Motores
          </span>
        </div>

        <nav className="flex items-center">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 sm:px-4 py-3 text-xs transition-colors border-b-[2px] ${
                  active
                    ? "text-zinc-900 font-medium border-amber-500"
                    : "text-zinc-500 border-transparent hover:text-zinc-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span className="text-[10px] font-mono text-zinc-400 tracking-wider hidden sm:inline">
          SANTHER
        </span>
        <span className="sm:hidden w-4" />
      </div>
    </header>
  );
}
