"use client";

import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { useState } from "react";

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale, BarElement);

interface StatusChartProps {
  counts: Record<string, number>;
  empresaCounts: Record<string, number>;
}

export function StatusChart({ counts, empresaCounts }: StatusChartProps) {
  const [view, setView] = useState<"status" | "empresa">("status");

  const statusLabels = Object.keys(counts);
  const statusValues = Object.values(counts);
  const statusColors = ["#4DBBA0", "#C9A84C", "#48484E"];

  const empresaLabels = Object.keys(empresaCounts).slice(0, 10);
  const empresaValues = empresaLabels.map((k) => empresaCounts[k]);

  return (
    <div className="bg-[#141519] rounded-lg border border-zinc-800/40 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
          Distribuição
        </h3>
        <div className="flex gap-0 bg-zinc-900/60 rounded-md overflow-hidden">
          <button
            onClick={() => setView("status")}
            className={`px-3 py-1.5 text-[10px] transition-colors ${
              view === "status"
                ? "text-zinc-200 bg-zinc-800/60"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setView("empresa")}
            className={`px-3 py-1.5 text-[10px] transition-colors ${
              view === "empresa"
                ? "text-zinc-200 bg-zinc-800/60"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            Empresa
          </button>
        </div>
      </div>

      {view === "status" ? (
        <div className="flex items-center gap-8">
          <div className="w-[140px] h-[140px] shrink-0">
            <Doughnut
              data={{
                labels: statusLabels,
                datasets: [
                  {
                    data: statusValues,
                    backgroundColor: statusColors,
                    borderWidth: 0,
                    hoverOffset: 4,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: "65%",
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#1E1F25",
                    titleColor: "#E8E5DE",
                    bodyColor: "#9A9BA3",
                    borderColor: "#2A2B32",
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 10,
                    titleFont: { size: 11, weight: "normal" },
                    bodyFont: { size: 11 },
                  },
                },
              }}
            />
          </div>
          <div className="flex flex-col gap-3">
            {statusLabels.map((label, i) => {
              const total = statusValues.reduce((a, b) => a + b, 0);
              const pct = Math.round((statusValues[i] / total) * 100);
              return (
                <div key={label} className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ background: statusColors[i] }}
                  />
                  <span className="text-[11px] text-zinc-400 min-w-[80px]">{label}</span>
                  <span className="text-[11px] font-mono text-zinc-300 font-medium">
                    {statusValues[i]}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-700">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="h-[160px]">
          <Bar
            data={{
              labels: empresaLabels,
              datasets: [
                {
                  data: empresaValues,
                  backgroundColor: "#C9A84C",
                  borderRadius: 3,
                  maxBarThickness: 28,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: "y",
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: "#1E1F25",
                  titleColor: "#E8E5DE",
                  bodyColor: "#9A9BA3",
                  borderColor: "#2A2B32",
                  borderWidth: 1,
                  cornerRadius: 6,
                  padding: 10,
                  bodyFont: { size: 11 },
                  callbacks: {
                    label: (ctx) => `${ctx.raw} motores`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: "rgba(255,255,255,0.03)" },
                  ticks: { color: "#48484E", font: { size: 10 } },
                },
                y: {
                  grid: { display: false },
                  ticks: { color: "#7C7D85", font: { size: 10 } },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
