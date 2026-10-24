"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { sb, REGIONS, lastMonths, monthKey } from "../../lib/supabase";
import AeoPanel from "../../components/AeoPanel";

const TABS = [
  { k: "commercial", label: "Commercial", pill: "comm" },
  { k: "priority",   label: "Priority",   pill: "prio" },
  { k: "longtail",   label: "Long tail",  pill: "long" },
];
const RCOL = { IN: "#E8890C", US: "#4F46E5", ME: "#17935D", EU: "#8B5CF6" };

export default function Dashboard() {
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [acc, setAcc] = useState(null);
  const [rows, setRows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [region, setRegion] = useState("IN");
  const [tab, setTab] = useState("commercial");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("rank");
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queuing, setQueuing] = useState(false);
  const [msg, setMsg] = useState("");

  const months = useMemo(() => lastMonths(6), []);
  const now = monthKey();
  const prev = months[months.length - 2]?.k;

  const load = useCallback(async () => {
    const { data: s } = await sb().auth.getSession();
    if (!s.session) return router.replace("/login");
    const [{ data: sites }, { data: a }] = await Promise.all([
      sb().from("sites").select("*").limit(1),
      sb().from("accounts").select("*").single(),
    ]);
    if (!sites?.length) return router.replace("/onboarding");
    const st = sites[0];
    setSite(st); setAcc(a);
    setRegion(r => st.regions.includes(r) ? r : st.regions[0]);
    const [{ data: grid }, { data: r }] = await Promise.all([
      sb().from("keyword_grid").select("*").eq("site_id", st.id),
      sb().from("runs").select("*").eq("site_id", st.id).order("month", { ascending: false }),
    ]);
    setRows(grid || []); setRuns(r || []); setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  /* poll while a scan is running so results stream in */
  const latest = runs[0];
  const active = latest && ["queued", "running"].includes(latest.status);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [active, load]);

  async function queueScan() {
    setQueuing(true); setMsg("");
    const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId: site.id }) });
    const j = await res.json();
    setQueuing(false);
    setMsg(j.error || "Scan queued — the worker picks it up within 20 minutes and results stream in as they land.");
    load();
  }

  /* ---- derived ---- */
  const val = (row, m, r) => { const v = row.cells?.[`${m}|${r}`]; return v === undefined ? null : v; };
  const latestVal = (row, r) => { for (let i = months.length - 1; i >= 0; i--) { const v = val(row, months[i].k, r); if (v !== null) return v; } return null; };

  const tabbed = useMemo(() => rows.filter(x => (x.tab || "commercial") === tab), [rows, tab]);
  const list = useMemo(() => {
    let r = tabbed;
    if (q) r = r.filter(x => x.phrase.includes(q.toLowerCase()));
    const key = x => { const v = latestVal(x, region); return v === null ? 998 : v === 0 ? 999 : v; };
    return [...r].sort((a, b) => sort === "rank" ? key(a) - key(b) : a.phrase.localeCompare(b.phrase));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabbed, q, sort, region, months]);

  const stats = useMemo(() => {
    const cur = rows.map(x => val(x, now, region)).filter(v => v !== null);
    const rk = cur.filter(v => v > 0);
    const pv = prev ? rows.map(x => val(x, prev, region)).filter(v => v > 0).length : null;
    const top3 = rk.filter(v => v <= 3).length;
    const pvTop3 = prev ? rows.map(x => val(x, prev, region)).filter(v => v > 0 && v <= 3).length : null;
    return { measured: cur.length, ranking: rk.length, top3, delta: pv === null ? null : rk.length - pv, d3: pvTop3 === null ? null : top3 - pvTop3 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, region, now, prev]);

  const eta = site ? Math.max(5, Math.round(rows.length * site.regions.length * 12 / 60)) : 0;

  const cell = v => {
    if (v === null) return <span className="pos na">·</span>;
    if (v === 0) return <span className="pos none">—</span>;
    return <span className={"pos " + (v <= 3 ? "top" : v <= 7 ? "mid" : "low")}>{v}</span>;
  };
  const Delta = ({ d }) => d === null || d === 0 ? null : <span className={"delta " + (d > 0 ? "up" : "down")}>{d > 0 ? "▲" : "▼"} {Math.abs(d)}</span>;

  if (loading) return <div className="center"><p style={{ color: "var(--ink-3)" }}>Loading…</p></div>;

  const trialLeft = acc?.plan === "trial" && acc.trial_ends_at ? Math.ceil((new Date(acc.trial_ends_at) - Date.now()) / 86400000) : null;
  const openRow = open ? rows.find(x => x.id === open) : null;

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <a className="brand" href="/dashboard"><div className="mark">R</div>RankPulse</a>
        <span style={{ color: "var(--ink-3)", fontSize: 13.5 }}>{site.domain}</span>
        <div className="spacer" />
        {active
          ? <span className="scanchip"><span className="pulse" />Scanning {latest.month} · ~{eta} min</span>
          : latest && <span className="scanchip done"><span className="pulse" />Last scan {latest.month}</span>}
        <a className="btn btn-ghost" href="/keywords">Keywords</a>
        <button className="btn btn-ghost" onClick={queueScan} disabled={queuing || active}>{queuing ? "Queuing…" : "Run scan now"}</button>
        <a className="btn btn-ghost" href="/billing">{acc?.plan === "trial" ? "Choose plan" : "Plan"}</a>
        <button className="btn btn-ghost" onClick={async () => { await sb().auth.signOut(); router.replace("/"); }}>Sign out</button>
      </div></nav>

      <div className="wrap" style={{ paddingBottom: 72 }}>
        {trialLeft !== null && (
          <div className="notice-bar"><span>⏱</span><div>
            <b>{trialLeft > 0 ? `${trialLeft} days left on your free trial.` : "Your free trial has ended."}</b>{" "}
            {trialLeft > 0 ? "Scans keep running until it ends." : "Scans are paused until you choose a plan — your data is safe."}{" "}
            <a href="/billing">See plans →</a>
          </div></div>
        )}
        {msg && <div className="notice-bar"><span>ⓘ</span><div>{msg}</div></div>}
        {active && (
          <div className="notice-bar"><span>⟳</span><div>
            <b>Scan {latest.status} for {latest.month}.</b> {rows.length} keywords × {site.regions.length} {site.regions.length === 1 ? "country" : "countries"} —
            roughly {eta} minutes. This page refreshes itself as results land.
          </div></div>
        )}
        {!rows.length && <div className="notice-bar"><span>ⓘ</span><div>No keywords yet. <a href="/keywords">Add some</a> to start tracking.</div></div>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <div className="seg">
            {site.regions.map(r => (
              <button key={r} className={r === region ? "on" : ""} onClick={() => setRegion(r)}>
                <span className="dot" style={{ background: RCOL[r] || "var(--accent)", marginRight: 7 }} />{REGIONS[r]?.name || r}
              </button>
            ))}
          </div>
        </div>

        <div className="kpis">
          <div className="kpi"><div className="l">Ranking in top 10</div><div className="v">{stats.ranking}<Delta d={stats.delta} /></div><div className="s">of {stats.measured} measured in {now}</div></div>
          <div className="kpi"><div className="l">Top 3</div><div className="v">{stats.top3}<Delta d={stats.d3} /></div><div className="s">the positions that get clicks</div></div>
          <div className="kpi"><div className="l">Keywords</div><div className="v">{rows.length}<span style={{ fontSize: 14, color: "var(--ink-3)", fontWeight: 500 }}> / {acc?.keyword_limit ?? "—"}</span></div><div className="s">tracked on your plan</div></div>
          <div className="kpi"><div className="l">Countries</div><div className="v">{site.regions.length}</div><div className="s">{site.regions.map(r => REGIONS[r]?.name.split(" ")[0]).join(" · ")}</div></div>
          <div className="kpi"><div className="l">Last scan</div><div className="v" style={{ fontSize: 19 }}>{latest ? latest.month : "—"}</div><div className="s">{latest ? <span className={"chip " + (latest.status === "done" ? "ok" : latest.status === "failed" ? "err" : "warn")}>{latest.status}</span> : "not run yet"}</div></div>
        </div>

        <div className="tabs">
          {TABS.map(t => <button key={t.k} className={"tab" + (t.k === tab ? " on" : "")} onClick={() => setTab(t.k)}>{t.label}<span className="cnt">{rows.filter(x => (x.tab || "commercial") === t.k).length}</span></button>)}
          <button className={"tab" + (tab === "aeo" ? " on" : "")} onClick={() => setTab("aeo")}>AI search<span className="cnt">AEO</span></button>
        </div>

        {tab === "aeo" ? (
          <AeoPanel site={site} acc={acc} rankingCount={stats.ranking} top3Count={stats.top3} keywordCount={rows.length} />
        ) : (<>
        <div className="toolbar">
          <div className="search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input placeholder="Search keywords…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "auto" }}>
            <option value="rank">Sort: best position</option>
            <option value="az">Sort: A–Z</option>
          </select>
        </div>

        <div className="tablewrap">
          <table>
            <thead><tr>
              <th>Keyword</th>
              {months.map(m => <th key={m.k} className="n" style={m.k === now ? { color: "var(--accent-ink)" } : {}}>{m.label}</th>)}
              <th className="n">Change</th>
            </tr></thead>
            <tbody>
              {list.map(row => {
                const a = prev ? val(row, prev, region) : null, b = val(row, now, region);
                const d = a !== null && b !== null && a > 0 && b > 0 ? a - b : null;
                return (
                  <tr key={row.id} className="kw" onClick={() => setOpen(row.id)}>
                    <td><div className="kwname">{row.phrase}</div>{row.grp && row.grp !== "General" && <div className="kwsub">{row.grp}</div>}</td>
                    {months.map(m => <td key={m.k} className="n">{cell(val(row, m.k, region))}</td>)}
                    <td className="n">{d === null ? (a === 0 && b > 0 ? <span className="delta up">new</span> : a > 0 && b === 0 ? <span className="delta down">lost</span> : <span className="pos na">·</span>) : <Delta d={d} />}</td>
                  </tr>
                );
              })}
              {!list.length && <tr><td colSpan={months.length + 2} style={{ padding: 28, textAlign: "center", color: "var(--ink-3)" }}>Nothing here yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 14, maxWidth: "90ch" }}>
          Number = position 1–10 · <b>—</b> = measured, not on page one · <b>·</b> = not measured that month. Page one only.
          Measured from a real IP in {REGIONS[region]?.name} with no cookies or search history — what a stranger sees, not what you see signed in.
          Click a keyword for every region and month.
        </p>
        </>)}
      </div>

      {/* ───── drawer ───── */}
      <div className={"scrim" + (openRow ? " on" : "")} onClick={() => setOpen(null)} />
      <aside className={"drawer" + (openRow ? " open" : "")} aria-hidden={!openRow}>
        {openRow && (() => {
          const cur = site.regions.map(r => ({ r, v: val(openRow, now, r) }));
          const top = openRow.cells ? null : null;
          return (
            <>
              <div className="dhead">
                <div>
                  <span className={"pill " + (TABS.find(t => t.k === (openRow.tab || "commercial"))?.pill)}>{TABS.find(t => t.k === (openRow.tab || "commercial"))?.label}</span>
                  <h2 style={{ marginTop: 8, fontSize: 18 }}>{openRow.phrase}</h2>
                  <div style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 3 }}>{openRow.grp || "General"}</div>
                </div>
                <button className="x" onClick={() => setOpen(null)}>✕</button>
              </div>
              <div className="dbody">
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-3)", fontWeight: 650, marginBottom: 8 }}>{now} — every country</div>
                <div className="rgrid">
                  {cur.map(({ r, v }) => (
                    <div key={r} className="rcell">
                      <div className="k"><span className="dot" style={{ background: RCOL[r] }} />{REGIONS[r]?.name}</div>
                      <div className="v" style={{ color: v > 0 ? (v <= 3 ? "var(--up)" : "var(--ink)") : "var(--ink-3)" }}>{v === null ? "·" : v === 0 ? "—" : v}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-3)", fontWeight: 650, margin: "22px 0 8px" }}>Position over time — {REGIONS[region]?.name}</div>
                <div className="spark">
                  {months.map(m => { const v = val(openRow, m.k, region); const h = v === null ? 3 : v === 0 ? 4 : (11 - v) * 10; return <span key={m.k} className={v === null || v === 0 ? "none" : ""} style={{ height: h + "%" }} title={`${m.label}: ${v === null ? "not measured" : v === 0 ? "not on page 1" : "#" + v}`} />; })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>{months.map(m => <span key={m.k}>{m.label}</span>)}</div>

                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-3)", fontWeight: 650, margin: "22px 0 8px" }}>Month × region</div>
                <div className="tablewrap" style={{ border: 0 }}>
                  <table className="mtable">
                    <thead><tr><th>Month</th>{site.regions.map(r => <th key={r} className="n">{r}</th>)}</tr></thead>
                    <tbody>
                      {months.map(m => (
                        <tr key={m.k}><td>{m.label}</td>{site.regions.map(r => <td key={r}>{cell(val(openRow, m.k, r))}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 18 }}>Positions are page one only and measured from a neutral in-country IP. A dot means that month was not measured for that region.</p>
              </div>
            </>
          );
        })()}
      </aside>
    </>
  );
}
