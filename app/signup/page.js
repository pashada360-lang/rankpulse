"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";

export default function SignUp() {
  const router = useRouter();
  const [f, setF] = useState({ company: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sent, setSent] = useState(false);

  const set = k => e => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const { data, error } = await sb().auth.signUp({
      email: f.email.trim(),
      password: f.password,
      options: { data: { company: f.company.trim() } },
    });
    setBusy(false);
    if (error) return setErr(error.message);
    // If email confirmation is off, we get a session straight away.
    if (data.session) router.replace("/onboarding");
    else setSent(true);
  }

  if (sent) return (
    <div className="center">
      <div className="brand" style={{ marginBottom: 26 }}><div className="mark">R</div>RankPulse</div>
      <div className="card pad">
        <h2 style={{ fontSize: 20 }}>Check your email</h2>
        <p style={{ color: "var(--ink-2)", marginTop: 10 }}>
          We sent a confirmation link to <b>{f.email}</b>. Click it, then sign in.
        </p>
        <a className="btn btn-ghost" href="/login" style={{ display: "inline-block", marginTop: 14 }}>Go to sign in</a>
      </div>
    </div>
  );

  return (
    <div className="center">
      <div className="brand" style={{ marginBottom: 26 }}><div className="mark">R</div>RankPulse</div>
      <div className="card pad">
        <h2 style={{ fontSize: 21 }}>Start tracking</h2>
        <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: "6px 0 22px" }}>
          14 days free. No card needed.
        </p>
        <form onSubmit={submit}>
          <div className="field">
            <label>Company</label>
            <input value={f.company} onChange={set("company")} required placeholder="Acme Travel" />
          </div>
          <div className="field">
            <label>Work email</label>
            <input type="email" value={f.email} onChange={set("email")} required placeholder="you@acme.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={f.password} onChange={set("password")} required minLength={8} placeholder="At least 8 characters" />
          </div>
          {err && <div className="note bad" style={{ marginBottom: 14 }}>{err}</div>}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
      </div>
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "var(--ink-3)" }}>
        Already have an account? <a href="/login">Sign in</a>
      </p>
    </div>
  );
}
