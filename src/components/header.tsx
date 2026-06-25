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
    <header className="border-b border-zinc-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0"
          >
            <circle cx="8" cy="8" r="3" fill="#4DBBA0" />
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="#4DBBA0"
              strokeWidth="0.75"
              opacity="0.3"
            />
          </svg>
          <span className="text-[10px] font-medium tracking-[2px] sm:tracking-[2.5px] uppercase text-zinc-500 hidden sm:inline">
            Controle de motores
          </span>
          <span className="text-[10px] font-medium tracking-[2px] uppercase text-zinc-500 sm:hidden">
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
                className={`px-3 sm:px-4 py-3 text-xs transition-colors border-b-[1.5px] ${
                  active
                    ? "text-zinc-200 border-amber-600/80"
                    : "text-zinc-600 border-transparent hover:text-zinc-400"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <span className="text-[10px] font-mono text-zinc-700 tracking-wider hidden sm:inline">
          SANTHER
        </span>
        <span className="sm:hidden w-4" />
      </div>
    </header>
  );
}
