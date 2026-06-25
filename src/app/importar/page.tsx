"use client";

import { useState, useCallback, useRef } from "react";
import { parseExcel, type MotorRow, type ParseResult } from "@/lib/parse-excel";
import { supabase } from "@/lib/supabase";

type Stage = "idle" | "preview" | "importing" | "done" | "error";

export default function ImportarPage() {
  const [stage, setStage] = useState<Stage>("idle");
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setFileName(file.name);
    setDragging(false);

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      setError("Formato inválido. Use um arquivo .xlsx");
      setStage("error");
      return;
    }

    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseExcel(buffer);
      setResult(parsed);
      setStage("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ler planilha");
      setStage("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleImport = useCallback(async () => {
    if (!result) return;

    setStage("importing");
    setError("");

    try {
      const batchSize = 500;
      const batches: MotorRow[][] = [];
      for (let i = 0; i < result.rows.length; i += batchSize) {
        batches.push(result.rows.slice(i, i + batchSize));
      }

      if (batches.length === 1) {
        const { error: rpcError } = await supabase.rpc("replace_motores", {
          dados: result.rows,
        });
        if (rpcError) throw rpcError;
      } else {
        const { error: truncErr } = await supabase
          .from("motores")
          .delete()
          .neq("id", 0);
        if (truncErr) throw truncErr;

        for (const batch of batches) {
          const { error: insertErr } = await supabase
            .from("motores")
            .insert(batch as unknown as Record<string, unknown>[]);
          if (insertErr) throw insertErr;
        }
      }

      setImportedCount(result.rows.length);
      setStage("done");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: string }).message)
          : "Erro ao importar";
      setError(msg);
      setStage("error");
    }
  }, [result]);

  const reset = () => {
    setStage("idle");
    setResult(null);
    setFileName("");
    setError("");
    setImportedCount(0);
    setDragging(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg font-medium text-zinc-200">Importar planilha</h2>
        <p className="text-xs text-zinc-600 mt-1">
          Upload do arquivo .xlsx para substituir todos os dados no banco
        </p>
      </div>

      {/* Upload zone */}
      {(stage === "idle" || stage === "error") && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`border border-dashed rounded-lg p-10 sm:p-12 text-center cursor-pointer transition-all group ${
            dragging
              ? "border-amber-500/50 bg-amber-500/[0.03]"
              : "border-zinc-800 hover:border-zinc-600"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <div className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              dragging ? "bg-amber-900/30" : "bg-zinc-900 group-hover:bg-zinc-800"
            }`}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className={dragging ? "text-amber-500" : "text-zinc-500"}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-zinc-400">
                {dragging ? (
                  <span className="text-amber-400">Solte o arquivo aqui</span>
                ) : (
                  <>
                    Arraste o <span className="text-amber-500/80 font-mono text-xs">.xlsx</span> aqui ou clique para selecionar
                  </>
                )}
              </p>
              <p className="text-[10px] text-zinc-700 mt-1.5">
                Colunas esperadas: EMPRESA, ESCOPO, EQUIPAMENTO, POTÊNCIA, SETOR, SAIDA, VOLTA
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {stage === "error" && error && (
        <div className="mt-4 bg-red-950/30 border border-red-900/40 rounded-lg px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={reset}
            className="text-xs text-red-500/70 hover:text-red-400 mt-2 underline underline-offset-2 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Preview */}
      {stage === "preview" && result && (
        <div className="space-y-5">
          {/* Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 bg-zinc-900/60 rounded-md px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500/70">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="text-xs text-zinc-400 font-mono truncate">{fileName}</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-zinc-500">
                <span className="text-zinc-200 font-mono font-medium">{result.rows.length}</span>{" "}
                registros válidos
              </span>
              {result.skipped > 0 && (
                <span className="text-zinc-600">{result.skipped} linhas vazias ignoradas</span>
              )}
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg px-4 py-3">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-500/80">! {w}</p>
              ))}
            </div>
          )}

          {/* Preview table */}
          <div className="bg-[#141519] rounded-lg border border-zinc-800/50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800/40 flex items-center justify-between">
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">
                Prévia dos dados
              </span>
              <span className="text-[10px] text-zinc-700 font-mono">
                Primeiros 10 de {result.rows.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-800/40">
                    {["Escopo", "Equipamento", "Empresa", "Pot.", "Setor", "Saída", "Volta", "Valor"].map((h) => (
                      <th key={h} className={`px-3 py-2 text-left text-[9px] font-medium text-zinc-600 uppercase tracking-wider ${h === "Valor" ? "text-right" : ""}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-zinc-800/20 last:border-0">
                      <td className="px-3 py-2 font-mono font-medium text-amber-500/80">{row.escopo}</td>
                      <td className="px-3 py-2 text-zinc-400 max-w-[180px] truncate">{row.equipamento || "—"}</td>
                      <td className="px-3 py-2 text-zinc-500">{row.empresa || "—"}</td>
                      <td className="px-3 py-2 font-mono text-zinc-500">{row.potencia || "—"}</td>
                      <td className="px-3 py-2 text-zinc-500 max-w-[140px] truncate">{row.setor || "—"}</td>
                      <td className="px-3 py-2 font-mono text-zinc-600">{row.data_saida || "—"}</td>
                      <td className="px-3 py-2 font-mono text-zinc-600">{row.data_volta || "—"}</td>
                      <td className="px-3 py-2 font-mono text-zinc-400 text-right">
                        {row.valor_final
                          ? row.valor_final.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <button
              onClick={reset}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
              <p className="text-[10px] text-zinc-700 sm:max-w-xs sm:text-right">
                Isso vai substituir todos os{" "}
                <span className="text-red-400/70">dados atuais</span> no banco
                por {result.rows.length} novos registros.
              </p>
              <button
                onClick={handleImport}
                className="bg-amber-600/90 hover:bg-amber-600 text-[#0B0C10] text-xs font-medium px-5 py-2.5 rounded-md transition-colors w-full sm:w-auto whitespace-nowrap"
              >
                Confirmar importação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Importing */}
      {stage === "importing" && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 border-2 border-amber-600/40 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-zinc-500">Importando {result?.rows.length} registros...</p>
        </div>
      )}

      {/* Done */}
      {stage === "done" && (
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-5 sm:px-6 py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm text-emerald-300 font-medium">
            {importedCount} motores importados
          </p>
          <p className="text-xs text-zinc-600 mt-1.5">
            Os dados anteriores foram substituídos com sucesso.
          </p>
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={reset}
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              Importar outro
            </button>
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-amber-500/80 hover:text-amber-400 transition-colors"
            >
              Ver painel
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
