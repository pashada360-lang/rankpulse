"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";
import { PLANS, price, fmt, guessCurrency } from "../../lib/plans";
import AppShell from "../../components/AppShell";
import EngineLogo, { ENGINES } from "../../components/EngineLogo";

/* perks that spell out engine names in brackets drop the bracket — the logo row under the list carries it */
const perkText = x => x.replace(/\s*\([^)]*(?:ChatGPT|Perplexity|Gemini|Claude|Google AI)[^)]*\)/, "");

export default function Billing() {
  const router = useRouter();
  const [acc, setAcc] = useState(null);
  const [cycle, setCycle] = useState("annual");
  const [cur, setCur] = useState("USD");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    setCur(guessCurrency());
    sb().auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.replace("/login");
      const { data: a } = await sb().from("accounts").select("*").single();
      setAcc(a);
    });
  }, [router]);

  async function choose(planKey) {
    setErr(""); setBusy(planKey);
    const { data: s } = await sb().auth.getSession();
    const res = await fetch("/api/checkout", {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.session.access_token },
      body: JSON.stringify({ plan: planKey, cycle, currency: cur }),
    });
    const j = await res.json(); setBusy("");
    if (j.error) return setErr(j.error);
    await new Promise(r => { if (window.Razorpay) return r(); const sc = document.createElement("script"); sc.src = "https://checkout.razorpay.com/v1/checkout.js"; sc.onload = r; document.body.appendChild(sc); });
    new window.Razorpay({
      key: j.key, subscription_id: j.subscriptionId,
      name: "RankPulse", description: `${PLANS[planKey].name} · billed ${cycle}`, prefill: { email: s.session.user.email }, theme: { color: "#4F46E5" },
      handler: async resp => {
        const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.session.access_token }, body: JSON.stringify({ ...resp, plan: planKey, cycle }) });
        const vj = await v.json();
        if (vj.ok) router.replace("/dashboard?upgraded=1"); else setErr(vj.error || "Payment could not be verified.");
      },
    }).open();
  }

  return (
    <AppShell>
      <nav className="nav"><div className="nav-in"><a className="brand" href="/dashboard"><div className="mark">R</div>RankPulse</a><div className="spacer" /><a className="btn btn-ghost" href="/dashboard">← Dashboard</a></div></nav>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ fontSize: 30 }}>Choose a plan</h1>
        <p style={{ color: "var(--ink-2)", marginTop: 8, maxWidth: "60ch" }}>{acc?.plan === "trial" ? "Your trial keeps running until it ends — picking a plan just means scans never pause." : `You're on ${PLANS[acc?.plan]?.name || acc?.plan}.`}</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20, flexWrap: "wrap" }}>
          <div className="seg"><button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Monthly</button><button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Annual <span style={{ color: "var(--up)", marginLeft: 4 }}>−2 months</span></button></div>
          <div className="seg"><button className={cur === "USD" ? "on" : ""} onClick={() => setCur("USD")}>$ USD</button><button className={cur === "INR" ? "on" : ""} onClick={() => setCur("INR")}>₹ INR</button></div>
        </div>
        {err && <div className="note bad" style={{ marginTop: 16 }}>{err}</div>}
        <div className="plans2">
          {Object.entries(PLANS).map(([k, p]) => {
            const current = acc?.plan === k;
            const perMonth = cycle === "annual" ? Math.round(price(p, cur, "annual") / 12) : price(p, cur, "monthly");
            const dim = p.hot ? "rgba(255,255,255,.55)" : "var(--ink-3)";
            return (
              <div key={k} className={"plan2" + (p.hot ? " hot" : "")}>
                {p.hot && !current && <div className="tag">Most popular</div>}
                <div className="pn">{p.name}{current && <span className="chip ok" style={{ marginLeft: 8 }}>Current</span>}</div>
                <div className="pp2">{fmt(perMonth, cur)}<small>/mo</small></div>
                <div style={{ fontSize: 12.5, color: p.hot ? "rgba(255,255,255,.6)" : "var(--ink-3)" }}>{cycle === "annual" ? `${fmt(price(p, cur, "annual"), cur)} billed yearly` : "billed monthly, cancel any time"}</div>
                <div className="desc">{p.desc}</div>
                <ul>{p.perks.map(x => <li key={x}>{perkText(x)}</li>)}</ul>
                <div style={{ display: "flex", alignItems: "center", gap: "8px 14px", flexWrap: "wrap", margin: "-8px 0 24px", paddingTop: 14, borderTop: "1px solid " + (p.hot ? "rgba(255,255,255,.1)" : "var(--rule)"), fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: dim, fontWeight: 600 }}>AI engines included:</span>
                  {p.aeo
                    ? Object.keys(ENGINES).map(e => <EngineLogo key={e} engine={e} size={16} dark withName />)
                    : <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: p.hot ? "rgba(255,255,255,.75)" : "var(--ink-2)", fontWeight: 500 }}><EngineLogo engine="google" size={16} dark />Google rankings only</span>}
                </div>
                <button className={"btn " + (p.hot ? "" : "btn-primary")} disabled={!!busy || current} onClick={() => choose(k)}>{current ? "Your plan" : busy === k ? "Opening checkout…" : `Choose ${p.name}`}</button>
              </div>
            );
          })}
        </div>
        <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 20 }}>Payments by Razorpay — cards, UPI, net banking, international cards. GST extra for Indian billing. Annual plans run 12 months; full refund within 14 days of first charge.</p>
      </div>
    </AppShell>
  );
}
