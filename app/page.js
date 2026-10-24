"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../lib/supabase";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    sb().auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
      else setChecking(false);
    });
  }, [router]);

  if (checking) return null;

  return (
    <>
      <nav className="nav"><div className="nav-in">
        <div className="brand"><div className="mark">R</div>RankPulse</div>
        <div className="spacer" />
        <a className="btn btn-ghost" href="/login">Sign in</a>
        <a className="btn btn-primary" href="/signup">Start free</a>
      </div></nav>

      <div className="wrap" style={{ paddingTop: 72, paddingBottom: 80, maxWidth: 760 }}>
        <h1 style={{ fontSize: "clamp(32px,5vw,50px)", fontWeight: 800 }}>
          Know exactly where you rank — and whether AI is citing you.
        </h1>
        <p style={{ fontSize: 19, color: "var(--ink-2)", marginTop: 18, maxWidth: "58ch" }}>
          Add your keywords once. RankPulse measures your position on Google from real IP
          addresses in each country you sell to, every month, and shows you what moved.
        </p>

        <div style={{ display: "flex", gap: 11, marginTop: 28, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="/signup" style={{ padding: "12px 22px", fontSize: 15 }}>
            Start free — 14 days
          </a>
          <a className="btn btn-ghost" href="/login" style={{ padding: "12px 22px", fontSize: 15 }}>
            Sign in
          </a>
        </div>

        <div className="kpis" style={{ marginTop: 52 }}>
          <div className="kpi"><div className="l">Real positions</div><div className="v">1–10</div><div className="s">page one only, no estimates</div></div>
          <div className="kpi"><div className="l">Countries</div><div className="v">4+</div><div className="s">measured from in-country IPs</div></div>
          <div className="kpi"><div className="l">History</div><div className="v">∞</div><div className="s">every month kept, never overwritten</div></div>
        </div>

        <div className="note info" style={{ marginTop: 34 }}>
          <b>Why your own Google results mislead you.</b> Signed in, on a site you visit daily,
          Google promotes your own pages — so you see positions your customers never get.
          RankPulse measures with no cookies and no history: what a stranger actually sees.
        </div>
      </div>
    </>
  );
}
