"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { sb } from "../../lib/supabase";
import { PLANS } from "../../lib/plans";

function SignUpInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const planKey = PLANS[sp.get("plan")] ? sp.get("plan") : "growth";
  const plan = PLANS[planKey];
  const [f, setF] = useState({ company: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    const { data, error } = await sb().auth.signUp({ email: f.email.trim(), password: f.password, options: { data: { company: f.company.trim(), intended_plan: planKey } } });
    setBusy(false);
    if (error) return setErr(error.message);
    if (data.session) router.replace("/onboarding"); else setSent(true);
  }

  return (
    <div className="band" style={{ minHeight: "100vh" }}>
      <div className="orb a" /><div className="orb b" />
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 22px", display: "grid", gridTemplateColumns: "1fr 440px", gap: 48, alignItems: "center", minHeight: "100vh" }} className="signup-grid">
        <div style={{ color: "#fff" }}>
          <a className="brand" href="/" style={{ color: "#fff" }}><div className="mark">R</div>RankPulse</a>
          <h1 className="disp" style={{ fontSize: "clamp(30px,4vw,46px)", marginTop: 34, lineHeight: 1.08, maxWidth: "16ch" }}>Your real positions, in every market, by this time tomorrow.</h1>
          <ul className="check" style={{ marginTop: 24 }}>
            {["14 days free on every feature of the " + plan.name + " plan", "No card. Nothing charged unless you choose a plan", "First scan runs within 30 minutes of adding keywords", "Your data stays yours — export or delete any time"].map(x => <li key={x} className="ok" style={{ color: "rgba(255,255,255,.82)" }}>{x}</li>)}
          </ul>
          <div className="card2" style={{ marginTop: 30, padding: 18, background: "rgba(255,255,255,.05)", borderColor: "rgba(255,255,255,.1)" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A5B4FC" }}>Starting on {plan.name}</div>
            <div style={{ marginTop: 6, fontSize: 14, color: "rgba(255,255,255,.75)" }}>{plan.keywords} keywords · {plan.regions} countries{plan.aeo ? " · AI-search tracking" : ""}. Change plans any time. <a href="/pricing" style={{ color: "#C7D2FE" }}>Compare plans</a></div>
          </div>
        </div>
        <div className="card pad" style={{ background: "var(--paper)" }}>
          {sent ? (<>
            <h2 style={{ fontSize: 20 }}>Check your email</h2>
            <p style={{ color: "var(--ink-2)", marginTop: 10 }}>We sent a confirmation link to <b>{f.email}</b>. Click it, then sign in.</p>
            <a className="btn btn-ghost" href="/login" style={{ display: "inline-block", marginTop: 14 }}>Go to sign in</a>
          </>) : (<>
            <h2 style={{ fontSize: 22 }}>Create your account</h2>
            <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "6px 0 20px" }}>Takes 30 seconds. Keywords next.</p>
            <form onSubmit={submit}>
              <div className="field"><label>Company</label><input value={f.company} onChange={set("company")} required placeholder="Acme Travel" autoFocus /></div>
              <div className="field"><label>Work email</label><input type="email" value={f.email} onChange={set("email")} required placeholder="you@acme.com" /></div>
              <div className="field"><label>Password</label><input type="password" value={f.password} onChange={set("password")} required minLength={8} placeholder="At least 8 characters" /></div>
              {err && <div className="note bad" style={{ marginBottom: 14 }}>{err}</div>}
              <button className="btn btn-primary" style={{ width: "100%", padding: 12, fontSize: 15 }} disabled={busy}>{busy ? "Creating…" : "Start my free trial →"}</button>
            </form>
            <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--ink-3)" }}>Already have an account? <a href="/login">Sign in</a></p>
            <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-3)", marginTop: 4 }}>By continuing you agree to our terms. We never share your keywords.</p>
          </>)}
        </div>
      </div>
      <style>{`@media(max-width:860px){.signup-grid{grid-template-columns:1fr!important;min-height:auto!important}}`}</style>
    </div>
  );
}

export default function SignUp() {
  return <Suspense fallback={null}><SignUpInner /></Suspense>;
}
