"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { StatusChart } from "@/components/status-chart";
import { Alerts } from "@/components/alerts";
import { MotorForm, type MotorData } from "@/components/motor-form";

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

type SortKey = "escopo" | "empresa" | "num_orcamento" | "equipamento" | "modelo_carcaca" | "problema_apresentado" | "codigo_utilizado" | "potencia" | "oc" | "cod_nf" | "pedido" | "orc_inicial" | "valor_final" | "setor" | "data_saida" | "data_volta";
type SortDir = "asc" | "desc";

function getStatus(motor: Motor): string {
  if (motor.data_volta) return "Retornou";
  if (motor.data_saida) return "Em reparo";
  return "Sem registro";
}

function statusColor(status: string) {
  switch (status) {
    case "Retornou":
      return { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/50", bar: "#2D9D78" };
    case "Em reparo":
      return { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-700 border border-amber-200/50", bar: "#D4920A" };
    default:
      return { dot: "bg-zinc-400", badge: "bg-zinc-100 text-zinc-500 border border-zinc-200/50", bar: "#D4D4D8" };
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

  const [showForm, setShowForm] = useState(false);
  const [editingMotor, setEditingMotor] = useState<MotorData | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadMotores = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadMotores(); }, [loadMotores]);

  const handleSave = useCallback(async (data: MotorData) => {
    setSaving(true);
    try {
      const { id, ...fields } = data;
      if (id) {
        const { error } = await supabase.from("motores").update(fields).eq("id", id);
        if (error) throw error;
        showToast("Motor atualizado");
      } else {
        const { error } = await supabase.from("motores").insert([fields]);
        if (error) throw error;
        showToast("Motor adicionado");
      }
      setShowForm(false);
      setEditingMotor(null);
      await loadMotores();
    } catch (err) {
      showToast("Erro: " + (err instanceof Error ? err.message : "falha ao salvar"));
    } finally {
      setSaving(false);
    }
  }, [loadMotores, showToast]);

  const handleDelete = useCallback(async (id: number) => {
    const { error } = await supabase.from("motores").delete().eq("id", id);
    if (error) {
      showToast("Erro ao excluir: " + error.message);
    } else {
      showToast("Motor excluído");
      setExpandedRow(null);
      setDeleteConfirm(null);
      await loadMotores();
    }
  }, [loadMotores, showToast]);

  const openEdit = useCallback((motor: Motor) => {
    setEditingMotor({
      id: motor.id,
      empresa: motor.empresa,
      num_orcamento: motor.num_orcamento,
      escopo: motor.escopo,
      equipamento: motor.equipamento,
      modelo_carcaca: motor.modelo_carcaca,
      problema_apresentado: motor.problema_apresentado,
      codigo_utilizado: motor.codigo_utilizado,
      potencia: motor.potencia,
      oc: motor.oc,
      cod_nf: motor.cod_nf,
      pedido: motor.pedido,
      orc_inicial: motor.orc_inicial,
      valor_final: motor.valor_final,
      setor: motor.setor,
      data_saida: motor.data_saida,
      data_volta: motor.data_volta,
      obs_1: motor.obs_1,
      obs_2: motor.obs_2,
      obs_3: motor.obs_3,
    });
    setShowForm(true);
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
          m.setor?.toLowerCase().includes(q) ||
          m.empresa?.toLowerCase().includes(q) ||
          m.equipamento?.toLowerCase().includes(q) ||
          m.pedido?.toLowerCase().includes(q) ||
          m.codigo_utilizado?.toLowerCase().includes(q)
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
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="text-zinc-300 ml-1">↕</span>;
    return <span className="text-amber-600 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
        <p className="text-xs text-zinc-500">Carregando motores...</p>
      </main>
    );
  }

  if (fetchError) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl px-5 py-6 text-center">
          <p className="text-sm text-red-700 font-medium">Erro ao carregar dados</p>
          <p className="text-xs text-red-400 mt-1.5 font-mono">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  if (motores.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className="text-sm text-zinc-700 font-medium">Nenhum motor cadastrado</p>
          <p className="text-xs text-zinc-500 mt-1">
            Adicione seu primeiro motor ou importe uma planilha
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => { setEditingMotor(null); setShowForm(true); }}
              className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Novo motor
            </button>
            <a href="/importar" className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors">
              Importar .xlsx
            </a>
          </div>
        </div>
        {showForm && (
          <MotorForm
            motor={editingMotor}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditingMotor(null); }}
            saving={saving}
          />
        )}
      </main>
    );
  }

  const total = motores.length;

  return (
    <>
      {/* Hero with motor photo background */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/motor-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1B2838]/80 via-[#1B2838]/70 to-[#F5F5F2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B2838]/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-14 sm:pt-10 sm:pb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-[3px] mb-2">
                Frota ativa
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl sm:text-6xl font-bold font-mono text-white leading-none tracking-tight">
                  {total}
                </p>
                <p className="text-sm text-zinc-300 font-light">
                  motores
                </p>
              </div>
            </div>
            <button
              onClick={() => { setEditingMotor(null); setShowForm(true); }}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-900 text-xs font-semibold px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-amber-500/20"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Novo motor
            </button>
          </div>

          {/* Status cards on the photo */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
            {(["Retornou", "Em reparo", "Sem registro"] as const).map((status) => {
              const count = statusCounts[status];
              const pct = Math.round((count / total) * 100);
              const colors = statusColor(status);
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? "todos" : status)}
                  className={`backdrop-blur-md rounded-xl p-3 sm:p-4 text-left relative overflow-hidden transition-all border ${
                    statusFilter === status
                      ? "bg-white/20 border-white/30"
                      : "bg-white/10 border-white/10 hover:bg-white/15"
                  }`}
                >
                  <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: colors.bar }} />
                  <p className="text-xl sm:text-2xl font-bold font-mono text-white">{count}</p>
                  <p className="text-[9px] sm:text-[10px] text-zinc-300 mt-1 uppercase tracking-wider">
                    {status}
                  </p>
                  <span className="absolute top-3 sm:top-4 right-3 sm:right-4 text-[10px] font-mono text-white/40">
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="w-full px-3 sm:px-4 -mt-2 pb-8">
        {/* Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6 sm:mb-8">
          <StatusChart counts={statusCounts} empresaCounts={empresaCounts} />
          <Alerts motores={motores} />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar TAG, setor, empresa, equipamento, pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg py-2.5 sm:py-2 pl-9 pr-3 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-zinc-200 rounded-lg px-3 py-2.5 sm:py-2 text-[11px] text-zinc-600 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="todos">Status</option>
              <option value="Retornou">Retornou</option>
              <option value="Em reparo">Em reparo</option>
              <option value="Sem registro">Sem registro</option>
            </select>
            <select
              value={empresaFilter}
              onChange={(e) => setEmpresaFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-white border border-zinc-200 rounded-lg px-3 py-2.5 sm:py-2 text-[11px] text-zinc-600 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="todas">Empresa</option>
              {empresas.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {(statusFilter !== "todos" || empresaFilter !== "todas" || search) && (
              <button
                onClick={() => { setSearch(""); setStatusFilter("todos"); setEmpresaFilter("todas"); }}
                className="text-[10px] text-zinc-400 hover:text-zinc-600 px-2 transition-colors whitespace-nowrap"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-zinc-400">
            {filtered.length} de {total} registros
          </span>
        </div>

        {/* Table — full width, no scroll */}
        <div className="bg-white rounded-xl border border-zinc-200/60 overflow-hidden shadow-sm">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-zinc-100">
                {([
                  ["escopo", "Escopo"],
                  ["empresa", "Empresa"],
                  ["num_orcamento", "Nº Orç"],
                  ["equipamento", "Equip."],
                  ["modelo_carcaca", "Mod/Carc"],
                  ["problema_apresentado", "Problema"],
                  ["codigo_utilizado", "Cód Util"],
                  ["potencia", "Pot"],
                  ["oc", "OC"],
                  ["cod_nf", "NF"],
                  ["pedido", "Pedido"],
                  ["orc_inicial", "Orç Ini"],
                  ["valor_final", "V.Final"],
                  ["setor", "Setor"],
                  ["data_saida", "Saída"],
                  ["data_volta", "Volta"],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`px-1 py-2 text-left text-[8px] font-semibold uppercase tracking-wide cursor-pointer select-none transition-colors hover:text-zinc-600 ${
                      key === "orc_inicial" || key === "valor_final" ? "text-right" : ""
                    } ${sortKey === key ? "text-zinc-600" : "text-zinc-400"}`}
                  >
                    {label}
                    <SortIcon col={key} />
                  </th>
                ))}
                <th className="px-1 py-2 text-left text-[8px] font-semibold text-zinc-400 uppercase tracking-wide">St</th>
                <th className="px-1 py-2 text-[8px] font-semibold text-zinc-400 uppercase tracking-wide w-14"></th>
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
                    className={`border-b border-zinc-50 last:border-0 cursor-pointer transition-colors ${
                      expandedRow === m.id ? "bg-amber-50/30" : "hover:bg-zinc-50/60"
                    }`}
                  >
                    <td className="px-1 py-1.5 font-mono font-medium text-amber-700 truncate max-w-[80px]">{m.escopo}</td>
                    <td className="px-1 py-1.5 text-zinc-600 truncate max-w-[70px]">{m.empresa || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 truncate max-w-[55px]">{m.num_orcamento || "—"}</td>
                    <td className="px-1 py-1.5 text-zinc-500 truncate max-w-[80px]">{m.equipamento || "—"}</td>
                    <td className="px-1 py-1.5 text-zinc-500 truncate max-w-[70px]">{m.modelo_carcaca || "—"}</td>
                    <td className="px-1 py-1.5 text-zinc-500 truncate max-w-[90px]">{m.problema_apresentado || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 truncate max-w-[60px]">{m.codigo_utilizado || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 truncate max-w-[45px]">{m.potencia || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 truncate max-w-[45px]">{m.oc || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 truncate max-w-[45px]">{m.cod_nf || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 truncate max-w-[55px]">{m.pedido || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500 text-right truncate max-w-[50px]">{formatCurrency(m.orc_inicial)}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-700 text-right truncate max-w-[50px]">{formatCurrency(m.valor_final)}</td>
                    <td className="px-1 py-1.5 text-zinc-500 truncate max-w-[80px]">{m.setor || "—"}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500">{formatDate(m.data_saida)}</td>
                    <td className="px-1 py-1.5 font-mono text-zinc-500">{formatDate(m.data_volta)}</td>
                    <td className="px-1 py-1.5">
                      <span className={`w-2 h-2 rounded-full inline-block ${colors.dot}`} title={status} />
                    </td>
                    <td className="px-1 py-1.5">
                      <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openEdit(m)}
                          className="p-1 text-zinc-400 hover:text-amber-600 transition-colors rounded hover:bg-amber-50"
                          title="Editar"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(m.id)}
                          className="p-1 text-zinc-400 hover:text-red-500 transition-colors rounded hover:bg-red-50"
                          title="Excluir"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-xs text-zinc-500">Nenhum motor encontrado</p>
              <button
                onClick={() => { setSearch(""); setStatusFilter("todos"); setEmpresaFilter("todas"); }}
                className="text-[10px] text-amber-600 hover:text-amber-700 mt-2 transition-colors"
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
            <div className="mt-3 bg-white rounded-xl border border-zinc-200/60 p-4 sm:p-5 animate-in shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-semibold text-zinc-900 font-mono">{m.escopo}</h3>
                  <span className={`inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md ${statusColor(getStatus(m)).badge}`}>
                    <span className={`w-[5px] h-[5px] rounded-full ${statusColor(getStatus(m)).dot}`} />
                    {getStatus(m)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(m)}
                    className="text-[10px] text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setExpandedRow(null)}
                    className="text-zinc-400 hover:text-zinc-600 text-xs transition-colors"
                  >
                    Fechar
                  </button>
                </div>
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
                    <p className="text-zinc-400 text-[9px] uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-zinc-800 font-mono break-words">{val || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </main>

      {/* Motor form modal */}
      {showForm && (
        <MotorForm
          motor={editingMotor}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingMotor(null); }}
          saving={saving}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative bg-white rounded-xl shadow-xl border border-zinc-200 p-5 max-w-sm w-full animate-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-zinc-900 mb-2">Excluir motor?</h3>
            <p className="text-xs text-zinc-500 mb-5">
              Essa ação não pode ser desfeita. O motor será removido permanentemente.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg animate-in">
          {toast}
        </div>
      )}
    </>
  );
}
