"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { sb, REGIONS, lastMonths, monthKey } from "../../lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [rows, setRows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [region, setRegion] = useState("IN");
  const [loading, setLoading] = useState(true);
  const [queuing, setQueuing] = useState(false);
  const [msg, setMsg] = useState("");

  const months = useMemo(() => lastMonths(6), []);
  const now = monthKey();

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function load() {
    const { data: s } = await sb().auth.getSession();
    if (!s.session) return router.replace("/login");

    const { data: sites } = await sb().from("sites").select("*").limit(1);
    if (!sites || !sites.length) return router.replace("/onboarding");
    const st = sites[0];
    setSite(st);
    setRegion(st.regions[0] || "IN");

    const [{ data: grid }, { data: r }] = await Promise.all([
      sb().from("keyword_grid").select("*").eq("site_id", st.id),
      sb().from("runs").select("*").eq("site_id", st.id).order("month", { ascending: false }),
    ]);
    setRows((grid || []).sort((a, b) => a.phrase.localeCompare(b.phrase)));
    setRuns(r || []);
    setLoading(false);
  }

  async function queueScan() {
    setQueuing(true); setMsg("");
    const res = await fetch("/api/scan", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: site.id }),
    });
    const j = await res.json();
    setQueuing(false);
    setMsg(j.error ? j.error : "Scan queued — results usually land within 30 minutes.");
    load();
  }

  const cell = (row, m, r) => {
    const v = row.cells?.[`${m}|${r}`];
    if (v === undefined || v === null) return <span className="pos na">·</span>;
    if (v === 0) return <span className="pos none">—</span>;
    return <span className={"pos " + (v <= 3 ? "top" : v <= 7 ? "mid" : "low")}>{v}</span>;
  };

  const stats = useMemo(() => {
    const cur = rows.map(x => x.cells?.[`${now}|${region}`]).filter(v => v !== undefined && v !== null);
    const ranking = cur.filter(v => v > 0);
    const prev = months[months.length - 2]?.k;
    const prevRank = prev ? rows.map(x => x.cells?.[`${prev}|${region}`]).filter(v => v > 0).length : null;
    return {
      measured: cur.length,
      ranking: ranking.length,
      top3: ranking.filter(v => v <= 3).length,
      delta: prevRank === null ? null : ranking.length - prevRank,
    };
  }, [rows, region, now, months]);

  if (loading) return <div className="center"><p style={{ color: "var(--ink-3)" }}>Loading…</p></div>;

  const latestRun = runs[0];

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <div className="brand"><div className="mark">R</div>RankPulse</div>
        <span style={{ color: "var(--ink-3)", fontSize: 13.5 }}>{site.domain}</span>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={queueScan} disabled={queuing}>
          {queuing ? "Queuing…" : "Run scan now"}
        </button>
        <button className="btn btn-ghost" onClick={async () => { await sb().auth.signOut(); router.replace("/"); }}>
          Sign out
        </button>
      </div></nav>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 72 }}>
        {msg && <div className="note info" style={{ marginBottom: 16 }}>{msg}</div>}

        {latestRun && latestRun.status !== "done" && (
          <div className="note info" style={{ marginBottom: 16 }}>
            <b>Scan {latestRun.status}</b> for {latestRun.month}. Results appear here as they land —
            a full run across {site.regions.length} {site.regions.length === 1 ? "country" : "countries"} takes
            roughly {Math.max(10, site.regions.length * 8)} minutes.
          </div>
        )}

        {!rows.length && (
          <div className="note info" style={{ marginBottom: 16 }}>
            No keywords yet. <a href="/onboarding">Add some</a> to get started.
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="seg">
            {site.regions.map(r => (
              <button key={r} className={r === region ? "on" : ""} onClick={() => setRegion(r)}>
                {REGIONS[r]?.name || r}
              </button>
            ))}
          </div>
        </div>

        <div className="kpis">
          <div className="kpi">
            <div className="l">Ranking in top 10</div>
            <div className="v">
              {stats.ranking}
              {stats.delta !== null && stats.delta !== 0 && (
                <span className={"delta " + (stats.delta > 0 ? "up" : "down")}>
                  {stats.delta > 0 ? "▲" : "▼"} {Math.abs(stats.delta)}
                </span>
              )}
            </div>
            <div className="s">of {stats.measured} measured this month</div>
          </div>
          <div className="kpi"><div className="l">Top 3</div><div className="v">{stats.top3}</div><div className="s">the positions that get clicks</div></div>
          <div className="kpi"><div className="l">Keywords</div><div className="v">{rows.length}</div><div className="s">tracked in {REGIONS[region]?.name}</div></div>
          <div className="kpi"><div className="l">Last scan</div><div className="v" style={{ fontSize: 19 }}>{latestRun ? latestRun.month : "—"}</div>
            <div className="s">{latestRun ? <span className={"chip " + (latestRun.status === "done" ? "ok" : latestRun.status === "failed" ? "err" : "warn")}>{latestRun.status}</span> : "not run yet"}</div></div>
        </div>

        <div className="tablewrap">
          <table>
            <thead><tr>
              <th>Keyword</th>
              {months.map(m => <th key={m.k} className="n">{m.label}</th>)}
            </tr></thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 550 }}>{row.phrase}</td>
                  {months.map(m => <td key={m.k} className="n">{cell(row, m.k, region)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 14 }}>
          Number = position 1–10 · <b>—</b> = measured, not on page one · <b>·</b> = not measured that month.
          Page one only: position 11 and position 80 both mean nobody found you. Measured from a real IP
          in each country with no cookies or search history — what a stranger sees, not what you see signed in.
        </p>
      </div>
    </>
  );
}
