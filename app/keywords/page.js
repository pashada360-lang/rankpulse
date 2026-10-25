"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";
import { PLANS } from "../../lib/plans";
import { STAGES, defaultPrompts } from "../../lib/ai-prompts";
import AppShell from "../../components/AppShell";
import { EngineRow } from "../../components/EngineLogo";

const TABS = [["commercial", "Commercial"], ["priority", "Priority"], ["longtail", "Long tail"]];

export default function Keywords() {
  const router = useRouter();
  const [site, setSite] = useState(null);
  const [acc, setAcc] = useState(null);
  const [kws, setKws] = useState([]);
  const [prompts, setPrompts] = useState([]);
  const [add, setAdd] = useState("");
  const [tab, setTab] = useState("commercial");
  const [grp, setGrp] = useState("");
  const [pAdd, setPAdd] = useState("");
  const [pStage, setPStage] = useState("Vendor evaluation");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { data: s } = await sb().auth.getSession();
    if (!s.session) return router.replace("/login");
    const [{ data: sites }, { data: a }] = await Promise.all([sb().from("sites").select("*").limit(1), sb().from("accounts").select("*").single()]);
    if (!sites?.length) return router.replace("/onboarding");
    setSite(sites[0]); setAcc(a);
    const [{ data: k }, { data: p }] = await Promise.all([sb().from("keywords").select("*").eq("site_id", sites[0].id).order("phrase"), sb().from("ai_prompts").select("*").eq("site_id", sites[0].id).order("stage")]);
    setKws(k || []); setPrompts(p || []);
  }, [router]);
  useEffect(() => { load(); }, [load]);

  const phrases = add.split("\n").map(s => s.trim().toLowerCase()).filter(Boolean).filter(p => !kws.some(k => k.phrase === p));
  const room = acc ? acc.keyword_limit - kws.length : 0;
  const hasAeo = !!PLANS[acc?.plan]?.aeo || acc?.plan === "trial";
  const promptLimit = acc?.plan === "scale" ? 60 : 30;

  async function save() {
    setErr(""); setBusy(true);
    const { error } = await sb().from("keywords").insert(phrases.slice(0, Math.max(0, room)).map(p => ({ site_id: site.id, phrase: p, tab, grp: grp.trim() || "General" })));
    setBusy(false); if (error) return setErr(error.message); setAdd(""); load();
  }
  async function remove(id) { if (!confirm("Remove this keyword? Its history is kept.")) return; await sb().from("keywords").delete().eq("id", id); load(); }
  async function retab(id, t) { await sb().from("keywords").update({ tab: t }).eq("id", id); load(); }

  async function addPrompts(list) {
    setErr(""); setBusy(true);
    const fresh = list.filter(x => !prompts.some(p => p.prompt === x.prompt)).slice(0, Math.max(0, promptLimit - prompts.length));
    if (fresh.length) { const { error } = await sb().from("ai_prompts").insert(fresh.map(x => ({ site_id: site.id, prompt: x.prompt, stage: x.stage }))); if (error) setErr(error.message); }
    setBusy(false); setPAdd(""); load();
  }
  async function removePrompt(id) { await sb().from("ai_prompts").delete().eq("id", id); load(); }
  async function restage(id, stage) { await sb().from("ai_prompts").update({ stage }).eq("id", id); load(); }

  if (!site) return <AppShell><div className="center"><span className="skel" style={{ width: 180 }} /></div></AppShell>;

  return (
    <AppShell>
      <nav className="nav"><div className="nav-in"><a className="brand" href="/dashboard"><div className="mark">R</div>RankPulse</a><span style={{ color: "var(--ink-3)", fontSize: 13.5 }}>{site.domain}</span><div className="spacer" /><a className="btn btn-ghost" href="/dashboard">← Dashboard</a></div></nav>
      <div className="wrap" style={{ paddingTop: 24, paddingBottom: 72, maxWidth: 980 }}>
        <h1 style={{ fontSize: 24 }}>Keywords</h1>
        <p style={{ color: "var(--ink-2)", marginTop: 6 }}>{kws.length} of {acc?.keyword_limit} on your plan. {room <= 0 ? <a href="/billing">Upgrade for more →</a> : `Room for ${room} more.`}</p>
        <div className="card pad" style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 16 }}>Add keywords</h3>
          <div className="field" style={{ marginTop: 14 }}><textarea value={add} onChange={e => setAdd(e.target.value)} placeholder={"one per line\nhotel booking software\nbest hotel api provider"} style={{ minHeight: 110 }} /><div className="hint">{phrases.length} new{phrases.length > room ? ` — only ${Math.max(0, room)} fit on your plan` : ""}</div></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={tab} onChange={e => setTab(e.target.value)} style={{ width: "auto" }}>{TABS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            <input value={grp} onChange={e => setGrp(e.target.value)} placeholder="Group (optional), e.g. Core product" style={{ width: 260 }} />
            <button className="btn btn-primary" disabled={busy || !phrases.length || room <= 0} onClick={save}>{busy ? "Saving…" : `Add ${Math.min(phrases.length, Math.max(0, room))}`}</button>
          </div>
          {err && <div className="note bad" style={{ marginTop: 12 }}>{err}</div>}
        </div>
        <div className="tablewrap" style={{ marginTop: 18 }}><table><thead><tr><th>Keyword</th><th>Group</th><th>Tab</th><th></th></tr></thead>
          <tbody>{kws.map(k => <tr key={k.id}><td style={{ fontWeight: 550 }}>{k.phrase}</td><td style={{ color: "var(--ink-2)" }}>{k.grp || "General"}</td><td><select value={k.tab || "commercial"} onChange={e => retab(k.id, e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: 13 }}>{TABS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></td><td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => remove(k.id)}>Remove</button></td></tr>)}</tbody></table></div>

        {/* ───── AI questions ───── */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 48 }}><h1 id="ai" style={{ fontSize: 24 }}>AI questions</h1><EngineRow size={18} dark names={false} gap={8} /></div>
        <p style={{ color: "var(--ink-2)", marginTop: 6, maxWidth: "70ch" }}>Buyers ask AI questions, not keywords. Each one is put to every engine above on every scan, and we record whether your site is cited. {prompts.length} of {promptLimit}.</p>
        {!hasAeo && <div className="note info" style={{ marginTop: 12 }}>AI-answer tracking runs on the <b>Growth</b> plan and above. You can prepare questions now; they'll run as soon as you upgrade. <a href="/billing">See plans →</a></div>}
        <div className="card pad" style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="btn btn-ghost" disabled={busy} onClick={() => addPrompts(defaultPrompts(site.brand_word || site.domain.split(".")[0], site.category))}>Add 15 suggested questions</button>
            <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Based on your brand{site.category ? ` and “${site.category}”` : ""} — edit them after.</span>
          </div>
          <div className="field" style={{ marginTop: 16 }}><textarea value={pAdd} onChange={e => setPAdd(e.target.value)} placeholder={"one question per line, the way a buyer would ask it\nwhat's the best hotel booking API for a startup in India\nhow much does hotel API integration cost"} style={{ minHeight: 90 }} /></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select value={pStage} onChange={e => setPStage(e.target.value)} style={{ width: "auto" }}>{STAGES.map(s => <option key={s}>{s}</option>)}</select>
            <button className="btn btn-primary" disabled={busy || !pAdd.trim()} onClick={() => addPrompts(pAdd.split("\n").map(s => s.trim()).filter(Boolean).map(prompt => ({ prompt, stage: pStage })))}>Add questions</button>
          </div>
        </div>
        <div className="tablewrap" style={{ marginTop: 18 }}><table><thead><tr><th>Question</th><th>Stage</th><th></th></tr></thead>
          <tbody>{prompts.map(p => <tr key={p.id}><td style={{ fontWeight: 550 }}>{p.prompt}</td><td><select value={p.stage} onChange={e => restage(p.id, e.target.value)} style={{ width: "auto", padding: "5px 8px", fontSize: 13 }}>{STAGES.map(s => <option key={s}>{s}</option>)}</select></td><td style={{ textAlign: "right" }}><button className="btn btn-ghost" style={{ padding: "5px 10px", fontSize: 12.5 }} onClick={() => removePrompt(p.id)}>Remove</button></td></tr>)}
            {!prompts.length && <tr><td colSpan={3} style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}>No questions yet — add the suggested set to start.</td></tr>}</tbody></table></div>
      </div>
    </AppShell>
  );
}
