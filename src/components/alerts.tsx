"use client";

import { useState } from "react";

interface Motor {
  id: number;
  escopo: string;
  empresa: string | null;
  equipamento: string | null;
  setor: string | null;
  potencia: string | null;
  data_saida: string | null;
  data_volta: string | null;
}

interface AlertsProps {
  motores: Motor[];
}

function daysSince(dateStr: string): number {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / 86400000);
}

export function Alerts({ motores }: AlertsProps) {
  const [threshold, setThreshold] = useState(90);

  const emReparo = motores
    .filter((m) => m.data_saida && !m.data_volta)
    .map((m) => ({
      ...m,
      dias: daysSince(m.data_saida!),
    }))
    .filter((m) => m.dias >= threshold)
    .sort((a, b) => b.dias - a.dias);

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
            Alertas de reparo
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Motores sem retorno há mais de{" "}
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(Math.max(1, Number(e.target.value)))}
              className="w-12 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-0.5 text-[10px] text-amber-700 font-mono text-center focus:outline-none focus:border-amber-400 inline-block mx-0.5"
            />{" "}
            dias
          </p>
        </div>
        {emReparo.length > 0 && (
          <span className="text-[10px] font-mono bg-red-50 text-red-600 px-2.5 py-1 rounded-md">
            {emReparo.length} alerta{emReparo.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {emReparo.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-xs text-zinc-400">Nenhum motor acima do limite</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
          {emReparo.map((m) => {
            const severity =
              m.dias >= 365
                ? "border-red-200 bg-red-50/50"
                : m.dias >= 180
                ? "border-amber-200 bg-amber-50/50"
                : "border-zinc-100";

            return (
              <div
                key={m.id}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${severity} transition-colors`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-[11px] font-mono font-medium text-amber-700 shrink-0">
                    {m.escopo}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {m.setor || m.equipamento || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] text-zinc-400">
                    {m.empresa}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-medium ${
                      m.dias >= 365
                        ? "text-red-600"
                        : m.dias >= 180
                        ? "text-amber-600"
                        : "text-zinc-500"
                    }`}
                  >
                    {m.dias}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
