"use client";
import { useEffect, useState } from "react";
import { PLANS, price, fmt, guessCurrency, ANNUAL_MONTHS } from "../../lib/plans";
import { Nav, Footer, CTA, useReveal } from "../../components/Site";

export default function Pricing() {
  const [cur, setCur] = useState("USD");
  const [annual, setAnnual] = useState(true);
  useEffect(() => setCur(guessCurrency()), []);
  useReveal();
  const cycle = annual ? "annual" : "monthly";

  return (
    <>
      <div className="band"><div className="orb a" /><div className="orb b" /><Nav dark />
        <div className="sec" style={{ color: "#fff", paddingTop: 60, paddingBottom: 40, textAlign: "center" }}>
          <span className="eyebrow2">Pricing</span>
          <h1 className="disp" style={{ fontSize: "clamp(34px,5vw,56px)", marginTop: 20, lineHeight: 1.05 }}>One price. Every market. Two months free on annual.</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.72)", margin: "18px auto 0" }}>14-day free trial on every plan. No card to start. Cancel monthly plans any time.</p>
          <div className="ptoggle" style={{ justifyContent: "center", display: "flex" }}>
            <span style={{ fontWeight: 600, color: annual ? "rgba(255,255,255,.6)" : "#fff" }}>Monthly</span>
            <button className={"sw" + (annual ? " on" : "")} onClick={() => setAnnual(a => !a)} aria-label="Toggle annual billing"><i /></button>
            <span style={{ fontWeight: 600, color: annual ? "#fff" : "rgba(255,255,255,.6)" }}>Annual <span style={{ color: "#67E8F9", fontSize: 13 }}>· 12 months for the price of {ANNUAL_MONTHS}</span></span>
            <button className="btn-dark-ghost" style={{ padding: "6px 12px", fontSize: 12.5, marginLeft: 10 }} onClick={() => setCur(c => c === "USD" ? "INR" : "USD")}>{cur === "USD" ? "₹ INR" : "$ USD"}</button>
          </div>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 10 }}>
        <div className="plans2" style={{ marginTop: -10 }}>
          {Object.entries(PLANS).map(([k, p], i) => {
            const perMonth = annual ? Math.round(price(p, cur, "annual") / 12) : price(p, cur, "monthly");
            return (
              <div key={k} className={"plan2 rv d" + i + (p.hot ? " hot" : "")}>
                {p.hot && <div className="tag">Most popular</div>}
                <div className="pn">{p.name}</div>
                <div className="pp2">{fmt(perMonth, cur)}<small>/mo</small></div>
                <div style={{ fontSize: 12.5, color: p.hot ? "rgba(255,255,255,.6)" : "var(--ink-3)" }}>{annual ? `${fmt(price(p, cur, "annual"), cur)} billed yearly` : "billed monthly"}</div>
                <div className="desc">{p.desc}</div>
                <ul>{p.perks.map(x => <li key={x}>{x}</li>)}</ul>
                <a className={"btn " + (p.hot ? "" : "btn-primary")} href={`/signup?plan=${k}&cycle=${cycle}`}>Start 14-day trial</a>
              </div>
            );
          })}
        </div>
        <div className="grid3" style={{ marginTop: 40 }}>
          {[["What counts as a keyword?", "One phrase, tracked in every country on your plan. 50 keywords in 2 countries = 100 positions a month."],
            ["Can I change plans?", "Any time. Upgrades apply immediately; downgrades at the next renewal. Keywords above the new limit are paused, not deleted."],
            ["Do you charge per user?", "No. Invite your whole team. Scale includes up to 10 sites under one login."],
            ["GST and invoices?", "Indian customers are billed in INR with GST invoices. Everyone else is billed in USD. Annual plans get a single invoice."],
            ["Refunds?", "Monthly plans: cancel any time, no refund for the current month. Annual plans: full refund within 14 days of the first charge."],
            ["Need more?", "More than 1,000 keywords, more than 10 sites, or an API? Email hello@rankpulse.app and we'll quote."]].map(([t, d], i) => <div key={t} className={"fc rv d" + (i % 3)}><h3 style={{ marginTop: 0, fontSize: 15.5 }}>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>
      <CTA title="Start free. Decide in 14 days." sub="Every plan starts with a full-featured trial. If it doesn't earn its place in your first-of-the-month routine, walk away." />
      <Footer />
    </>
  );
}
