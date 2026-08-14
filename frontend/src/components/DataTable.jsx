const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });
export default function DataTable({ rows }) {
  if (!rows.length) return <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">No data is available in this snapshot.</div>;
  const columns = Object.keys(rows[0]).filter((key) => !["password_hash", "created_at", "updated_at"].includes(key) && key !== "id" && !key.endsWith("_id"));
  return <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>{columns.map((key) => <th className="px-4 py-3" key={key}>{key.replaceAll("_", " ")}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row, index) => <tr className="hover:bg-slate-50" key={`${row.id}-${index}`}>{columns.map((key) => <td className="whitespace-nowrap px-4 py-3" key={key}>{["brokerage", "incentive"].includes(key) ? money.format(Number(row[key] || 0)) : String(row[key] ?? "—")}</td>)}</tr>)}</tbody></table></div>;
}
