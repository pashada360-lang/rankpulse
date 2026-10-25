"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { sb, REGIONS, monthKey } from "../../lib/supabase";
import { PLANS } from "../../lib/plans";
import { ENGINE_LABELS, ENGINE_ORDER, STAGES } from "../../lib/ai-prompts";
import AeoPanel from "../../components/AeoPanel";

const TABS = [{ k: "commercial", label: "Commercial", pill: "comm" }, { k: "priority", label: "Priority", pill: "prio" }, { k: "longtail", label: "Long tail", pill: "long" }];
const RCOL = { IN: "#E8890C", US: "#4F46E5", ME: "#17935D", EU: "#8B5CF6" };
const lbl = k => { const [y, m] = k.split("-"); return new Date(+y, +m - 1, 1).toLocaleString("en", { month: "short" }) + "-" + y.slice(2); };
const monthsBetween = (a, b) => { const out = []; let [y, m] = a.split("-").map(Number); const [by, bm] = b.split("-").map(Number); while (y < by || (y === by && m <= bm)) { out.push(`${y}-${String(m).padStart(2, "0")}`); m++; if (m > 12) { m = 1; y++; } } return out; };

export default function Dashboard() {
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [acc, setAcc] = useState(null);
  const [rows, setRows] = useState([]);
  const [runs, setRuns] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [cites, setCites] = useState([]);
  const [opps, setOpps] = useState([]);
  const [siteMonths, setSiteMonths] = useState([]);
  const [region, setRegion] = useState("IN");
  const [view, setView] = useState("keywords");        // keywords | ai | opps
  const [tab, setTab] = useState("commercial");
  const [aiMode, setAiMode] = useState("measure");
  const [engine, setEngine] = useState("chatgpt");
  const [oppCls, setOppCls] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queuing, setQueuing] = useState(false);
  const [msg, setMsg] = useState("");

  const now = monthKey();

  const load = useCallback(async () => {
    const { data: s } = await sb().auth.getSession();
    if (!s.session) return router.replace("/login");
    const [{ data: sites }, { data: a }] = await Promise.all([sb().from("sites").select("*").limit(1), sb().from("accounts").select("*").single()]);
    if (!sites?.length) return router.replace("/onboarding");
    const st = sites[0]; setSite(st); setAcc(a);
    setRegion(r => st.regions.includes(r) ? r : st.regions[0]);
    const [g, r, p, c, o, m] = await Promise.all([
      sb().from("keyword_grid").select("*").eq("site_id", st.id),
      sb().from("runs").select("*").eq("site_id", st.id).order("month", { ascending: false }),
      sb().from("ai_prompts").select("*").eq("site_id", st.id),
      sb().from("ai_citations").select("*").eq("site_id", st.id),
      sb().from("opportunities").select("*").eq("site_id", st.id).order("score", { ascending: false }),
      sb().from("site_months").select("month").eq("site_id", st.id),
    ]);
    setRows(g.data || []); setRuns(r.data || []); setPrompts(p.data || []); setCites(c.data || []); setOpps(o.data || []);
    setSiteMonths([...new Set((m.data || []).map(x => x.month))].sort());
    setLoading(false);
  }, [router]);
  useEffect(() => { load(); }, [load]);

  const latest = runs[0];
  const active = latest && ["queued", "running"].includes(latest.status);
  useEffect(() => { if (!active) return; const t = setInterval(load, 20000); return () => clearInterval(t); }, [active, load]);

  /* months: from the first month this site has data (signup month) through today, one column each */
  const months = useMemo(() => {
    const first = siteMonths[0] || (site?.created_at ? monthKey(new Date(site.created_at)) : now);
    return monthsBetween(first <= now ? first : now, now);
  }, [siteMonths, site, now]);
  const cur = months[months.length - 1], prev = months[months.length - 2];

  async function queueScan() {
    setQueuing(true); setMsg("");
    const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ siteId: site.id }) });
    const j = await res.json(); setQueuing(false);
    setMsg(j.error || "Scan queued — the worker picks it up within 20 minutes and results stream in as they land."); load();
  }

  /* ───── keyword helpers ───── */
  const val = (row, m, r) => { const v = row.cells?.[`${m}|${r}`]; return v === undefined ? null : v; };
  const latestVal = (row, r) => { for (let i = months.length - 1; i >= 0; i--) { const v = val(row, months[i], r); if (v !== null) return v; } return null; };
  const cell = v => v === null ? <span className="pos na">·</span> : v === 0 ? <span className="pos none">—</span> : <span className={"pos " + (v <= 3 ? "top" : v <= 7 ? "mid" : "low")}>{v}</span>;
  const Delta = ({ d }) => d === null || d === undefined || d === 0 ? null : <span className={"delta " + (d > 0 ? "up" : "down")}>{d > 0 ? "▲" : "▼"} {Math.abs(d)}</span>;

  const stats = useMemo(() => {
    const curV = rows.map(x => val(x, cur, region)).filter(v => v !== null);
    const rk = curV.filter(v => v > 0);
    const pvRows = prev ? rows.map(x => val(x, prev, region)) : [];
    const pv = prev ? pvRows.filter(v => v > 0).length : null;
    const pv3 = prev ? pvRows.filter(v => v > 0 && v <= 3).length : null;
    const top3 = rk.filter(v => v <= 3).length;
    return { measured: curV.length, ranking: rk.length, top3, avg: rk.length ? (rk.reduce((a, b) => a + b, 0) / rk.length).toFixed(1) : "—", delta: pv === null ? null : rk.length - pv, d3: pv3 === null ? null : top3 - pv3,
      up: prev ? rows.filter(x => { const a = val(x, prev, region), b = val(x, cur, region); return a > 0 && b > 0 && b < a; }).length : 0,
      down: prev ? rows.filter(x => { const a = val(x, prev, region), b = val(x, cur, region); return a > 0 && b > 0 && b > a; }).length : 0,
      gained: prev ? rows.filter(x => val(x, prev, region) === 0 && val(x, cur, region) > 0).length : 0,
      lost: prev ? rows.filter(x => val(x, prev, region) > 0 && val(x, cur, region) === 0).length : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, region, cur, prev]);

  const list = useMemo(() => {
    let r = rows.filter(x => (x.tab || "commercial") === tab);
    if (q) r = r.filter(x => x.phrase.includes(q.toLowerCase()));
    const key = x => { const v = latestVal(x, region); return v === null ? 998 : v === 0 ? 999 : v; };
    return [...r].sort((a, b) => key(a) - key(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, tab, q, region, months]);

  /* ───── AI helpers ───── */
  const aiMonth = useMemo(() => { const ms = [...new Set(cites.map(c => c.month))].sort(); return ms[ms.length - 1]; }, [cites]);
  const aiRows = useMemo(() => cites.filter(c => c.month === aiMonth), [cites, aiMonth]);
  const engineStats = e => {
    const r = aiRows.filter(c => c.engine === e); const a = r.filter(c => c.answered); const cited = a.filter(c => c.cited);
    const tally = {}; a.forEach(c => { if (c.cited) tally[site.domain] = (tally[site.domain] || 0) + 1; (c.comps || []).forEach(d => tally[d] = (tally[d] || 0) + 1); });
    const total = Object.values(tally).reduce((x, y) => x + y, 0);
    return { rows: r, a, cited, named: a.filter(c => c.mention), first: cited.filter(c => c.src_rank === 1).length, sov: Object.entries(tally).sort((x, y) => y[1] - x[1]).slice(0, 10), total, share: total ? (tally[site.domain] || 0) / total * 100 : 0, pct: a.length ? cited.length / a.length * 100 : 0 };
  };
  const enginesPresent = ENGINE_ORDER.filter(e => aiRows.some(c => c.engine === e));
  const hasAeo = !!PLANS[acc?.plan]?.aeo || acc?.plan === "trial";
  const promptById = Object.fromEntries(prompts.map(p => [p.id, p]));
  const orgPosOf = pid => { const g = aiRows.find(c => c.engine === "google" && c.prompt_id === pid); return g?.org_pos ?? null; };

  /* ───── opportunities helpers ───── */
  const oppList = opps.filter(o => oppCls === "All" || o.cls === oppCls);
  const oppTally = (() => { const t = {}; opps.forEach(o => (o.top_domains || []).forEach(d => { if (!d.includes(site?.domain)) t[d] = (t[d] || 0) + 1; })); return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 10); })();

  if (loading) return <div className="center"><p style={{ color: "var(--ink-3)" }}>Loading…</p></div>;

  const eta = Math.max(5, Math.round(rows.length * site.regions.length * 12 / 60));
  const trialLeft = acc?.plan === "trial" && acc.trial_ends_at ? Math.ceil((new Date(acc.trial_ends_at) - Date.now()) / 86400000) : null;
  const openRow = open ? rows.find(x => x.id === open) : null;
  const bars = (items, total, hi) => items.map(([d, n]) => { const max = items[0]?.[1] || 1; const me = hi(d); return <div key={d} className="sovrow"><div className={"sovname" + (me ? " me" : "")}>{me ? "★ " : ""}{d}</div><div className="sovbar"><span style={{ width: (n / max * 100).toFixed(1) + "%", background: me ? "var(--accent)" : "var(--rule-2)" }} /></div><div className="sovval">{n}<span className="sovpct">{total ? Math.round(n / total * 100) : 0}%</span></div></div>; });

  /* narrative banner, generated from the numbers */
  const banner = (() => {
    if (!latest) return <>No scan yet. <b>Run scan now</b> to take your first reading — results land within about {eta} minutes.</>;
    if (!prev) return <><b>{lbl(cur)} is your baseline.</b> {stats.ranking} of {stats.measured} keywords measured are on page one in {REGIONS[region]?.name}, {stats.top3} in the top three. From next month this banner reports what moved.</>;
    const dir = stats.delta > 0 ? "up" : stats.delta < 0 ? "down" : "flat";
    return <><b>{lbl(cur)} vs {lbl(prev)} in {REGIONS[region]?.name}: {stats.ranking} on page one ({dir === "flat" ? "unchanged" : (stats.delta > 0 ? "+" : "") + stats.delta}), {stats.top3} in the top three ({stats.d3 > 0 ? "+" : ""}{stats.d3 || 0}).</b> {stats.up} keywords improved, {stats.down} slipped, {stats.gained} newly on page one, {stats.lost} fell off. {stats.lost > stats.gained + 3 ? "Losses outnumber gains — open the Opportunities tab to see who took the spots and which pages to build." : stats.up + stats.gained > stats.down + stats.lost ? "A good month. Defend the top-three positions with a content refresh before competitors react." : "A quiet month. Movement usually follows published pages by four to eight weeks."} Measured from a real IP in {REGIONS[region]?.name}, no cookies, no history.</>;
  })();

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <a className="brand" href="/dashboard"><div className="mark">R</div>RankPulse</a>
        <span style={{ color: "var(--ink-3)", fontSize: 13.5 }}>{site.domain}</span>
        <div className="spacer" />
        {active ? <span className="scanchip"><span className="pulse" />Scanning {lbl(latest.month)} · ~{eta} min</span> : latest && <span className="scanchip done"><span className="pulse" />Last scan {lbl(latest.month)}</span>}
        <a className="btn btn-ghost" href="/keywords">Keywords</a>
        <button className="btn btn-ghost" onClick={queueScan} disabled={queuing || active}>{queuing ? "Queuing…" : "Run scan now"}</button>
        <a className="btn btn-ghost" href="/billing">{acc?.plan === "trial" ? "Choose plan" : PLANS[acc?.plan]?.name || "Plan"}</a>
        <button className="btn btn-ghost" onClick={async () => { await sb().auth.signOut(); router.replace("/"); }}>Sign out</button>
      </div></nav>

      <div className="wrap" style={{ paddingBottom: 72 }}>
        <div className="notice-bar"><span>ⓘ</span><div>{banner} Legend: number = position 1–10 · <b>—</b> = not in top 10 · <b>·</b> = not measured.</div></div>
        {trialLeft !== null && <div className="notice-bar" style={{ marginTop: 10 }}><span>⏱</span><div><b>{trialLeft > 0 ? `${trialLeft} days left on your free trial.` : "Your free trial has ended."}</b> {trialLeft > 0 ? "Everything runs until it ends." : "Scans are paused until you choose a plan — your data is safe."} <a href="/billing">See plans →</a></div></div>}
        {msg && <div className="notice-bar" style={{ marginTop: 10 }}><span>ⓘ</span><div>{msg}</div></div>}
        {active && <div className="notice-bar" style={{ marginTop: 10 }}><span>⟳</span><div><b>Scan {latest.status} for {lbl(latest.month)}.</b> {rows.length} keywords × {site.regions.length} countries{hasAeo ? `, then ${prompts.length} AI questions` : ""} — this page refreshes itself as results land.</div></div>}

        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
          <div className="seg">{site.regions.map(r => <button key={r} className={r === region ? "on" : ""} onClick={() => setRegion(r)}><span className="dot" style={{ background: RCOL[r] || "var(--accent)", marginRight: 7 }} />{REGIONS[r]?.name || r}</button>)}</div>
        </div>

        <div className="kpis">
          <div className="kpi"><div className="l">Keywords tracked</div><div className="v">{rows.length}</div><div className="s">{REGIONS[region]?.name} · {acc?.keyword_limit} on plan</div></div>
          <div className="kpi"><div className="l">Ranking · page one</div><div className="v" style={{ color: "var(--up)" }}>{stats.ranking}<Delta d={stats.delta} /></div><div className="s">{stats.measured ? Math.round(stats.ranking / stats.measured * 100) : 0}% of {stats.measured} measured</div></div>
          <div className="kpi"><div className="l">Top 3</div><div className="v" style={{ color: "var(--up)" }}>{stats.top3}<Delta d={stats.d3} /></div><div className="s">the positions that get clicks</div></div>
          <div className="kpi"><div className="l">Avg position</div><div className="v">{stats.avg}</div><div className="s">where ranking</div></div>
          {hasAeo && enginesPresent.length > 0 && <div className="kpi"><div className="l">AI citation rate</div><div className="v" style={{ color: "var(--accent-ink)" }}>{Math.round(engineStats(enginesPresent[0]).pct)}%</div><div className="s">{ENGINE_LABELS[enginesPresent[0]]} · {lbl(aiMonth)}</div></div>}
        </div>

        <div className="tabs">
          <button className={"tab" + (view === "keywords" ? " on" : "")} onClick={() => setView("keywords")}>Keywords<span className="cnt">{rows.length}</span></button>
          <button className={"tab" + (view === "ai" ? " on" : "")} onClick={() => setView("ai")}>AI answers<span className="cnt">{enginesPresent.length ? enginesPresent.length + " engines" : hasAeo ? "pending" : "Growth"}</span></button>
          <button className={"tab" + (view === "opps" ? " on" : "")} onClick={() => setView("opps")}>Opportunities<span className="cnt">{opps.length ? opps.length + " new" : "pending"}</span></button>
        </div>

        {/* ════════ KEYWORDS ════════ */}
        {view === "keywords" && (<>
          <div className="toolbar">
            <div className="seg">{TABS.map(t => <button key={t.k} className={t.k === tab ? "on" : ""} onClick={() => setTab(t.k)}>{t.label} <span style={{ opacity: .6 }}>{rows.filter(x => (x.tab || "commercial") === t.k).length}</span></button>)}</div>
            <div className="search"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg><input placeholder="Search keywords…" value={q} onChange={e => setQ(e.target.value)} /></div>
          </div>
          <div className="tablewrap"><table>
            <thead><tr><th>Keyword</th>{months.map(m => <th key={m} className="n" style={m === cur ? { color: "var(--accent-ink)" } : {}}>{lbl(m)}</th>)}<th className="n">Change</th><th>Status</th><th>Intent</th></tr></thead>
            <tbody>
              {list.map(row => {
                const a = prev ? val(row, prev, region) : null, b = val(row, cur, region);
                const d = a !== null && b !== null && a > 0 && b > 0 ? a - b : null;
                const lv = latestVal(row, region);
                return (<tr key={row.id} className="kw" onClick={() => setOpen(row.id)}>
                  <td><div className="kwname">{row.phrase}</div>{row.grp && row.grp !== "General" && <div className="kwsub">{row.grp}</div>}</td>
                  {months.map(m => <td key={m} className="n">{cell(val(row, m, region))}</td>)}
                  <td className="n">{d !== null ? <Delta d={d} /> : a === 0 && b > 0 ? <span className="delta up">new</span> : a > 0 && b === 0 ? <span className="delta down">lost</span> : <span className="pos na">·</span>}</td>
                  <td>{lv === null ? <span className="chip" style={{ background: "var(--paper-3)", color: "var(--ink-3)" }}>Pending</span> : lv > 0 ? <span className="chip ok">Present</span> : <span className="chip err">Absent</span>}</td>
                  <td><span className={"pill " + (TABS.find(t => t.k === (row.tab || "commercial"))?.pill)}>{TABS.find(t => t.k === (row.tab || "commercial"))?.label}</span></td>
                </tr>);
              })}
              {!list.length && <tr><td colSpan={months.length + 4} style={{ padding: 28, textAlign: "center", color: "var(--ink-3)" }}>No keywords in this group. <a href="/keywords">Add some →</a></td></tr>}
            </tbody></table></div>
          <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 14, maxWidth: "90ch" }}>Columns start at the month you joined and a new one is added every month. Click a keyword for every region and month.</p>
        </>)}

        {/* ════════ AI ANSWERS ════════ */}
        {view === "ai" && (<>
          <div className="toolbar"><div className="seg"><button className={aiMode === "measure" ? "on" : ""} onClick={() => setAiMode("measure")}>Measure — where you stand</button><button className={aiMode === "improve" ? "on" : ""} onClick={() => setAiMode("improve")}>Improve — what to fix</button></div></div>
          {aiMode === "improve" && <AeoPanel site={site} acc={acc} rankingCount={stats.ranking} top3Count={stats.top3} keywordCount={rows.length} />}
          {aiMode === "measure" && !hasAeo && <div className="card pad" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center" }}><div><div style={{ fontWeight: 700 }}>See whether ChatGPT, Perplexity, Gemini, Claude and Google AI cite you.</div><div style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 4 }}>Real buyer questions by funnel stage, five engines, a fix list ranked by payoff. On Growth and above.</div></div><a className="btn btn-primary" href="/billing">Upgrade</a></div>}
          {aiMode === "measure" && hasAeo && !enginesPresent.length && <div className="notice-bar"><span>🤖</span><div><b>No AI results yet.</b> {prompts.length ? `${prompts.length} buyer questions are ready — they run with your next scan.` : <>Add buyer questions under <a href="/keywords#ai">Keywords → AI questions</a>, then run a scan.</>}</div></div>}
          {aiMode === "measure" && hasAeo && enginesPresent.length > 0 && (() => {
            const e = enginesPresent.includes(engine) ? engine : enginesPresent[0];
            const S = engineStats(e);
            const st = {}; S.a.forEach(c => { const k = promptById[c.prompt_id]?.stage || "Other"; st[k] = st[k] || { n: 0, c: 0 }; st[k].n++; if (c.cited) st[k].c++; });
            const gap = S.a.filter(c => !c.cited && orgPosOf(c.prompt_id) > 0).sort((a, b) => orgPosOf(a.prompt_id) - orgPosOf(b.prompt_id));
            return (<>
              <div className="toolbar" style={{ marginTop: 0 }}><div className="seg">{enginesPresent.map(x => <button key={x} className={x === e ? "on" : ""} onClick={() => setEngine(x)}>{ENGINE_LABELS[x]}</button>)}</div><span style={{ color: "var(--ink-3)", fontSize: 13 }}>{lbl(aiMonth)}</span></div>
              <div className="kpis">
                <div className="kpi"><div className="l">Questions tracked</div><div className="v">{S.rows.length}</div><div className="s">{S.a.length} produced an AI answer</div></div>
                <div className="kpi"><div className="l">Citation rate</div><div className="v" style={{ color: "var(--up)" }}>{Math.round(S.pct)}%</div><div className="s">{S.cited.length} of {S.a.length} answers cite you</div></div>
                <div className="kpi"><div className="l">Share of voice</div><div className="v" style={{ color: "var(--accent-ink)" }}>{S.share.toFixed(0)}%</div><div className="s">of all citations in this engine</div></div>
                <div className="kpi"><div className="l">Named in answer</div><div className="v">{S.named.length}</div><div className="s">{S.first} answers cite you first</div></div>
              </div>
              <div className="card pad"><h2 style={{ fontSize: 15 }}>Citation rate by answer engine — same {S.rows.length} questions</h2><p style={{ color: "var(--ink-3)", fontSize: 12.5, margin: "6px 0 14px" }}>How often each engine cites {site.domain} when answering the questions your buyers ask.</p>
                <div className="sov">{enginesPresent.map(x => { const s = engineStats(x); const col = s.pct >= 50 ? "var(--up)" : s.pct >= 30 ? "var(--warn)" : "var(--down)"; return <div key={x} className="sovrow"><div className="sovname" style={x === e ? { fontWeight: 700 } : {}}>{ENGINE_LABELS[x]}</div><div className="sovbar"><span style={{ width: s.pct.toFixed(0) + "%", background: col }} /></div><div className="sovval">{s.cited.length}/{s.a.length}<span className="sovpct">{s.pct.toFixed(0)}%</span></div></div>; })}</div></div>
              {Object.keys(st).length > 0 && <div className="card pad" style={{ marginTop: 16 }}><h2 style={{ fontSize: 15 }}>Where you win across the buyer journey — {ENGINE_LABELS[e]}</h2><p style={{ color: "var(--ink-3)", fontSize: 12.5, margin: "6px 0 14px" }}>Citation rate by funnel stage. Green = strong, red = blind spot.</p>
                <div className="sov">{STAGES.filter(k => st[k]).map(k => { const b = st[k]; const pct = b.n ? b.c / b.n * 100 : 0; const col = pct >= 50 ? "var(--up)" : pct >= 25 ? "var(--warn)" : "var(--down)"; return <div key={k} className="sovrow"><div className="sovname">{k}</div><div className="sovbar"><span style={{ width: pct.toFixed(0) + "%", background: col }} /></div><div className="sovval">{b.c}/{b.n}<span className="sovpct">{pct.toFixed(0)}%</span></div></div>; })}</div></div>}
              <div className="card pad" style={{ marginTop: 16 }}><h2 style={{ fontSize: 15 }}>Share of voice — who {ENGINE_LABELS[e]} cites in your market</h2><p style={{ color: "var(--ink-3)", fontSize: 12.5, margin: "6px 0 14px" }}>Across {S.a.length} answers, how often each domain is used as a source.</p><div className="sov">{bars(S.sov, S.total, d => d.includes(site.domain))}</div></div>
              {gap.length > 0 && <div className="card pad" style={{ marginTop: 16, borderColor: "color-mix(in srgb,var(--warn) 40%,var(--rule))" }}><h2 style={{ fontSize: 15 }}>⚡ Priority fixes — you rank on Google, but {ENGINE_LABELS[e]} doesn't cite you</h2><p style={{ color: "var(--ink-3)", fontSize: 12.5, margin: "6px 0 12px" }}>{gap.length} questions where {site.domain} is already on Google page one, yet this engine chose other sources. The page ranks — it just isn't answer-shaped. Direct answer up top, question-shaped H2s, FAQ schema.</p>
                <div className="tablewrap"><table style={{ minWidth: 640 }}><thead><tr><th>Question</th><th className="n">Google organic</th><th>Cited instead</th></tr></thead><tbody>{gap.map(c => <tr key={c.id}><td>{promptById[c.prompt_id]?.prompt}</td><td className="n"><span className={"pos " + (orgPosOf(c.prompt_id) <= 3 ? "top" : "mid")}>#{orgPosOf(c.prompt_id)}</span></td><td>{(c.comps || []).slice(0, 3).map(d => <span key={d} className="chip" style={{ background: "var(--paper-3)", color: "var(--ink-2)", marginRight: 4 }}>{d}</span>)}</td></tr>)}</tbody></table></div></div>}
              <div className="tablewrap" style={{ marginTop: 16 }}><table style={{ minWidth: 820 }}><thead><tr><th>Question</th><th>Stage</th><th className="n">Cited (rank / sources)</th><th className="n">Named</th><th className="n">Google</th><th>Competitors cited</th></tr></thead>
                <tbody>{[...S.rows].sort((a, b) => (a.cited ? a.src_rank : 999) - (b.cited ? b.src_rank : 999)).map(c => <tr key={c.id}><td style={{ fontWeight: 550 }}>{promptById[c.prompt_id]?.prompt}</td><td style={{ fontSize: 12, color: "var(--ink-3)" }}>{promptById[c.prompt_id]?.stage}</td><td className="n">{!c.answered ? <span className="pos na">·</span> : c.cited ? <><span className={"pos " + (c.src_rank <= 2 ? "top" : "mid")}>#{c.src_rank}</span><span style={{ fontSize: 12, color: "var(--ink-3)" }}> / {c.sources}</span></> : <span className="chip err">Not cited</span>}</td><td className="n">{c.mention ? <span className="chip ok">Named</span> : <span className="pos na">—</span>}</td><td className="n">{orgPosOf(c.prompt_id) ? <span className="mono" style={{ fontSize: 12 }}>#{orgPosOf(c.prompt_id)}</span> : <span className="pos na">—</span>}</td><td>{(c.comps || []).slice(0, 3).map(d => <span key={d} className="chip" style={{ background: "var(--paper-3)", color: "var(--ink-2)", marginRight: 4 }}>{d}</span>)}</td></tr>)}</tbody></table></div>
              <p style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 12 }}><b>Cited</b> = {site.domain} linked as a source · <b>Named</b> = your brand appears in the answer text · <b>Google</b> = your organic position for the same question. Questions are natural language across 8 buyer-journey stages, because that is how people ask AI.</p>
            </>);
          })()}
        </>)}

        {/* ════════ OPPORTUNITIES ════════ */}
        {view === "opps" && (<>
          {!opps.length ? <div className="notice-bar"><span>🔎</span><div><b>Opportunities appear after your first scan.</b> We expand your keywords through Google Autocomplete, drop what you already track, and verify the best against live page one so you can see who holds each spot.</div></div> : (<>
            <div className="kpis">
              <div className="kpi"><div className="l">New keywords found</div><div className="v" style={{ color: "var(--accent-ink)" }}>{opps.length}</div><div className="s">not in your tracked list</div></div>
              <div className="kpi"><div className="l">Verified on page one</div><div className="v" style={{ color: "var(--up)" }}>{opps.filter(o => o.position !== null).length}</div><div className="s">{opps.filter(o => o.position > 0).length} you already rank for</div></div>
              <div className="kpi"><div className="l">Commercial pages to build</div><div className="v">{opps.filter(o => o.cls === "Commercial").length}</div><div className="s">buyer-intent — highest value</div></div>
              <div className="kpi"><div className="l">Articles to write</div><div className="v">{opps.filter(o => o.cls === "Blog" || o.cls === "Comparison").length}</div><div className="s">questions + comparisons that feed AI answers</div></div>
            </div>
            {oppTally.length > 0 && <div className="card pad"><h2 style={{ fontSize: 15 }}>Who owns your market on page one</h2><p style={{ color: "var(--ink-3)", fontSize: 12.5, margin: "6px 0 14px" }}>Across the verified searches, how often each domain holds a page-one slot. These are the sites you have to displace.</p><div className="sov">{bars(oppTally, oppTally.reduce((a, b) => a + b[1], 0), () => false)}</div></div>}
            <div className="toolbar"><div className="seg">{["All", "Commercial", "Blog", "Comparison", "Integration"].map(c => <button key={c} className={c === oppCls ? "on" : ""} onClick={() => setOppCls(c)}>{c}{c !== "All" && <span style={{ opacity: .6, marginLeft: 5 }}>{opps.filter(o => o.cls === c).length}</span>}</button>)}</div></div>
            <div className="tablewrap"><table style={{ minWidth: 900 }}><thead><tr><th>Keyword — and the page to build</th><th>Type</th><th className="n">Demand</th><th className="n">You rank</th><th>Who ranks now</th><th className="n">Score</th></tr></thead>
              <tbody>{oppList.map(o => <tr key={o.id}><td><div className="kwname">{o.phrase}</div><div className="kwsub">{{ Commercial: "Money page — landing page targeting buyers", Comparison: "Comparison page — you vs the named rival", Blog: "Article — answers the question directly", Integration: "Docs / integration guide" }[o.cls]}</div></td><td><span className={"pill " + (o.cls === "Commercial" ? "comm" : o.cls === "Comparison" ? "prio" : "long")}>{o.cls}</span></td><td className="n">{o.demand ? <span className="chip ok">Real demand</span> : "—"}</td><td className="n">{o.position === null ? <span className="pos na">not checked</span> : o.position === 0 ? <span className="chip err">Not on page 1</span> : <span className={"pos " + (o.position <= 3 ? "top" : "mid")}>#{o.position}</span>}</td><td>{(o.top_domains || []).slice(0, 3).map(d => <span key={d} className="chip" style={{ background: "var(--paper-3)", color: "var(--ink-2)", marginRight: 4 }}>{d}</span>)}</td><td className="n"><span className="mono" style={{ fontWeight: 700, color: o.score >= 70 ? "var(--up)" : o.score >= 50 ? "var(--warn)" : "var(--ink-2)" }}>{o.score}</span></td></tr>)}</tbody></table></div>
            <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 12 }}><b>Demand</b> = the phrase appears in Google Autocomplete, so real people type it. <b>You rank</b> = your live position when we verified it. Keywords you already track are filtered out.</p>
          </>)}
        </>)}
      </div>

      {/* ───── drawer ───── */}
      <div className={"scrim" + (openRow ? " on" : "")} onClick={() => setOpen(null)} />
      <aside className={"drawer" + (openRow ? " open" : "")} aria-hidden={!openRow}>
        {openRow && (<>
          <div className="dhead"><div><span className={"pill " + (TABS.find(t => t.k === (openRow.tab || "commercial"))?.pill)}>{TABS.find(t => t.k === (openRow.tab || "commercial"))?.label}</span><h2 style={{ marginTop: 8, fontSize: 18 }}>{openRow.phrase}</h2><div style={{ color: "var(--ink-3)", fontSize: 12, marginTop: 3 }}>{openRow.grp || "General"}</div></div><button className="x" onClick={() => setOpen(null)}>✕</button></div>
          <div className="dbody">
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-3)", fontWeight: 650, marginBottom: 8 }}>{lbl(cur)} — every country</div>
            <div className="rgrid">{site.regions.map(r => { const v = val(openRow, cur, r); return <div key={r} className="rcell"><div className="k"><span className="dot" style={{ background: RCOL[r] }} />{REGIONS[r]?.name}</div><div className="v" style={{ color: v > 0 ? (v <= 3 ? "var(--up)" : "var(--ink)") : "var(--ink-3)" }}>{v === null ? "·" : v === 0 ? "—" : v}</div></div>; })}</div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-3)", fontWeight: 650, margin: "22px 0 8px" }}>Position over time — {REGIONS[region]?.name}</div>
            <div className="spark">{months.map(m => { const v = val(openRow, m, region); const h = v === null ? 3 : v === 0 ? 4 : (11 - v) * 10; return <span key={m} className={v === null || v === 0 ? "none" : ""} style={{ height: h + "%" }} title={`${lbl(m)}: ${v === null ? "not measured" : v === 0 ? "not on page 1" : "#" + v}`} />; })}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)", marginTop: 4 }}>{months.map(m => <span key={m}>{lbl(m)}</span>)}</div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-3)", fontWeight: 650, margin: "22px 0 8px" }}>Month × region</div>
            <div className="tablewrap" style={{ border: 0 }}><table className="mtable"><thead><tr><th>Month</th>{site.regions.map(r => <th key={r} className="n">{r}</th>)}</tr></thead><tbody>{months.map(m => <tr key={m}><td>{lbl(m)}</td>{site.regions.map(r => <td key={r}>{cell(val(openRow, m, r))}</td>)}</tr>)}</tbody></table></div>
          </div>
        </>)}
      </aside>
      <style>{`.sov{display:flex;flex-direction:column;gap:7px}.sovrow{display:grid;grid-template-columns:200px 1fr 90px;gap:12px;align-items:center;font-size:13px}.sovname{color:var(--ink-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.sovname.me{color:var(--accent-ink);font-weight:700}.sovbar{height:10px;background:var(--paper-3);border-radius:5px;overflow:hidden}.sovbar span{display:block;height:100%;border-radius:5px}.sovval{font-family:var(--mono);font-weight:700;text-align:right;font-size:12.5px}.sovpct{color:var(--ink-3);font-weight:500;margin-left:5px}@media(max-width:700px){.sovrow{grid-template-columns:110px 1fr 70px}}`}</style>
    </>
  );
}
