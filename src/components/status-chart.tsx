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
  const statusColors = ["#2D9D78", "#D4920A", "#D4D4D8"];

  const empresaLabels = Object.keys(empresaCounts).slice(0, 10);
  const empresaValues = empresaLabels.map((k) => empresaCounts[k]);

  return (
    <div className="bg-white rounded-xl border border-zinc-200/60 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">
          Distribuição
        </h3>
        <div className="flex gap-0 bg-zinc-100 rounded-lg overflow-hidden">
          <button
            onClick={() => setView("status")}
            className={`px-3 py-1.5 text-[10px] transition-colors ${
              view === "status"
                ? "text-zinc-800 bg-white shadow-sm font-medium"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setView("empresa")}
            className={`px-3 py-1.5 text-[10px] transition-colors ${
              view === "empresa"
                ? "text-zinc-800 bg-white shadow-sm font-medium"
                : "text-zinc-500 hover:text-zinc-700"
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
                    backgroundColor: "#18181B",
                    titleColor: "#FAFAFA",
                    bodyColor: "#A1A1AA",
                    borderColor: "#27272A",
                    borderWidth: 1,
                    cornerRadius: 8,
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
                  <span className="text-[11px] text-zinc-600 min-w-[80px]">{label}</span>
                  <span className="text-[11px] font-mono text-zinc-800 font-medium">
                    {statusValues[i]}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{pct}%</span>
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
                  backgroundColor: "#D4920A",
                  borderRadius: 4,
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
                  backgroundColor: "#18181B",
                  titleColor: "#FAFAFA",
                  bodyColor: "#A1A1AA",
                  borderColor: "#27272A",
                  borderWidth: 1,
                  cornerRadius: 8,
                  padding: 10,
                  bodyFont: { size: 11 },
                  callbacks: {
                    label: (ctx) => `${ctx.raw} motores`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: "rgba(0,0,0,0.04)" },
                  ticks: { color: "#A1A1AA", font: { size: 10 } },
                },
                y: {
                  grid: { display: false },
                  ticks: { color: "#71717A", font: { size: 10 } },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}
