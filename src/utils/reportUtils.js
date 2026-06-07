/**
 * reportUtils — Generación de reportes de donaciones SIN dependencias externas.
 *
 *   - CSV   → Blob text/csv con BOM (Excel respeta acentos). Descarga directa.
 *   - Excel → Tabla HTML con MIME application/vnd.ms-excel y extensión .xls.
 *             Excel y LibreOffice la abren como hoja de cálculo real.
 *   - PDF   → Ventana imprimible; el usuario elige "Guardar como PDF" en el
 *             diálogo de impresión del navegador. Cero librerías.
 *
 * Todas reciben el mismo arreglo de donaciones (objetos con las claves de
 * COLUMNS) para que el reporte sea idéntico en los tres formatos.
 */

// Columnas que se exportan, en orden. label = encabezado visible, key = campo.
export const REPORT_COLUMNS = [
  { key: "id",           label: "Donación" },
  { key: "tipo",         label: "Tipo" },
  { key: "beneficiario", label: "Beneficiario" },
  { key: "estado",       label: "Estado" },
  { key: "donante",      label: "Donante" },
  { key: "fecha",        label: "Fecha" },
  { key: "description",  label: "Descripción" },
];

// ─── Helpers internos ─────────────────────────────────────────────────────────

const cell = (row, key) => {
  const v = row[key];
  return v === null || v === undefined ? "" : String(v);
};

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Marca de tiempo legible para los nombres de archivo: 2026-06-06_14-05
const stamp = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}`;
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const buildTableHtml = (rows) => {
  const head = REPORT_COLUMNS.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${REPORT_COLUMNS.map((c) => `<td>${escapeHtml(cell(r, c.key))}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
};

// ─── CSV ──────────────────────────────────────────────────────────────────────

export const exportCSV = (rows, baseName = "reporte_donaciones") => {
  const esc = (val) => `"${val.replace(/"/g, '""')}"`; // envuelve y duplica comillas
  const header = REPORT_COLUMNS.map((c) => esc(c.label)).join(",");
  const lines = rows.map((r) => REPORT_COLUMNS.map((c) => esc(cell(r, c.key))).join(","));
  const csv = "﻿" + [header, ...lines].join("\r\n"); // BOM = acentos OK en Excel
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${baseName}_${stamp()}.csv`);
};

// ─── Excel (.xls vía HTML) ─────────────────────────────────────────────────────

export const exportExcel = (rows, baseName = "reporte_donaciones") => {
  const html =
    `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
    `<head><meta charset="utf-8" /><style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:4px 8px;font-family:Calibri,Arial,sans-serif;font-size:11pt}th{background:#1a9e96;color:#fff}</style></head>` +
    `<body>${buildTableHtml(rows)}</body></html>`;
  triggerDownload(
    new Blob(["﻿" + html], { type: "application/vnd.ms-excel;charset=utf-8;" }),
    `${baseName}_${stamp()}.xls`
  );
};

// ─── PDF (impresión del navegador) ─────────────────────────────────────────────

export const exportPDF = (rows, title = "Reporte de Donaciones") => {
  const win = window.open("", "_blank");
  if (!win) {
    alert("El navegador bloqueó la ventana de impresión. Permití las ventanas emergentes para generar el PDF.");
    return;
  }
  const generado = new Date().toLocaleString("es-CR");
  win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <style>
      *{box-sizing:border-box}
      body{font-family:Arial,Helvetica,sans-serif;color:#1e293b;margin:32px}
      h1{color:#157a73;font-size:20px;margin:0 0 4px}
      .meta{color:#64748b;font-size:12px;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;font-size:11px}
      th,td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;vertical-align:top}
      th{background:#1a9e96;color:#fff;font-size:11px}
      tr:nth-child(even) td{background:#f8fafc}
      @media print{.no-print{display:none}}
      .btn{background:#1a9e96;color:#fff;border:none;padding:8px 18px;border-radius:6px;font-size:14px;cursor:pointer;margin-bottom:16px}
    </style></head><body>
    <button class="btn no-print" onclick="window.print()">Imprimir / Guardar como PDF</button>
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">SISTRA-TEC · Generado el ${escapeHtml(generado)} · ${rows.length} registro${rows.length !== 1 ? "s" : ""}</div>
    ${buildTableHtml(rows)}
    </body></html>`);
  win.document.close();
  win.focus();
  // Abrimos el diálogo de impresión desde la ventana padre (sin <script> inline).
  setTimeout(() => { try { win.print(); } catch (_) { /* el usuario puede usar el botón */ } }, 400);
};

// ─── Despachador por formato ───────────────────────────────────────────────────

export const generateReport = (formato, rows) => {
  switch (formato) {
    case "CSV":
      return exportCSV(rows);
    case "Excel":
      return exportExcel(rows);
    case "PDF":
      return exportPDF(rows);
    default:
      return exportCSV(rows);
  }
};
