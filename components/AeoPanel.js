"use client";
import { useEffect, useState } from "react";
import { DO_DONT, recommend } from "../lib/aeo-rules";
import { PLANS } from "../lib/plans";
import EngineLogo, { EngineRow } from "./EngineLogo";

export default function AeoPanel({ site, acc, rankingCount, top3Count, keywordCount }) {
  const [audit, setAudit] = useState(null);
  const [busy, setBusy] = useState(false);
  const hasAeo = !!PLANS[acc?.plan]?.aeo;

  async function run() {
    setBusy(true);
    const r = await fetch("/api/aeo/audit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ domain: site.domain }) });
    setAudit(await r.json()); setBusy(false);
  }
  useEffect(() => { run(); /* eslint-disable-next-line */ }, [site.domain]);

  const recs = recommend({ audit, rankingCount, top3Count, keywordCount, hasAeo });
  const col = { crit: "var(--down)", warn: "var(--warn)", info: "var(--accent-ink)", ok: "var(--up)" };
  const bg = { crit: "var(--down-bg)", warn: "var(--warn-bg)", info: "var(--accent-weak)", ok: "var(--up-bg)" };

  return (
    <div style={{ marginTop: 18 }}>
      {/* recommendations */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 18 }}>What to do next</h2>
        <span className="chip warn">{recs.filter(r => r.kind !== "ok").length} actions</span>
        <div className="spacer" />
        <button className="btn btn-ghost" onClick={run} disabled={busy}>{busy ? "Checking…" : "Re-check robots.txt"}</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
        {recs.map(r => (
          <div key={r.t} style={{ borderLeft: `3px solid ${col[r.kind]}`, background: bg[r.kind], borderRadius: "0 12px 12px 0", padding: "14px 16px" }}>
            <div style={{ fontWeight: 700 }}>{r.t}</div>
            <div style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 4 }}>{r.d}</div>
            {r.kind === "info" && r.t.includes("Growth") && <a href="/billing" className="btn btn-primary" style={{ display: "inline-block", marginTop: 10, padding: "7px 12px", fontSize: 13 }}>Upgrade to Growth →</a>}
          </div>
        ))}
      </div>

      {/* crawler audit table */}
      {audit && (
        <>
          <h2 style={{ fontSize: 18, marginTop: 30 }}>Crawler access — {audit.domain}</h2>
          <p style={{ color: "var(--ink-3)", fontSize: 13, marginTop: 4 }}>Read from <span className="mono">{audit.url || "robots.txt"}</span>{audit.status ? ` (HTTP ${audit.status})` : ""} · {new Date(audit.checkedAt).toLocaleString()}</p>
          <div className="tablewrap" style={{ marginTop: 12 }}>
            <table>
              <thead><tr><th>Crawler</th><th>Owner</th><th>What it controls</th><th className="n">Status</th></tr></thead>
              <tbody>{audit.results.map(b => (
                <tr key={b.ua}><td className="mono" style={{ fontSize: 13 }}>{b.ua}</td><td><span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>{b.engine && <EngineLogo engine={b.engine} size={16} dark />}<span>{b.who}</span></span></td><td style={{ color: "var(--ink-2)", fontSize: 13.5 }}>{b.controls}</td>
                  <td className="n">{b.blocked ? <span className="chip err">Blocked</span> : <span className="chip ok">Allowed</span>}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}

      {/* citation tracking */}
      <h2 style={{ fontSize: 18, marginTop: 30 }}>AI citation tracking</h2>
      {hasAeo ? (
        <div className="notice-bar" style={{ marginTop: 10 }}><div><b>Included on your plan.</b> Add buyer questions under <a href="/keywords">Keywords → AI questions</a> and they'll be put to every engine below on your next scan. Results and the fix list appear here.
          <div style={{ marginTop: 10 }}><EngineRow size={18} dark names /></div></div></div>
      ) : (
        <div className="card pad" style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr auto", gap: 18, alignItems: "center" }}>
          <div><div style={{ fontWeight: 700 }}>See which AI engines cite you.</div>
            <div style={{ color: "var(--ink-2)", fontSize: 14, marginTop: 4 }}>Real buyer questions by funnel stage, a fix list ranked by payoff. On Growth and above.</div>
            <div style={{ marginTop: 10 }}><EngineRow size={18} dark names /></div></div>
          <a className="btn btn-primary" href="/billing">Upgrade</a>
        </div>
      )}

      {/* do / don't */}
      <h2 style={{ fontSize: 18, marginTop: 30 }}>Do / don't — how to get quoted</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 12 }} className="dodont">
        <div className="card pad"><h3 style={{ fontSize: 15, color: "var(--up)" }}>Do</h3><ul className="check">{DO_DONT.do.map(x => <li key={x.t} className="ok"><span><b>{x.t}.</b> {x.d}</span></li>)}</ul></div>
        <div className="card pad"><h3 style={{ fontSize: 15, color: "var(--down)" }}>Don't</h3><ul className="check">{DO_DONT.dont.map(x => <li key={x.t} className="no"><span><b>{x.t}.</b> {x.d}</span></li>)}</ul></div>
      </div>
      <style>{`@media(max-width:800px){.dodont{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
