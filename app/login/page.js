"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";
import { EngineRow } from "../../components/EngineLogo";

const POINTS = [
  "Real positions, from an IP inside each country you sell to",
  "What moved since last month, on every keyword",
  "Whether AI assistants recommend you when buyers ask",
];

export default function Login() {
  const router = useRouter();
  const [f, setF] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { error } = await sb().auth.signInWithPassword({
      email: f.email.trim(), password: f.password,
    });
    setBusy(false);
    if (error) return setErr(error.message);

    // Send them to onboarding if they have no site yet.
    const { data: sites } = await sb().from("sites").select("id").limit(1);
    router.replace(sites && sites.length ? "/dashboard" : "/onboarding");
  }

  return (
    <div className="band" style={{ minHeight: "100vh" }}>
      <div className="orb a" /><div className="orb b" />
      <div className="signup-grid" style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 22px", display: "grid", gridTemplateColumns: "1fr 440px", gap: 48, alignItems: "center", minHeight: "100vh" }}>
        <div style={{ color: "#fff" }}>
          <a className="brand" href="/" style={{ color: "#fff" }}><div className="mark">R</div>RankPulse</a>
          <h1 className="disp" style={{ fontSize: "clamp(30px,4vw,46px)", marginTop: 34, lineHeight: 1.08, maxWidth: "16ch" }}>See what moved this month.</h1>
          <ul className="check" style={{ marginTop: 24 }}>
            {POINTS.map(x => <li key={x} className="ok" style={{ color: "rgba(255,255,255,.82)" }}>{x}</li>)}
          </ul>
          <div style={{ marginTop: 30 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "#A5B4FC" }}>Measured on</div>
            <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 600, color: "rgba(255,255,255,.85)" }}><EngineRow dark names size={16} gap={16} /></div>
          </div>
        </div>
        <div className="card pad" style={{ background: "#fff", color: "#15172B" }}>
          <h2 style={{ fontSize: 22 }}>Sign in</h2>
          <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "6px 0 20px" }}>Pick up where you left off.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={f.email} onChange={set("email")} required placeholder="you@acme.com" autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={f.password} onChange={set("password")} required />
            </div>
            {err && <div className="note bad" style={{ marginBottom: 14 }}>{err}</div>}
            <button className="btn btn-primary" style={{ width: "100%", padding: 12, fontSize: 15 }} disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--ink-3)" }}>
            New here? <a href="/signup">Create an account</a>
          </p>
        </div>
      </div>
      <style>{`@media(max-width:860px){.signup-grid{grid-template-columns:1fr!important;min-height:auto!important}}`}</style>
    </div>
  );
}
