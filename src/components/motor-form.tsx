"use client";

import { useState, useEffect } from "react";

export interface MotorData {
  id?: number;
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

const EMPTY: MotorData = {
  empresa: null, num_orcamento: null, escopo: "", equipamento: null,
  modelo_carcaca: null, problema_apresentado: null, codigo_utilizado: null,
  potencia: null, oc: null, cod_nf: null, pedido: null,
  orc_inicial: null, valor_final: null, setor: null,
  data_saida: null, data_volta: null, obs_1: null, obs_2: null, obs_3: null,
};

const EMPRESAS = ["MAXIMA", "EP MOTORES", "TRANSMOTOR", "DISMOTOR", "NELSON", "HIDROHARD"];

interface Props {
  motor?: MotorData | null;
  onSave: (data: MotorData) => Promise<void>;
  onClose: () => void;
  saving?: boolean;
}

export function MotorForm({ motor, onSave, onClose, saving }: Props) {
  const [form, setForm] = useState<MotorData>(motor || EMPTY);
  const [error, setError] = useState("");
  const isEdit = !!motor?.id;

  useEffect(() => {
    setForm(motor || EMPTY);
  }, [motor]);

  const set = (field: keyof MotorData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value || null }));
  };

  const setNum = (field: "orc_inicial" | "valor_final", value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
    setForm((prev) => ({ ...prev, [field]: cleaned ? parseFloat(cleaned) : null }));
  };

  const handleSubmit = async () => {
    if (!form.escopo.trim()) {
      setError("TAG / Escopo é obrigatório");
      return;
    }
    setError("");
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 animate-fade" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative bg-white rounded-xl shadow-xl border border-zinc-200 w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-5 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h3 className="text-sm font-semibold text-zinc-900">
            {isEdit ? "Editar motor" : "Novo motor"}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 transition-colors text-lg leading-none">&times;</button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Identificação */}
          <fieldset>
            <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Identificação</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="TAG / Escopo *" value={form.escopo} onChange={(v) => set("escopo", v)} mono />
              <Field label="Equipamento" value={form.equipamento || ""} onChange={(v) => set("equipamento", v)} />
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Empresa</label>
                <select
                  value={form.empresa || ""}
                  onChange={(e) => set("empresa", e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
                >
                  <option value="">Selecione</option>
                  {EMPRESAS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Técnico */}
          <fieldset>
            <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Dados técnicos</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Modelo / Carcaça" value={form.modelo_carcaca || ""} onChange={(v) => set("modelo_carcaca", v)} />
              <Field label="Potência" value={form.potencia || ""} onChange={(v) => set("potencia", v)} mono />
              <Field label="Código utilizado" value={form.codigo_utilizado || ""} onChange={(v) => set("codigo_utilizado", v)} mono />
            </div>
            <div className="mt-3">
              <Field label="Problema apresentado" value={form.problema_apresentado || ""} onChange={(v) => set("problema_apresentado", v)} />
            </div>
          </fieldset>

          {/* Comercial */}
          <fieldset>
            <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Comercial</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Nº Orçamento" value={form.num_orcamento || ""} onChange={(v) => set("num_orcamento", v)} mono />
              <Field label="OC" value={form.oc || ""} onChange={(v) => set("oc", v)} mono />
              <Field label="Cód. NF" value={form.cod_nf || ""} onChange={(v) => set("cod_nf", v)} mono />
              <Field label="Pedido" value={form.pedido || ""} onChange={(v) => set("pedido", v)} mono />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="Orç. inicial (R$)" value={form.orc_inicial?.toString() || ""} onChange={(v) => setNum("orc_inicial", v)} mono />
              <Field label="Valor final (R$)" value={form.valor_final?.toString() || ""} onChange={(v) => setNum("valor_final", v)} mono />
            </div>
          </fieldset>

          {/* Localização e datas */}
          <fieldset>
            <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Setor e datas</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Setor" value={form.setor || ""} onChange={(v) => set("setor", v)} />
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Data saída</label>
                <input
                  type="date"
                  value={form.data_saida || ""}
                  onChange={(e) => set("data_saida", e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 mb-1">Data volta</label>
                <input
                  type="date"
                  value={form.data_volta || ""}
                  onChange={(e) => set("data_volta", e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono text-zinc-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors"
                />
              </div>
            </div>
          </fieldset>

          {/* Observações */}
          <fieldset>
            <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">Observações</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Obs 1" value={form.obs_1 || ""} onChange={(v) => set("obs_1", v)} />
              <Field label="Obs 2" value={form.obs_2 || ""} onChange={(v) => set("obs_2", v)} />
              <Field label="Obs 3" value={form.obs_3 || ""} onChange={(v) => set("obs_3", v)} />
            </div>
          </fieldset>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-5 py-4 flex items-center justify-between rounded-b-xl">
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Adicionar motor"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, mono }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] text-zinc-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/20 transition-colors ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
