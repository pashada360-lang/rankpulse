"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sb } from "../../lib/supabase";

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
    <div className="center">
      <div className="brand" style={{ marginBottom: 26 }}><div className="mark">R</div>RankPulse</div>
      <div className="card pad">
        <h2 style={{ fontSize: 21 }}>Sign in</h2>
        <form onSubmit={submit} style={{ marginTop: 20 }}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={f.email} onChange={set("email")} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={f.password} onChange={set("password")} required />
          </div>
          {err && <div className="note bad" style={{ marginBottom: 14 }}>{err}</div>}
          <button className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13.5, color: "var(--ink-3)" }}>
        New here? <a href="/signup">Create an account</a>
      </p>
    </div>
  );
}
