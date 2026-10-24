"use client";
import { Nav, Footer, CTA, useReveal } from "../../components/Site";
import { DO_DONT } from "../../lib/aeo-rules";

export default function AEO() {
  useReveal();
  return (
    <>
      <div className="band"><div className="orb a" /><div className="orb b" /><Nav dark />
        <div className="sec" style={{ color: "#fff", paddingTop: 60 }}>
          <span className="eyebrow2">AI-search visibility · AEO</span>
          <h1 className="disp" style={{ fontSize: "clamp(34px,5vw,60px)", marginTop: 20, maxWidth: "17ch", lineHeight: 1.04 }}>When a buyer asks ChatGPT, is your site the answer?</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.72)" }}>Rank trackers measure a channel that's shrinking. RankPulse measures the one that's growing: whether AI assistants cite you when real buyers ask real questions — and exactly what to change when they don't.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}><a className="btn-glow" href="/signup?plan=growth">Start free on Growth</a><a className="btn-dark-ghost" href="#method">See the method</a></div>
        </div>
      </div>

      <section className="sec" id="method">
        <div className="split">
          <div className="rv"><span className="kick">Why keywords are the wrong unit</span><h2>Nobody types “hotel booking api” into an assistant.</h2>
            <p className="sub">They ask “what's the best hotel API for a startup in India?” So we don't track keywords in AI engines. We write buyer questions across eight funnel stages — problem-aware, category education, vendor evaluation, comparison, integration, implementation, pricing, brand — and put each one to every engine, monthly.</p>
            <p className="sub">The output isn't a rank. It's a citation rate per engine and per stage, plus the list of who got cited instead. That's the number a content team can act on.</p></div>
          <div className="card2 rv d1" style={{ padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" }}>Citation rate by funnel stage · real example</div>
            {[["Vendor evaluation", 100], ["Comparison", 88], ["Brand", 100], ["Category education", 43], ["Supplier integration", 25], ["Problem-aware", 0], ["Pricing", 0]].map(([s, p]) => (
              <div key={s} style={{ display: "grid", gridTemplateColumns: "160px 1fr 44px", gap: 12, alignItems: "center", marginTop: 12, fontSize: 13.5 }}>
                <span style={{ fontWeight: 600 }}>{s}</span>
                <span style={{ height: 8, background: "var(--paper-3)", borderRadius: 4, overflow: "hidden" }}><i style={{ display: "block", height: "100%", width: p + "%", background: p >= 50 ? "var(--up)" : p >= 25 ? "var(--warn)" : "var(--down)", borderRadius: 4 }} /></span>
                <span className="mono" style={{ textAlign: "right", fontWeight: 700 }}>{p}%</span>
              </div>
            ))}
            <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 16, marginBottom: 0 }}>Strong where buyers compare vendors, invisible where they first describe the problem. That shape tells you exactly what to write next.</p>
          </div>
        </div>
      </section>

      <section className="sec" style={{ background: "var(--paper-2)", maxWidth: "none" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="rv"><span className="kick">The fix list</span><h2>Every gap, ranked by what it will return.</h2>
            <p className="sub">We cross-reference your Google rankings with your AI citations and sort every question into one of five actions.</p></div>
          <div className="grid3">
            {[
              ["Format fix", "var(--down)", "You rank on Google page one but no engine cites you. The content exists — it's just not shaped like an answer. Cheapest win there is."],
              ["Create", "var(--warn)", "No ranking, no citation. The page doesn't exist. These are the articles to write next, in order of search demand."],
              ["Citation fix", "var(--warn)", "Engines name your brand in the answer but link to someone else. You have the recognition and are losing the click."],
              ["Extend", "var(--accent-ink)", "Some engines cite you, others don't. We show which sources the missing engines quote, so you can get onto them."],
              ["Defend", "var(--up)", "Cited by three or more engines. Keep these fresh — quarterly refresh, visible dates, updated numbers."],
              ["Crawler access", "var(--down)", "A robots.txt that blocks GPTBot, Google-Extended or CCBot makes everything above pointless. Checked on day one and every month."],
            ].map(([t, c, d], i) => <div key={t} className={"fc rv d" + (i % 3)}><h3 style={{ marginTop: 0, color: c }}>{t}</h3><p>{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="rv"><span className="kick">Do / don't</span><h2>The rules that decide whether you get quoted.</h2>
          <p className="sub">These are applied to your actual pages inside the product. They matter more than word count, and most content teams get half of them backwards.</p></div>
        <div className="grid2">
          <div className="card2 rv" style={{ padding: 24 }}><h3 style={{ color: "var(--up)", fontSize: 16 }}>Do</h3>
            <ul className="check">{DO_DONT.do.map(x => <li key={x.t} className="ok"><span><b>{x.t}.</b> {x.d}</span></li>)}</ul></div>
          <div className="card2 rv d1" style={{ padding: 24 }}><h3 style={{ color: "var(--down)", fontSize: 16 }}>Don't</h3>
            <ul className="check">{DO_DONT.dont.map(x => <li key={x.t} className="no"><span><b>{x.t}.</b> {x.d}</span></li>)}</ul></div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="card2 rv" style={{ padding: 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div><h3 style={{ fontSize: 20 }}>The ten-minute fix most sites need first</h3>
            <p style={{ color: "var(--ink-2)", marginTop: 8, maxWidth: "70ch" }}>Many sites block <span className="mono">GPTBot</span>, <span className="mono">Google-Extended</span> and <span className="mono">CCBot</span> in robots.txt — often added by a plugin, never reviewed. Blocking them protects nothing: your pages are already public and indexed by Google Search. It only stops AI assistants from crediting you. RankPulse checks this the moment you sign up, free, on every plan.</p></div>
          <a className="btn btn-primary" href="/signup" style={{ whiteSpace: "nowrap" }}>Check my robots.txt →</a>
        </div>
      </section>

      <CTA title="Find out who AI is recommending instead of you." sub="Growth plan includes AI-search tracking across four engines. 14 days free, no card." />
      <Footer />
    </>
  );
}
