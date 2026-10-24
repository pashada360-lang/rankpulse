"use client";

export default function ErrorPage({ error, reset }) {
  const setup = /not configured|SUPABASE/i.test(error?.message || "");
  return (
    <div className="center" style={{ maxWidth: 560 }}>
      <div className="brand" style={{ marginBottom: 24 }}><div className="mark">R</div>RankPulse</div>
      <div className="card pad">
        <h2 style={{ fontSize: 20 }}>{setup ? "Almost there — one setting missing" : "Something went wrong"}</h2>
        <p style={{ color: "var(--ink-2)", marginTop: 10, fontSize: 14.5 }}>
          {error?.message || "An unexpected error occurred."}
        </p>

        {setup && (
          <div className="note info" style={{ marginTop: 18, fontSize: 13 }}>
            <b>How to fix it</b>
            <ol style={{ margin: "8px 0 0", paddingLeft: 18, lineHeight: 1.85 }}>
              <li>Vercel → your project → <b>Settings → Environment Variables</b></li>
              <li>Add <span className="mono">NEXT_PUBLIC_SUPABASE_URL</span> and <span className="mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> (and <span className="mono">SUPABASE_SERVICE_KEY</span>)</li>
              <li>Set them for <b>Production</b>, <b>Preview</b> and <b>Development</b></li>
              <li><b>Deployments → ⋯ → Redeploy</b> — values are compiled in, so a rebuild is required</li>
            </ol>
          </div>
        )}

        <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => reset()}>
          Try again
        </button>
      </div>
    </div>
  );
}
