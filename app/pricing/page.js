"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";
import { PLANS, inr } from "../../lib/plans";

export default function Pricing() {
  const router = useRouter();
  const [acc, setAcc] = useState(null);
  const [cycle, setCycle] = useState("annual");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
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
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.session.access_token },
      body: JSON.stringify({ plan: planKey, cycle }),
    });
    const j = await res.json();
    setBusy("");
    if (j.error) return setErr(j.error);

    /* Razorpay Checkout — loaded on demand */
    await new Promise(r => { if (window.Razorpay) return r(); const sc = document.createElement("script"); sc.src = "https://checkout.razorpay.com/v1/checkout.js"; sc.onload = r; document.body.appendChild(sc); });
    const rz = new window.Razorpay({
      key: j.key, order_id: j.orderId, amount: j.amount, currency: "INR",
      name: "RankPulse", description: `${PLANS[planKey].name} · ${cycle}`,
      prefill: { email: s.session.user.email },
      theme: { color: "#4F46E5" },
      handler: async resp => {
        const v = await fetch("/api/checkout/verify", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + s.session.access_token }, body: JSON.stringify({ ...resp, plan: planKey, cycle }) });
        const vj = await v.json();
        if (vj.ok) router.replace("/dashboard?upgraded=1"); else setErr(vj.error || "Payment could not be verified.");
      },
    });
    rz.open();
  }

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <div className="brand"><div className="mark">R</div>RankPulse</div>
        <div className="spacer" />
        <a className="btn btn-ghost" href="/dashboard">← Dashboard</a>
      </div></nav>

      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <h1 style={{ fontSize: 30 }}>Choose a plan</h1>
        <p style={{ color: "var(--ink-2)", marginTop: 8, maxWidth: "60ch" }}>
          {acc?.plan === "trial" ? "Your trial keeps running until it ends — picking a plan just means scans never pause." : `You're on ${PLANS[acc?.plan]?.name || acc?.plan}.`} Annual billing gives you two months free.
        </p>
        <div className="seg" style={{ marginTop: 20 }}>
          <button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Monthly</button>
          <button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Annual <span style={{ color: "var(--up)", marginLeft: 4 }}>−2 months</span></button>
        </div>
        {err && <div className="note bad" style={{ marginTop: 16 }}>{err}</div>}

        <div className="plans">
          {Object.entries(PLANS).map(([k, p]) => {
            const current = acc?.plan === k;
            return (
              <div key={k} className={"plan" + (p.hot ? " hot" : "")}>
                <div className="pn">{p.name}{current && <span className="chip ok" style={{ marginLeft: 8 }}>Current</span>}{!current && p.hot && <span className="chip ok" style={{ marginLeft: 8 }}>Most popular</span>}</div>
                <div className="pp">{cycle === "monthly" ? inr(p.monthly) : inr(Math.round(p.annual / 12))}<small>/month</small></div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", minHeight: 18 }}>{cycle === "annual" ? `${inr(p.annual)} billed yearly` : "billed monthly, cancel any time"}</div>
                <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "10px 0 0" }}>{p.desc}</p>
                <ul>
                  <li>{p.keywords} keywords</li>
                  <li>{p.regions} countries</li>
                  <li>Automatic monthly scans</li>
                  <li>Full history, never deleted</li>
                  <li>Page-one competitors per keyword</li>
                </ul>
                <button className={"btn " + (p.hot ? "btn-primary" : "btn-ghost")} disabled={!!busy || current} onClick={() => choose(k)}>
                  {current ? "Your plan" : busy === k ? "Opening checkout…" : `Choose ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>
        <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 20 }}>Payments by Razorpay — UPI, cards, net banking. Prices in INR, GST extra where applicable. Cancel monthly plans any time; annual plans run for 12 months.</p>
      </div>
    </>
  );
}
