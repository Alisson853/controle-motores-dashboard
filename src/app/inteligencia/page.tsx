"use client";

import { useState, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Tabela de specs WEG — modelos industriais mais comuns              */
/* ------------------------------------------------------------------ */

interface WegMotor {
  modelo: string;
  carcaca: string;
  potencia_cv: number;
  potencia_kw: number;
  polos: number;
  rpm: number;
  tensao: string;
  corrente_a: string;
  rendimento: string;
  peso_kg: number;
  ip: string;
  regime: string;
}

const WEG_CATALOGO: WegMotor[] = [
  { modelo: "W22 IR3 Premium", carcaca: "63", potencia_cv: 0.5, potencia_kw: 0.37, polos: 4, rpm: 1730, tensao: "220/380V", corrente_a: "1.9/1.1", rendimento: "72.0%", peso_kg: 5.5, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "71", potencia_cv: 1, potencia_kw: 0.75, polos: 4, rpm: 1720, tensao: "220/380V", corrente_a: "3.5/2.0", rendimento: "80.0%", peso_kg: 8, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "80", potencia_cv: 2, potencia_kw: 1.5, polos: 4, rpm: 1720, tensao: "220/380V", corrente_a: "6.3/3.6", rendimento: "84.0%", peso_kg: 14, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "90S", potencia_cv: 3, potencia_kw: 2.2, polos: 4, rpm: 1730, tensao: "220/380V", corrente_a: "8.8/5.1", rendimento: "86.5%", peso_kg: 20, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "90L", potencia_cv: 4, potencia_kw: 3, polos: 4, rpm: 1730, tensao: "220/380V", corrente_a: "11.6/6.7", rendimento: "87.5%", peso_kg: 24, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "100L", potencia_cv: 5, potencia_kw: 3.7, polos: 4, rpm: 1735, tensao: "220/380V", corrente_a: "14.0/8.1", rendimento: "88.5%", peso_kg: 32, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "112M", potencia_cv: 7.5, potencia_kw: 5.5, polos: 4, rpm: 1740, tensao: "220/380V", corrente_a: "20.5/11.9", rendimento: "89.5%", peso_kg: 42, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "132S", potencia_cv: 10, potencia_kw: 7.5, polos: 4, rpm: 1745, tensao: "220/380V", corrente_a: "27.0/15.6", rendimento: "90.5%", peso_kg: 58, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "132M", potencia_cv: 15, potencia_kw: 11, polos: 4, rpm: 1750, tensao: "220/380V", corrente_a: "39.0/22.5", rendimento: "91.5%", peso_kg: 78, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "160M", potencia_cv: 20, potencia_kw: 15, polos: 4, rpm: 1755, tensao: "220/380V", corrente_a: "52.0/30.0", rendimento: "92.0%", peso_kg: 110, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "160L", potencia_cv: 25, potencia_kw: 18.5, polos: 4, rpm: 1760, tensao: "220/380V", corrente_a: "64.0/37.0", rendimento: "92.5%", peso_kg: 130, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "180M", potencia_cv: 30, potencia_kw: 22, polos: 4, rpm: 1765, tensao: "220/380V", corrente_a: "75.0/43.3", rendimento: "93.0%", peso_kg: 155, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "180L", potencia_cv: 40, potencia_kw: 30, polos: 4, rpm: 1770, tensao: "220/380V", corrente_a: "100/58.0", rendimento: "93.5%", peso_kg: 190, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "200M", potencia_cv: 50, potencia_kw: 37, polos: 4, rpm: 1775, tensao: "220/380V", corrente_a: "124/71.5", rendimento: "93.8%", peso_kg: 235, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "200L", potencia_cv: 60, potencia_kw: 45, polos: 4, rpm: 1775, tensao: "220/380V", corrente_a: "149/86.0", rendimento: "94.0%", peso_kg: 275, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "225S/M", potencia_cv: 75, potencia_kw: 55, polos: 4, rpm: 1780, tensao: "220/380V", corrente_a: "182/105", rendimento: "94.5%", peso_kg: 340, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "250S/M", potencia_cv: 100, potencia_kw: 75, polos: 4, rpm: 1780, tensao: "220/380V", corrente_a: "244/141", rendimento: "95.0%", peso_kg: 450, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "280S/M", potencia_cv: 125, potencia_kw: 90, polos: 4, rpm: 1785, tensao: "380/660V", corrente_a: "163/94", rendimento: "95.0%", peso_kg: 580, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "315S/M", potencia_cv: 150, potencia_kw: 110, polos: 4, rpm: 1785, tensao: "380/660V", corrente_a: "198/114", rendimento: "95.5%", peso_kg: 720, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "315L", potencia_cv: 200, potencia_kw: 150, polos: 4, rpm: 1785, tensao: "380/660V", corrente_a: "268/155", rendimento: "95.5%", peso_kg: 900, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "355M/L", potencia_cv: 250, potencia_kw: 185, polos: 4, rpm: 1788, tensao: "380/660V", corrente_a: "330/190", rendimento: "96.0%", peso_kg: 1150, ip: "IP55", regime: "S1" },
  // 2 polos (alta rotação)
  { modelo: "W22 IR3 Premium", carcaca: "80", potencia_cv: 2, potencia_kw: 1.5, polos: 2, rpm: 3440, tensao: "220/380V", corrente_a: "5.8/3.4", rendimento: "84.0%", peso_kg: 12, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "90S", potencia_cv: 3, potencia_kw: 2.2, polos: 2, rpm: 3450, tensao: "220/380V", corrente_a: "8.2/4.7", rendimento: "85.5%", peso_kg: 17, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "100L", potencia_cv: 5, potencia_kw: 3.7, polos: 2, rpm: 3460, tensao: "220/380V", corrente_a: "13.2/7.6", rendimento: "88.0%", peso_kg: 28, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "112M", potencia_cv: 7.5, potencia_kw: 5.5, polos: 2, rpm: 3470, tensao: "220/380V", corrente_a: "19.4/11.2", rendimento: "89.0%", peso_kg: 38, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "132S", potencia_cv: 10, potencia_kw: 7.5, polos: 2, rpm: 3475, tensao: "220/380V", corrente_a: "25.5/14.7", rendimento: "90.0%", peso_kg: 52, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "160M", potencia_cv: 20, potencia_kw: 15, polos: 2, rpm: 3500, tensao: "220/380V", corrente_a: "49.0/28.3", rendimento: "92.0%", peso_kg: 95, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "180M", potencia_cv: 30, potencia_kw: 22, polos: 2, rpm: 3510, tensao: "220/380V", corrente_a: "71.0/41.0", rendimento: "93.0%", peso_kg: 140, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "200M", potencia_cv: 50, potencia_kw: 37, polos: 2, rpm: 3540, tensao: "220/380V", corrente_a: "118/68.0", rendimento: "94.0%", peso_kg: 210, ip: "IP55", regime: "S1" },
  // 6 polos (baixa rotação)
  { modelo: "W22 IR3 Premium", carcaca: "100L", potencia_cv: 3, potencia_kw: 2.2, polos: 6, rpm: 1140, tensao: "220/380V", corrente_a: "9.6/5.5", rendimento: "84.0%", peso_kg: 30, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "132S", potencia_cv: 7.5, potencia_kw: 5.5, polos: 6, rpm: 1155, tensao: "220/380V", corrente_a: "22.5/13.0", rendimento: "89.0%", peso_kg: 55, ip: "IP55", regime: "S1" },
  { modelo: "W22 IR3 Premium", carcaca: "160M", potencia_cv: 15, potencia_kw: 11, polos: 6, rpm: 1165, tensao: "220/380V", corrente_a: "42.0/24.3", rendimento: "91.0%", peso_kg: 105, ip: "IP55", regime: "S1" },
  // W22 Plus (explosionproof)
  { modelo: "W22 Xd", carcaca: "90L", potencia_cv: 3, potencia_kw: 2.2, polos: 4, rpm: 1720, tensao: "220/380V", corrente_a: "9.2/5.3", rendimento: "85.0%", peso_kg: 28, ip: "IP56", regime: "S1" },
  { modelo: "W22 Xd", carcaca: "132S", potencia_cv: 10, potencia_kw: 7.5, polos: 4, rpm: 1740, tensao: "220/380V", corrente_a: "28.0/16.2", rendimento: "90.0%", peso_kg: 72, ip: "IP56", regime: "S1" },
  { modelo: "W22 Xd", carcaca: "160M", potencia_cv: 20, potencia_kw: 15, polos: 4, rpm: 1750, tensao: "220/380V", corrente_a: "54.0/31.2", rendimento: "91.5%", peso_kg: 130, ip: "IP56", regime: "S1" },
];

/* ------------------------------------------------------------------ */
/*  Clima — Open-Meteo (gratuita, sem key)                             */
/* ------------------------------------------------------------------ */

interface ClimaData {
  temperatura: number;
  umidade: number;
  vento_kmh: number;
  descricao: string;
  risco_motor: "baixo" | "medio" | "alto";
  mensagem_risco: string;
}

const CLIMA_CODES: Record<number, string> = {
  0: "Céu limpo", 1: "Parcialmente limpo", 2: "Parcialmente nublado", 3: "Nublado",
  45: "Neblina", 48: "Neblina com geada", 51: "Garoa leve", 53: "Garoa", 55: "Garoa forte",
  61: "Chuva leve", 63: "Chuva", 65: "Chuva forte", 71: "Neve leve", 73: "Neve",
  80: "Pancadas leves", 81: "Pancadas", 82: "Pancadas fortes", 95: "Trovoada", 96: "Trovoada com granizo",
};

function avaliarRisco(umidade: number, temp: number): { risco: "baixo" | "medio" | "alto"; msg: string } {
  if (umidade >= 85) return { risco: "alto", msg: "Umidade muito alta — risco de condensação nos enrolamentos. Verificar resistências de aquecimento dos motores parados." };
  if (umidade >= 70) return { risco: "medio", msg: "Umidade elevada — monitorar motores que ficam parados por longos períodos. Condensação pode degradar isolamento." };
  if (temp >= 40) return { risco: "medio", msg: "Temperatura ambiente alta — verificar ventilação dos motores e carga de trabalho. Risco de sobreaquecimento." };
  return { risco: "baixo", msg: "Condições ambientais normais para operação de motores elétricos." };
}

// Coordenadas: vou usar SP como padrão, mas pode ser ajustado
const LAT = -30.1087;
const LON = -51.3248;
const CIDADE = "Guaíba, RS";

export default function InteligenciaPage() {
  const [clima, setClima] = useState<ClimaData | null>(null);
  const [climaLoading, setClimaLoading] = useState(true);
  const [climaError, setClimaError] = useState<string | null>(null);
  const [searchSpec, setSearchSpec] = useState("");
  const [polosFilter, setPolosFilter] = useState<string>("todos");

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=America/Sao_Paulo`
    )
      .then((r) => r.json())
      .then((data) => {
        const c = data.current;
        const temp = c.temperature_2m;
        const umidade = c.relative_humidity_2m;
        const { risco, msg } = avaliarRisco(umidade, temp);
        setClima({
          temperatura: temp,
          umidade,
          vento_kmh: c.wind_speed_10m,
          descricao: CLIMA_CODES[c.weather_code] || "Desconhecido",
          risco_motor: risco,
          mensagem_risco: msg,
        });
      })
      .catch((err) => setClimaError(err.message))
      .finally(() => setClimaLoading(false));
  }, []);

  const filteredSpecs = useMemo(() => {
    let list = WEG_CATALOGO;
    if (searchSpec) {
      const q = searchSpec.toLowerCase();
      list = list.filter(
        (m) =>
          m.modelo.toLowerCase().includes(q) ||
          m.carcaca.toLowerCase().includes(q) ||
          String(m.potencia_cv).includes(q) ||
          String(m.potencia_kw).includes(q)
      );
    }
    if (polosFilter !== "todos") {
      list = list.filter((m) => String(m.polos) === polosFilter);
    }
    return list;
  }, [searchSpec, polosFilter]);

  const riscoColor = (r: string) => {
    if (r === "alto") return { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", dot: "bg-red-500", label: "ALTO" };
    if (r === "medio") return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-500", label: "MÉDIO" };
    return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500", label: "BAIXO" };
  };

  return (
    <main className="w-full px-3 sm:px-4 py-6 pb-10">
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-zinc-900">Inteligência</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Clima e especificações técnicas para manutenção</p>
      </div>

      {/* ---- CLIMA ---- */}
      <section className="mb-8">
        <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-zinc-400 mb-3">
          Clima atual — {CIDADE}
        </h2>

        {climaLoading && (
          <div className="bg-white rounded-xl border border-zinc-200 p-6 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
            <span className="text-xs text-zinc-500">Consultando Open-Meteo...</span>
          </div>
        )}

        {climaError && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p className="text-xs text-red-600">Erro ao carregar clima: {climaError}</p>
          </div>
        )}

        {clima && (() => {
          const rc = riscoColor(clima.risco_motor);
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {/* Dados do clima */}
              <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-2xl font-bold font-mono text-zinc-900">{clima.temperatura}°C</p>
                  <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">{clima.descricao}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <p className="text-zinc-400 text-[9px] uppercase tracking-wider mb-0.5">Umidade</p>
                    <p className="font-mono font-medium text-zinc-800">{clima.umidade}%</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-[9px] uppercase tracking-wider mb-0.5">Vento</p>
                    <p className="font-mono font-medium text-zinc-800">{clima.vento_kmh} km/h</p>
                  </div>
                </div>
              </div>

              {/* Barra de umidade visual */}
              <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5">
                <p className="text-[9px] uppercase tracking-wider text-zinc-400 mb-2">Umidade relativa</p>
                <div className="flex items-end gap-1 h-16">
                  {[20, 30, 40, 50, 60, 70, 80, 90, 100].map((level) => (
                    <div key={level} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-sm transition-colors ${
                          clima.umidade >= level
                            ? level >= 85 ? "bg-red-400" : level >= 70 ? "bg-amber-400" : "bg-emerald-400"
                            : "bg-zinc-100"
                        }`}
                        style={{ height: `${level * 0.6}px` }}
                      />
                      <span className="text-[7px] text-zinc-400">{level}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risco para motores */}
              <div className={`rounded-xl border p-4 sm:p-5 ${rc.bg} ${rc.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${rc.dot}`} />
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${rc.text}`}>
                    Risco {rc.label}
                  </p>
                </div>
                <p className={`text-[11px] leading-relaxed ${rc.text}`}>
                  {clima.mensagem_risco}
                </p>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ---- CATÁLOGO WEG ---- */}
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[2px] text-zinc-400 mb-3">
          Catálogo WEG — Especificações técnicas
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="flex-1 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por modelo, carcaça, potência..."
              value={searchSpec}
              onChange={(e) => setSearchSpec(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg py-2 pl-9 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
            />
          </div>
          <select
            value={polosFilter}
            onChange={(e) => setPolosFilter(e.target.value)}
            className="bg-white border border-zinc-200 rounded-lg px-3 py-2 text-[11px] text-zinc-600 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="todos">Todos os polos</option>
            <option value="2">2 polos (~3500 RPM)</option>
            <option value="4">4 polos (~1750 RPM)</option>
            <option value="6">6 polos (~1150 RPM)</option>
          </select>
        </div>

        <div className="text-[10px] text-zinc-400 mb-2">
          {filteredSpecs.length} modelos encontrados
        </div>

        <div className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden shadow-sm">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-2 py-2 text-left text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Modelo</th>
                <th className="px-2 py-2 text-left text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Carcaça</th>
                <th className="px-2 py-2 text-right text-[8px] font-semibold uppercase tracking-wide text-zinc-400">CV</th>
                <th className="px-2 py-2 text-right text-[8px] font-semibold uppercase tracking-wide text-zinc-400">kW</th>
                <th className="px-2 py-2 text-right text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Polos</th>
                <th className="px-2 py-2 text-right text-[8px] font-semibold uppercase tracking-wide text-zinc-400">RPM</th>
                <th className="px-2 py-2 text-left text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Tensão</th>
                <th className="px-2 py-2 text-left text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Corrente (A)</th>
                <th className="px-2 py-2 text-right text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Rend.</th>
                <th className="px-2 py-2 text-right text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Peso (kg)</th>
                <th className="px-2 py-2 text-left text-[8px] font-semibold uppercase tracking-wide text-zinc-400">IP</th>
                <th className="px-2 py-2 text-left text-[8px] font-semibold uppercase tracking-wide text-zinc-400">Regime</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecs.map((m, i) => (
                <tr key={i} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors">
                  <td className="px-2 py-1.5 font-medium text-zinc-700">{m.modelo}</td>
                  <td className="px-2 py-1.5 font-mono text-amber-700 font-medium">{m.carcaca}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-600 text-right">{m.potencia_cv}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-600 text-right">{m.potencia_kw}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-600 text-right">{m.polos}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-800 font-medium text-right">{m.rpm}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-500">{m.tensao}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-500">{m.corrente_a}</td>
                  <td className="px-2 py-1.5 font-mono text-emerald-600 text-right">{m.rendimento}</td>
                  <td className="px-2 py-1.5 font-mono text-zinc-600 text-right">{m.peso_kg}</td>
                  <td className="px-2 py-1.5 text-zinc-500">{m.ip}</td>
                  <td className="px-2 py-1.5 text-zinc-500">{m.regime}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSpecs.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-zinc-500">Nenhum modelo encontrado</p>
            </div>
          )}
        </div>

        <p className="text-[9px] text-zinc-400 mt-2">
          Dados de referência baseados no catálogo WEG W22 IR3 Premium. Valores aproximados — consulte o catálogo oficial para dados exatos.
        </p>
      </section>
    </main>
  );
}
