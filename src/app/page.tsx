"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { StatusChart } from "@/components/status-chart";
import { Alerts } from "@/components/alerts";

interface Motor {
  id: number;
  empresa: string | null;
  num_orcamento: string | null;
  escopo: string;
  equipamento: string | null;
  modelo_carcaca: string | null;
  problema_apresentado: string | null;
  codigo_utilizado: string | null;
  potencia: string | null;
  oc: string | null;
  cod_nf: string | null;
  pedido: string | null;
  orc_inicial: number | null;
  valor_final: number | null;
  setor: string | null;
  data_saida: string | null;
  data_volta: string | null;
  obs_1: string | null;
  obs_2: string | null;
  obs_3: string | null;
}

type SortKey = "escopo" | "empresa" | "potencia" | "setor" | "data_saida" | "valor_final";
type SortDir = "asc" | "desc";

function getStatus(motor: Motor): string {
  if (motor.data_volta) return "Retornou";
  if (motor.data_saida) return "Em reparo";
  return "Sem registro";
}

function statusColor(status: string) {
  switch (status) {
    case "Retornou":
      return { dot: "bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-400", bar: "#4DBBA0" };
    case "Em reparo":
      return { dot: "bg-amber-500", badge: "bg-amber-500/10 text-amber-400", bar: "#C9A84C" };
    default:
      return { dot: "bg-zinc-600", badge: "bg-zinc-500/10 text-zinc-500", bar: "#48484E" };
  }
}

