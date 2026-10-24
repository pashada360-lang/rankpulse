"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";

const TABS = [["commercial", "Commercial"], ["priority", "Priority"], ["longtail", "Long tail"]];

export default function Keywords() {
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [acc, setAcc] = useState(null);
  const [kws, setKws] = useState([]);
  const [add, setAdd] = useState("");
  const [tab, setTab] = useState("commercial");
  const [grp, setGrp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { data: s } = await sb().auth.getSession();
    if (!s.session) return router.replace("/login");
    const [{ data: sites }, { data: a }] = await Promise.all([sb().from("sites").select("*").limit(1), sb().from("accounts").select("*").single()]);
    if (!sites?.length) return router.replace("/onboarding");
    setSite(sites[0]); setAcc(a);
    const { data: k } = await sb().from("keywords").select("*").eq("site_id", sites[0].id).order("phrase");
    setKws(k || []);
  }, [router]);
  useEffect(() => { load(); }, [load]);

  const phrases = add.split("\n").map(s => s.trim().toLowerCase()).filter(Boolean).filter(p => !kws.some(k => k.phrase === p));
  const room = acc ? acc.keyword_limit - kws.length : 0;

  async function save() {
    setErr(""); setBusy(true);
    const rows = phrases.slice(0, Math.max(0, room)).map(p => ({ site_id: site.id, phrase: p, tab, grp: grp.trim() || "General" }));
    const { error } = await sb().from("keywords").insert(rows);
    setBusy(false);
    if (error) return setErr(error.message);
    setAdd(""); load();
  }
  async function remove(id) {
    if (!confirm("Remove this keyword? Its history is kept.")) return;
    await sb().from("keywords").delete().eq("id", id); load();
  }
  async function retab(id, t) { await sb().from("keywords").update({ tab: t }).eq("id", id); load(); }

  if (!site) return <div className="center"><p style={{ color: "var(--ink-3)" }}>Loading…</p></div>;

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <div className="brand"><div className="mark">R</div>RankPulse</div>
        <span style={{ color: "var(--ink-3)", fontSize: 13.5 }}>{site.domain}</span>
        <div className="spacer" />
        <a className="btn btn-ghost" href="/dashboard">← Dashboard</a>
      </div></nav>

      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 72, maxWidth: 960 }}>
        <h1 style={{ fontSize: 24 }}>Keywords</h1>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>{kws.length} of {acc?.keyword_limit} on your plan. {room <= 0 ? <a href="/pricing">Upgrade for more →</a> : `Room for ${room} more.`}</p>

        <div className="card pad" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16 }}>Add keywords</h3>
          <div className="field" style={{ marginTop: 14 }}>
            <textarea value={add} onChange={e => setAdd(e.target.value)} placeholder={"one per line\nhotel booking software\nbest hotel api provider"} style={{ minHeight: 120 }} />
            <div className="hint">{phrases.length} new{phrases.length > room ? ` — only ${Math.max(0, room)} fit on your plan` : ""}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={tab} onChange={e => setTab(e.target.value)} style={{ width: "auto" }}>{TABS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input value={grp} onChange={e => setGrp(e.target.value)} placeholder="Group (optional), e.g. Core product" style={{ width: 260 }} />
            <button className="btn btn-primary" disabled={busy || !phrases.length || room <= 0} onClick={save}>{busy ? "Saving…" : `Add ${Math.min(phrases.length, Math.max(0, room))}`}</button>
          </div>
          {err && <div className="note bad" style={{ marginTop: 12 }}>{err}</div>}
        </div>

        <div className="tablewrap" style={{ marginTop: 20 }}>
          <table>
            <thead><tr><th>Keyword</th><th>Group</th><th>Tab</th><th></th></tr></thead>
            <tbody>
              {kws.map(k => (
                <tr key={k.id}>
                  <td style={{ fontWeight: 550 }}>{k.phrase}</td>
                  <td style={{ color: "var(--ink-2)" }}>{k.grp || "General"}</td>
                  <td><select value={k.tab || "commercial"} onChange={e => retab(k.id, e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: 13 }}>{TABS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></td>
                  <td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => remove(k.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 12 }}>Tabs group your dashboard: <b>Commercial</b> for buyer-intent phrases, <b>Priority</b> for the handful you watch closest, <b>Long tail</b> for everything else. Keep brand-name long tail out of Commercial so it doesn't flatter your numbers.</p>
      </div>
    </>
  );
}
