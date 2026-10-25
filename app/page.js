"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb, configured } from "../lib/supabase";
import { PLANS, price, fmt, guessCurrency } from "../lib/plans";
import { Nav, Footer, CTA, useReveal } from "../components/Site";
import DashboardMock from "../components/DashboardMock";
import { MockAI, MockOpps, MockFix } from "../components/Mocks";

import Flag from "../components/Flag";
import EngineLogo, { EngineRow } from "../components/EngineLogo";
/* each word animates in; the gradient is applied per word so background-clip survives the inline-block */
const Words = ({ text, from = 0, hl = false }) => text.split(" ").map((w, i) => <span key={i} className={"hw" + (hl ? " hl" : "")} style={{ animationDelay: (from + i) * 70 + "ms" }}>{w}&nbsp;</span>);
/* tiny stroke glyphs for feature cards — drawn, never emoji */
const Glyph = ({ children }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
/* one engine chip in the hero: real mark + name. Rendered flat (img + text) because .engines styles every nested span as a chip. */
const EngineChip = ({ engine, name }) => <span className="e" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><EngineLogo engine={engine} size={16} dark />{name}</span>;

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cur, setCur] = useState("USD");
  useEffect(() => {
    setCur(guessCurrency());
    if (!configured) return setReady(true);
    sb().auth.getSession().then(({ data }) => data.session ? router.replace("/dashboard") : setReady(true));
  }, [router]);
  useReveal(ready);
  if (!ready) return null;

  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <div className="band">
        <div className="orb a" /><div className="orb b" />
        <Nav dark />
        <section className="hero2">
          <div>
            <span className="eyebrow2"><span className="dot" style={{ background: "var(--copper)" }} />Rank tracking · every market</span>
            <h1 style={{ marginTop: 20 }}><Words text="Know where you rank." /><br /><Words text="Everywhere. Every month." from={4} hl /></h1>
            <p className="lead">Real Google positions from inside each country, and whether ChatGPT, Perplexity, Gemini and Claude recommend you. One grid. No estimates.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
              <a className="btn-glow" href="/signup">Start free — 14 days</a>
              <a className="btn-dark-ghost" href="#tour">See the product</a>
            </div>
            <div className="engines"><span className="lab">Measured on</span><EngineChip engine="google" name="Google" /><EngineChip engine="chatgpt" name="ChatGPT" /><EngineChip engine="perplexity" name="Perplexity" /><EngineChip engine="gemini" name="Gemini" /><EngineChip engine="claude" name="Claude" /></div>
          </div>
          <div className="hero-wrap">
            <DashboardMock size="lg" />
            <div className="callout c1"><span className="big">#1</span>in 4 markets</div>
            <div className="callout c2"><span className="big">8→23</span>top-3 placements, one month</div>
            <div className="callout c3"><span className="big">65%</span><span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>cited by <EngineLogo engine="perplexity" size={14} />Perplexity</span></div>
          </div>
        </section>
      </div>

      {/* ═══════════ PROOF ═══════════ */}
      <section className="sec tight">
        <div className="proof rv">
          <div><div className="n">145</div><div className="l">keywords tracked across four markets to build this. The numbers on this page are ours.</div></div>
          <div><div className="n">8→23</div><div className="l">top-three placements gained in one month from the fix list.</div></div>
          <div><div className="n">4 of 8</div><div className="l">AI crawlers we found blocked on our own site. Invisible to Gemini for months.</div></div>
          <div><div className="n">≈$1</div><div className="l">cost of a full four-market scan. Plans start at $29.</div></div>
        </div>
      </section>

      {/* ═══════════ THE PROBLEM ═══════════ */}
      <section className="sec">
        <div className="split">
          <div className="rv"><span className="kick">The problem</span><h2>Your own Google results lie to you.</h2>
            <p className="sub">Signed in, on a site you open daily, Google promotes your pages to you — and only you. Teams see a #1 their buyers never get, then wonder why leads dropped.</p>
            <p className="sub">RankPulse measures with no cookies, no history, no sign-in, from inside the buyer's country. The real page one.</p></div>
          <div className="card2 rv d1" style={{ padding: 26 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 8 }}><Flag code="IN" size={20} />Same keyword · same day · India</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              <div style={{ background: "var(--paper-2)", borderRadius: 12, padding: 18 }}><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>Founder, signed in</div><div className="mono" style={{ fontSize: 48, fontWeight: 700, color: "var(--up)" }}>#1</div></div>
              <div style={{ background: "var(--down-bg)", borderRadius: 12, padding: 18 }}><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>Buyer, incognito</div><div className="mono" style={{ fontSize: 48, fontWeight: 700, color: "var(--down)" }}>—</div></div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 14, marginBottom: 0 }}>Real case. Indexed, live, ranking for nobody but its owner.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ PRODUCT TOUR ═══════════ */}
      <section className="sec" id="tour" style={{ background: "var(--paper-2)", maxWidth: "none" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="rv" style={{ textAlign: "center", maxWidth: 680, margin: "0 auto 10px" }}><span className="kick">The product</span><h2 style={{ margin: "0 auto" }}>Four views. One honest answer a month.</h2></div>

          <div className="tour">
            <div className="rv"><h3>Positions by month and market, from the day you join.</h3>
              <p>Your first scan is the baseline. A new column every month. Nothing overwritten, nothing estimated.</p>
              <ul className="pts"><li>Page one only — 11 and 80 both mean nobody found you</li><li>Failed checks marked unmeasured, never counted as a loss</li><li>Click any keyword for every market, every month</li></ul></div>
            <div className="rv d1"><DashboardMock /></div>
          </div>

          <div className="tour flip">
            <div className="rv"><h3>Is AI recommending you, or a competitor?</h3>
              <p>Real buyer questions put to ChatGPT, Perplexity, Gemini and Claude. We record who gets cited — by engine and by stage of the buying journey.</p>
              <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: "var(--ink-2)" }}><EngineRow size={16} dark={false} names gap={14} /></div>
              <ul className="pts"><li>Citation rate per engine on identical questions</li><li>Strength by funnel stage — see exactly where you're invisible</li><li>Share of voice: the domains each engine trusts</li></ul></div>
            <div className="rv d1"><MockAI /></div>
          </div>

          <div className="tour">
            <div className="rv"><h3>Keywords you should own, and who holds them now.</h3>
              <p>Every scan expands your list from real searches, drops what you track, and checks the rest against live page one. A build list, not a wish list.</p>
              <ul className="pts"><li>Real demand only — phrases people actually type</li><li>Quick wins: keywords you rank for without a page</li><li>Who owns page one, ranked by slots held</li></ul></div>
            <div className="rv d1"><MockOpps /></div>
          </div>

          <div className="tour flip">
            <div className="rv"><h3>What to fix, in the order it pays back.</h3>
              <p>Pages that rank but never get cited come first — already written, just not answer-shaped. Then create, reclaim, defend. And the robots.txt line that quietly blocks you.</p>
              <ul className="pts"><li>Crawler-access audit on day one and every month</li><li>Do / don't rules applied to your pages</li><li>Ranked by expected return</li></ul></div>
            <div className="rv d1"><MockFix /></div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="sec">
        <div className="rv"><span className="kick">Built from scars</span><h2>Every false signal a rank tracker can give — fixed before you see it.</h2></div>
        <div className="grid3">
          {[[<span key="f" style={{ display: "inline-flex", gap: 3 }}><Flag code="IN" size={14} /><Flag code="AE" size={14} /></span>, "In-country positions", "Dubai and Delhi get different page ones. We measure from both — real IPs, not a proxy guess."],
            [<Glyph key="g"><rect x="3" y="3" width="18" height="18" rx="2.5" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></Glyph>, "Blocks, not links", "Sitelinks inflate naive counts: a real #2 logs as #6. We count results the way a person reads them."],
            [<Glyph key="p"><path d="M2.5 12h4l3-7 4.5 14 3-7h4.5" /></Glyph>, "Unmeasured ≠ not ranking", "A failed search is marked and retried, never recorded as zero. Your trend can't fake a crisis."],
            [<Glyph key="c"><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2.2 5.3-5.3 2.2 2.2-5.3z" /></Glyph>, "Who holds the spot", "Every keyword, every month, the ten domains on page one. Who took your position is one click away."],
            [<span key="a" style={{ display: "inline-flex", gap: 3 }}><EngineLogo engine="gemini" size={16} /><EngineLogo engine="chatgpt" size={16} /></span>, "Crawler audit", "One robots.txt line can block Gemini and ChatGPT entirely. Checked at signup and every month after."],
            [<Glyph key="l"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2.5h6V4M9 11h6M9 15h4" /></Glyph>, "Fix list by payoff", "Rank-but-not-cited pages first. Then create, reclaim, defend — with do / don't rules per page."]].map(([ic, t, d], i) => <div key={t} className={"fc rv d" + (i % 3)}><div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p></div>)}
        </div>
        <div style={{ marginTop: 22 }}><a href="/features" style={{ fontWeight: 650 }}>All features →</a><span style={{ color: "var(--ink-3)", margin: "0 10px" }}>·</span><a href="/compare" style={{ fontWeight: 650 }}>vs Ahrefs and Semrush →</a></div>
      </section>

      {/* ═══════════ HOW ═══════════ */}
      <section className="sec" id="how" style={{ paddingTop: 0 }}>
        <div className="rv"><span className="kick">How it works</span><h2>Three minutes to set up. Results the same hour.</h2></div>
        <div className="grid3">
          {[["1", "Add your site", "Domain, what you sell, the markets you sell to, the phrases a buyer types when choosing you."],
            ["2", "We measure", "Each keyword searched from inside each country. Each buyer question put to five AI engines."],
            ["3", "You read one banner", "What moved, where, and what to do about it. A new column every month, on its own."]].map(([n, t, d], i) => <div key={n} className={"fc rv d" + i}><div className="ic" style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{n}</div><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="sec" id="pricing" style={{ paddingTop: 10 }}>
        <div className="rv"><span className="kick">Pricing</span><h2>Simple plans. Two months free on annual.</h2>
          <p className="sub">All markets, full history, automatic monthly scans on every plan. 14 days free, no card.</p></div>
        <div className="plans2">
          {Object.entries(PLANS).map(([k, p], i) => (
            <div key={k} className={"plan2 rv d" + i + (p.hot ? " hot" : "")}>
              {p.hot && <div className="tag">Most popular</div>}
              <div className="pn">{p.name}</div>
              <div className="pp2">{fmt(price(p, cur, "monthly"), cur)}<small>/mo</small></div>
              <div className="desc">{p.desc}</div>
              <ul>{p.perks.slice(0, 4).map(x => <li key={x}>{x}</li>)}</ul>
              <a className={"btn " + (p.hot ? "" : "btn-ghost")} href={`/signup?plan=${k}`}>Start 14-day trial</a>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/pricing" style={{ fontWeight: 650 }}>Full pricing →</a>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setCur(c => c === "USD" ? "INR" : "USD")}>Show in {cur === "USD" ? "INR" : "USD"}</button>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="sec tight">
        <div className="rv"><h2 style={{ fontSize: 30 }}>Before you sign up</h2></div>
        <div className="acc rv">
          {[["Why do I see a better position when I search myself?", "Google personalises results for signed-in users and boosts sites you visit often. Open an incognito window and you'll see what RankPulse sees — and what your buyers see."],
            ["Do you really ask ChatGPT and the others?", "Yes. Each buyer question is put to ChatGPT, Perplexity, Gemini, Claude and Google AI Overview every month, and we record which sources each answer cites. Measured, not modelled."],
            ["Why page one only?", "Position 11 and position 80 both mean nobody found you. Tracking beyond the top ten adds noise and invites celebrating movement that changes nothing."],
            ["How is this different from Ahrefs or Semrush?", "They estimate from a crawl and charge for a thousand things you won't open. We run the actual search from the actual country, measure AI citations, and keep one grid."],
            ["What does “not measured” mean?", "A search that failed to return a readable page. We mark it and retry. It is never counted as a loss."],
            ["What happens after the trial?", "Your data stays. Scans pause until you pick a plan. Nothing is deleted."]].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <CTA title="Know where you stand by this time tomorrow." sub="Three minutes to set up. Real positions from every market, within the hour. No card." />
      <Footer />
    </>
  );
}