function formatDate(d: string | null): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y.slice(2)}`;
}

function formatCurrency(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function Home() {
  const [motores, setMotores] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [empresaFilter, setEmpresaFilter] = useState<string>("todas");
  const [sortKey, setSortKey] = useState<SortKey>("escopo");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("motores")
        .select("*")
        .order("id", { ascending: true });
      if (error) {
        setFetchError(error.message);
      } else if (data) {
        setMotores(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const empresas = useMemo(() => {
    const set = new Set<string>();
    motores.forEach((m) => { if (m.empresa) set.add(m.empresa); });
    return [...set].sort();
  }, [motores]);

  const statusCounts = useMemo(() => {
    const counts = { "Retornou": 0, "Em reparo": 0, "Sem registro": 0 };
    motores.forEach((m) => {
      const s = getStatus(m);
      counts[s as keyof typeof counts]++;
    });
    return counts;
  }, [motores]);

  const empresaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    motores.forEach((m) => {
      const key = m.empresa || "Sem empresa";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(counts).sort(([, a], [, b]) => b - a)
    );
  }, [motores]);

  const filtered = useMemo(() => {
    let list = motores;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.escopo.toLowerCase().includes(q) ||
          (m.setor?.toLowerCase().includes(q)) ||
          (m.empresa?.toLowerCase().includes(q)) ||
          (m.equipamento?.toLowerCase().includes(q)) ||
          (m.codigo_utilizado?.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "todos") {
      list = list.filter((m) => getStatus(m) === statusFilter);
    }

    if (empresaFilter !== "todas") {
      list = list.filter((m) => m.empresa === empresaFilter);
    }

    list = [...list].sort((a, b) => {
      let va: string | number | null = a[sortKey];
      let vb: string | number | null = b[sortKey];
      if (va === null) va = "";
      if (vb === null) vb = "";
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb), "pt-BR");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [motores, search, statusFilter, empresaFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-zinc-800 ml-1">↕</span>;
    return <span className="text-amber-500/60 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // Loading state
  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
        <p className="text-xs text-zinc-600">Carregando motores...</p>
      </main>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-md mx-auto bg-red-950/20 border border-red-900/30 rounded-lg px-5 py-6 text-center">
          <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-red-300 font-medium">Erro ao carregar dados</p>
          <p className="text-xs text-zinc-600 mt-1.5 font-mono">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  // Empty state
  if (motores.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-900/60 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm text-zinc-400">Nenhum dado importado</p>
          <p className="text-[11px] text-zinc-700 mt-1">
            Importe a planilha .xlsx para começar a usar o painel
          </p>
          <a
            href="/importar"
            className="inline-flex items-center gap-1.5 mt-5 bg-amber-600/90 hover:bg-amber-600 text-[#0B0C10] text-xs font-medium px-5 py-2.5 rounded-md transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Importar planilha
          </a>
        </div>
      </main>
    );
  }

  const total = motores.length;

  return (
    <>
      {/* Fleet pulse strip */}
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-[2px] flex rounded-sm overflow-hidden opacity-70">
            <div style={{ flex: statusCounts["Retornou"] }} className="bg-emerald-500" />
            <div style={{ flex: statusCounts["Em reparo"] }} className="bg-amber-500" />
            <div style={{ flex: statusCounts["Sem registro"] }} className="bg-zinc-600" />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero row */}
        <div className="flex flex-col sm:grid sm:grid-cols-[180px_1fr] gap-5 sm:gap-8 mb-6 sm:mb-8 items-start">
          <div className="flex sm:block items-baseline gap-3">
            <p className="text-5xl sm:text-[56px] font-medium font-mono text-zinc-100 leading-none tracking-tight">
              {total}
            </p>
            <p className="text-[10px] text-zinc-600 sm:mt-2 uppercase tracking-widest whitespace-nowrap">
              motores registrados
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full self-center">
            {(["Retornou", "Em reparo", "Sem registro"] as const).map((status) => {
              const count = statusCounts[status];
              const pct = Math.round((count / total) * 100);
              const colors = statusColor(status);
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? "todos" : status)}
                  className={`bg-[#141519] rounded-lg p-3 sm:p-3.5 text-left relative overflow-hidden transition-all ${
                    statusFilter === status ? "ring-1 ring-zinc-700" : ""
                  }`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[2px]"
                    style={{ background: colors.bar }}
                  />
                  <p className="text-lg sm:text-xl font-medium font-mono text-zinc-200">{count}</p>
                  <p className="text-[9px] sm:text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">
                    {status}
                  </p>
                  <span className="absolute top-3 sm:top-3.5 right-3 sm:right-3.5 text-[10px] font-mono text-zinc-700">
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analytics row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 sm:mb-8">
          <StatusChart counts={statusCounts} empresaCounts={empresaCounts} />
          <Alerts motores={motores} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 relative">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar TAG, setor, empresa, equipamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141519] border border-zinc-800/50 rounded-md py-2.5 sm:py-2 pl-9 pr-3 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-[#141519] border border-zinc-800/50 rounded-md px-3 py-2.5 sm:py-2 text-[11px] text-zinc-500 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="todos">Status</option>
              <option value="Retornou">Retornou</option>
              <option value="Em reparo">Em reparo</option>
              <option value="Sem registro">Sem registro</option>
            </select>

            <select
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-[#141519] border border-zinc-800/50 rounded-md px-3 py-2.5 sm:py-2 text-[11px] text-zinc-500 focus:outline-none focus:border-zinc-600 cursor-pointer"
            >
              <option value="todas">Empresa</option>
              {empresas.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>

            {(statusFilter !== "todos" || empresaFilter !== "todas" || search) && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("todos"); setEmpresaFilter("todas"); }}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 px-2 transition-colors whitespace-nowrap"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-700">
            {filtered.length} de {total} registros
          </span>
        </div>

        {/* Table */}
        <div className="bg-[#141519] rounded-lg border border-zinc-800/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-800/40">
                  {([
                    ["escopo", "Tag"],
                    ["empresa", "Empresa"],
                    ["potencia", "Pot."],
                    ["setor", "Setor"],
                    ["data_saida", "Saída"],
                    ["valor_final", "R$ Final"],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() => toggleSort(key)}
                      className={`px-3 py-2.5 text-left text-[9px] font-medium uppercase tracking-wider cursor-pointer select-none transition-colors hover:text-zinc-400 ${
                        key === "valor_final" ? "text-right" : ""
                      } ${sortKey === key ? "text-zinc-400" : "text-zinc-600"}`}
                    >
                      {label}
                      <SortIcon col={key} />
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-left text-[9px] font-medium text-zinc-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-left text-[9px] font-medium text-zinc-600 uppercase tracking-wider">
                    Volta
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const status = getStatus(m);
                  const colors = statusColor(status);

                  return (
                    <tr
                      key={m.id}
                      onClick={() => setExpandedRow(expandedRow === m.id ? null : m.id)}
                      className={`border-b border-zinc-800/15 last:border-0 cursor-pointer transition-colors ${
                        expandedRow === m.id ? "bg-white/[0.025]" : "hover:bg-white/[0.015]"
                      }`}
                    >
                      <td className="px-3 py-2 font-mono font-medium text-amber-500/80">
                        {m.escopo}
                      </td>
                      <td className="px-3 py-2 text-zinc-500">{m.empresa || "—"}</td>
                      <td className="px-3 py-2 font-mono text-zinc-500">{m.potencia || "—"}</td>
                      <td className="px-3 py-2 text-zinc-500 max-w-[180px] truncate">
                        {m.setor || "—"}
                      </td>
                      <td className="px-3 py-2 font-mono text-zinc-600">
                        {formatDate(m.data_saida)}
                      </td>
                      <td className="px-3 py-2 font-mono text-zinc-400 text-right">
                        {formatCurrency(m.valor_final)}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded ${colors.badge}`}>
                          <span className={`w-[5px] h-[5px] rounded-full ${colors.dot}`} />
                          {status}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-mono text-zinc-600">
                        {formatDate(m.data_volta)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty filter results */}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs text-zinc-600">Nenhum motor encontrado</p>
              <button
                onClick={() => { setSearch(""); setStatusFilter("todos"); setEmpresaFilter("todas"); }}
                className="text-[10px] text-amber-500/60 hover:text-amber-400 mt-2 transition-colors"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Expanded detail */}
        {expandedRow && (() => {
          const m = motores.find((x) => x.id === expandedRow);
          if (!m) return null;
          return (
            <div className="mt-3 bg-[#141519] rounded-lg border border-zinc-800/40 p-4 sm:p-5 animate-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-medium text-zinc-200 font-mono">{m.escopo}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded ${statusColor(getStatus(m)).badge}`}>
                    <span className={`w-[5px] h-[5px] rounded-full ${statusColor(getStatus(m)).dot}`} />
                    {getStatus(m)}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedRow(null); }}
                  className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
                >
                  Fechar
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-3 text-[11px]">
                {([
                  ["Equipamento", m.equipamento],
                  ["Empresa", m.empresa],
                  ["Nº Orçamento", m.num_orcamento],
                  ["Modelo/Carcaça", m.modelo_carcaca],
                  ["Problema", m.problema_apresentado],
                  ["Código utilizado", m.codigo_utilizado],
                  ["Potência", m.potencia],
                  ["OC", m.oc],
                  ["Cód. NF", m.cod_nf],
                  ["Pedido", m.pedido],
                  ["Orç. inicial", m.orc_inicial ? `R$ ${formatCurrency(m.orc_inicial)}` : null],
                  ["Valor final", m.valor_final ? `R$ ${formatCurrency(m.valor_final)}` : null],
                  ["Setor", m.setor],
                  ["Saída", formatDate(m.data_saida)],
                  ["Volta", formatDate(m.data_volta)],
                  ["Obs 1", m.obs_1],
                  ["Obs 2", m.obs_2],
                  ["Obs 3", m.obs_3],
                ] as [string, string | number | null][]).map(([label, val]) => (
                  <div key={label}>
                    <p className="text-zinc-600 text-[9px] uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    <p className="text-zinc-300 font-mono break-words">
                      {val || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </main>
    </>
  );
}
