"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb, REGIONS } from "../../lib/supabase";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState("");
  const [brand, setBrand] = useState("");
  const [regions, setRegions] = useState(["IN", "US"]);
  const [kw, setKw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    sb().auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.replace("/login");
      const { data: acc } = await sb().from("accounts").select("keyword_limit").single();
      if (acc) setLimit(acc.keyword_limit);
    });
  }, [router]);

  const clean = d => d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  const phrases = kw.split("\n").map(s => s.trim()).filter(Boolean);
  const overLimit = phrases.length > limit;

  const toggle = r => setRegions(v => v.includes(r) ? v.filter(x => x !== r) : [...v, r]);

  async function finish() {
    setErr(""); setBusy(true);
    try {
      const { data: acc, error: ae } = await sb().from("accounts").select("id").single();
      if (ae) throw ae;

      const { data: site, error: se } = await sb().from("sites").insert({
        account_id: acc.id,
        domain: clean(domain),
        brand_word: (brand || clean(domain).split(".")[0]).trim().toLowerCase(),
        regions,
      }).select().single();
      if (se) throw se;

      const rows = phrases.slice(0, limit).map(p => ({ site_id: site.id, phrase: p.toLowerCase() }));
      if (rows.length) {
        const { error: ke } = await sb().from("keywords").insert(rows);
        if (ke) throw ke;
      }

      // queue the first scan for this month
      await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: site.id }),
      });

      router.replace("/dashboard");
    } catch (e) {
      setErr(e.message || String(e));
      setBusy(false);
    }
  }

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <div className="brand"><div className="mark">R</div>RankPulse</div>
        <div className="spacer" />
        <span style={{ fontSize: 13, color: "var(--ink-3)" }}>Step {step} of 3</span>
      </div></nav>

      <div className="center" style={{ maxWidth: 580 }}>
        {step === 1 && (
          <div className="card pad">
            <h2 style={{ fontSize: 21 }}>What site are we tracking?</h2>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "7px 0 22px" }}>
              Just the domain — no https, no www.
            </p>
            <div className="field">
              <label>Domain</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="acme.com" />
            </div>
            <div className="field">
              <label>Brand name as it appears in text <span style={{ fontWeight: 400, color: "var(--ink-3)" }}>(optional)</span></label>
              <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Acme" />
              <div className="hint">Used to spot mentions of you in AI answers.</div>
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}
              disabled={!clean(domain).includes(".")}
              onClick={() => setStep(2)}>Continue</button>
          </div>
        )}

        {step === 2 && (
          <div className="card pad">
            <h2 style={{ fontSize: 21 }}>Which countries do you sell to?</h2>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "7px 0 22px" }}>
              We measure from a real IP address inside each one. Pick only the ones that matter —
              each adds to your monthly scan.
            </p>
            <div className="regsel">
              {Object.entries(REGIONS).map(([k, v]) => (
                <label key={k} className={regions.includes(k) ? "on" : ""}>
                  <input type="checkbox" checked={regions.includes(k)} onChange={() => toggle(k)} />
                  {v.name}
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: 9, marginTop: 24 }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={!regions.length} onClick={() => setStep(3)}>Continue</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="card pad">
            <h2 style={{ fontSize: 21 }}>Your keywords</h2>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "7px 0 18px" }}>
              One per line. Start with the phrases a buyer types when they&apos;re choosing a
              supplier — those are worth more than a long list.
            </p>
            <div className="field">
              <textarea value={kw} onChange={e => setKw(e.target.value)}
                placeholder={"hotel api provider\nbest hotel booking api\nwhite label booking engine"} />
              <div className="hint" style={{ color: overLimit ? "var(--down)" : "var(--ink-3)" }}>
                {phrases.length} of {limit} keywords{overLimit ? " — over your plan limit, extras will be dropped" : ""}
              </div>
            </div>
            {err && <div className="note bad" style={{ marginBottom: 14 }}>{err}</div>}
            <div style={{ display: "flex", gap: 9 }}>
              <button className="btn btn-ghost" onClick={() => setStep(2)} disabled={busy}>Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }}
                disabled={busy || !phrases.length} onClick={finish}>
                {busy ? "Setting up…" : `Start tracking ${phrases.length} keywords`}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
