import * as XLSX from "xlsx";

export interface MotorRow {
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

const HEADER_MAP: Record<string, keyof MotorRow> = {
  "EMPRESA": "empresa",
  "Nº ORÇAMENTO": "num_orcamento",
  "ESCOPO": "escopo",
  "EQUIPAMENTO": "equipamento",
  "MODELO/CARCAÇA": "modelo_carcaca",
  "PROBLEMA APRESENTADO": "problema_apresentado",
  "CODIGO UTILIZADO": "codigo_utilizado",
  "POTÊNCIA": "potencia",
  "OC": "oc",
  "COD. P/ NF": "cod_nf",
  "PEDIDO": "pedido",
  "ORÇ. INICIAL": "orc_inicial",
  "VALOR FINAL": "valor_final",
  "SETOR": "setor",
  "SAIDA": "data_saida",
  "VOLTA": "data_volta",
};

function excelDateToISO(serial: number): string | null {
  if (!serial || serial < 1) return null;
  const epoch = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(epoch.getTime() + serial * 86400000);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseNumeric(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "number") return val;
  const str = String(val)
    .replace(/R\$\s*/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/\s/g, "")
    .replace(/INICIAL.*|COMPLEMENTAR.*/gi, "")
    .trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function toString(val: unknown): string | null {
  if (val === null || val === undefined || val === "") return null;
  return String(val).trim();
}

export interface ParseResult {
  rows: MotorRow[];
  totalRaw: number;
  skipped: number;
  warnings: string[];
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    defval: "",
  });

  const warnings: string[] = [];

  let headerRowIdx = -1;
  let colMap: Record<number, keyof MotorRow> = {};

  for (let i = 0; i < Math.min(10, raw.length); i++) {
    const row = raw[i] as string[];
    const matches: Record<number, keyof MotorRow> = {};
    let matchCount = 0;

    for (let j = 0; j < row.length; j++) {
      const cell = String(row[j] ?? "").trim();
      if (HEADER_MAP[cell]) {
        matches[j] = HEADER_MAP[cell];
        matchCount++;
      }
    }

    if (matchCount >= 5) {
      headerRowIdx = i;
      colMap = matches;
      break;
    }
  }

  if (headerRowIdx === -1) {
    throw new Error(
      "Cabeçalho não encontrado. A planilha precisa ter colunas como EMPRESA, ESCOPO, EQUIPAMENTO, etc."
    );
  }

  const headerRow = raw[headerRowIdx] as string[];
  const unmappedCols: number[] = [];
  for (let j = 0; j < headerRow.length; j++) {
    const cell = String(headerRow[j] ?? "").trim();
    if (cell && !colMap[j]) {
      unmappedCols.push(j);
    }
  }

  let obsIdx = 0;
  const obsKeys: (keyof MotorRow)[] = ["obs_1", "obs_2", "obs_3"];
  for (const j of unmappedCols) {
    if (obsIdx < 3) {
      colMap[j] = obsKeys[obsIdx];
      obsIdx++;
    }
  }

  const escopoCol = Object.entries(colMap).find(([, v]) => v === "escopo");
  if (!escopoCol) {
    throw new Error("Coluna ESCOPO não encontrada na planilha.");
  }

  const rows: MotorRow[] = [];
  let skipped = 0;

  for (let i = headerRowIdx + 1; i < raw.length; i++) {
    const rawRow = raw[i] as unknown[];

    const escopoVal = toString(rawRow[Number(escopoCol[0])]);
    if (!escopoVal) {
      skipped++;
      continue;
    }

    const row: MotorRow = {
      empresa: null,
      num_orcamento: null,
      escopo: escopoVal,
      equipamento: null,
      modelo_carcaca: null,
      problema_apresentado: null,
      codigo_utilizado: null,
      potencia: null,
      oc: null,
      cod_nf: null,
      pedido: null,
      orc_inicial: null,
      valor_final: null,
      setor: null,
      data_saida: null,
      data_volta: null,
      obs_1: null,
      obs_2: null,
      obs_3: null,
    };

    for (const [colStr, field] of Object.entries(colMap)) {
      const col = Number(colStr);
      const val = rawRow[col];

      if (field === "data_saida" || field === "data_volta") {
        if (typeof val === "number") {
          row[field] = excelDateToISO(val);
        } else {
          const str = toString(val);
          if (str && /^\d{4}-\d{2}-\d{2}$/.test(str)) {
            row[field] = str;
          } else {
            row[field] = null;
          }
        }
      } else if (field === "orc_inicial" || field === "valor_final") {
        row[field] = parseNumeric(val);
      } else if (field !== "escopo") {
        (row as unknown as Record<string, unknown>)[field] = toString(val);
      }
    }

    rows.push(row);
  }

  const mapped = Object.values(colMap);
  const expected: (keyof MotorRow)[] = [
    "empresa",
    "escopo",
    "equipamento",
    "potencia",
    "setor",
  ];
  for (const key of expected) {
    if (!mapped.includes(key)) {
      warnings.push(`Coluna "${key}" não encontrada no cabeçalho.`);
    }
  }

  return {
    rows,
    totalRaw: raw.length - headerRowIdx - 1,
    skipped,
    warnings,
  };
}
