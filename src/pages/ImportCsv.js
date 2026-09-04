import { useMemo, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import PageShell from "../components/PageShell";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const tables = ["apostles", "videos", "playlists"];

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i], next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows[0].map((header) => header.toLowerCase().replace(/\s+/g, "_"));
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || null])));
}

function ImportCsv() {
  const [table, setTable] = useState("videos");
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const headers = useMemo(() => rows.length ? Object.keys(rows[0]) : [], [rows]);

  const handleFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name); setError(""); setStatus("");
    setRows(parseCsv(await file.text()));
  };
  const importRows = async () => {
    if (!rows.length) return;
    if (!isSupabaseConfigured || !supabase) { setError("Supabase is not configured."); return; }
    setStatus("Importing…"); setError("");
    const { error: insertError } = await supabase.from(table).insert(rows);
    if (insertError) { setError(insertError.message); setStatus(""); return; }
    setStatus(`${rows.length} rows imported into ${table}.`);
  };

  return <PageShell title="Import CSV" description="Bring existing apostles, videos, or playlists into your Supabase database.">
    <div className="csv-import-page">
      <div className="csv-import-card">
        <div className="csv-import-controls"><label>Import into<select value={table} onChange={(event) => setTable(event.target.value)}>{tables.map((name) => <option key={name}>{name}</option>)}</select></label><label className="csv-file-picker"><FileUp size={18} /><span>{fileName || "Choose CSV file"}</span><input type="file" accept=".csv,text/csv" onChange={handleFile} /></label></div>
        <div className="csv-drop"><UploadCloud size={28} /><strong>Drop your CSV here</strong><small>or choose a file above. The first row must contain column names.</small></div>
        {rows.length > 0 && <><div className="csv-preview-head"><strong>Preview</strong><span>{rows.length} rows • {headers.length} columns</span></div><div className="csv-table-wrap"><table><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.slice(0, 5).map((row, index) => <tr key={index}>{headers.map((header) => <td key={header}>{row[header] || "—"}</td>)}</tr>)}</tbody></table></div><button className="page-button" onClick={importRows}>Import {rows.length} rows</button></>}
        {status && <p className="csv-success">{status}</p>}{error && <p className="auth-error">{error}</p>}
      </div>
    </div>
  </PageShell>;
}

export default ImportCsv;
