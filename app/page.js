"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb, configured } from "../lib/supabase";
import { PLANS, price, fmt, guessCurrency } from "../lib/plans";
import { Nav, Footer, CTA, useReveal } from "../components/Site";
import DashboardMock from "../components/DashboardMock";
import { MockAI, MockOpps, MockFix } from "../components/Mocks";

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
        <section className="hero2" style={{ paddingBottom: 80 }}>
          <div>
            <span className="eyebrow2"><span className="dot" style={{ background: "#67E8F9" }} />Google positions · AI citations · every month</span>
            <h1 style={{ marginTop: 22 }}>See exactly where your brand ranks — <span className="hl">and who AI recommends instead.</span></h1>
            <p className="lead">RankPulse checks your Google position from a real IP in each country you sell to, asks ChatGPT, Perplexity, Gemini and Claude the questions your buyers ask, and shows you — month by month — what moved and what to fix.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
              <a className="btn-glow" href="/signup">Start free — 14 days</a>
              <a className="btn-dark-ghost" href="#tour">See the product</a>
            </div>
            <div className="note-sm">No card · first results within the hour · cancel any time</div>
            <div className="engines"><span>Google</span><span>ChatGPT</span><span>Perplexity</span><span>Gemini</span><span>Claude</span></div>
          </div>
          <div className="hero-wrap">
            <DashboardMock />
            <div className="callout c1"><span className="big">#1</span>hotel api aggregator · 4 markets</div>
            <div className="callout c2"><span className="big">8→23</span>top-3 placements in one month</div>
            <div className="callout c3"><span className="big">65%</span>cited by Perplexity</div>
          </div>
        </section>
      </div>

      {/* ═══════════ PROOF ═══════════ */}
      <section className="sec tight" style={{ paddingTop: 48 }}>
        <div className="proof rv">
          <div><div className="n">145</div><div className="l">keywords tracked across 4 markets for 3 months to build this — the numbers on this page are ours</div></div>
          <div><div className="n">8→23</div><div className="l">top-3 placements gained in a single month after acting on the fix list</div></div>
          <div><div className="n">4 of 8</div><div className="l">AI crawlers we found blocked on our own site — invisible to Gemini for months without knowing</div></div>
          <div><div className="n">≈$1</div><div className="l">what a full four-market monthly scan costs to run, so plans start at $29</div></div>
        </div>
      </section>

      {/* ═══════════ THE PROBLEM ═══════════ */}
      <section className="sec">
        <div className="split">
          <div className="rv"><span className="kick">The problem</span><h2>Your own Google results are lying to you.</h2>
            <p className="sub">Signed in, on a site you visit every day, Google quietly promotes your own pages. Teams routinely “see” a #1 their customers never get — then wonder why leads dropped. We found an <b>eight-place gap</b> between what a founder saw and what a buyer saw, on the keyword that mattered most.</p>
            <p className="sub">RankPulse measures with no cookies, no history, no sign-in — from the country your buyer is actually in. Not an estimate from a crawl. The real page one.</p></div>
          <div className="card2 rv d1" style={{ padding: 26 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" }}>Same keyword · same day · India</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              <div style={{ background: "var(--paper-2)", borderRadius: 12, padding: 18 }}><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>What the founder saw</div><div className="mono" style={{ fontSize: 46, fontWeight: 700, color: "var(--up)" }}>#1</div><div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>signed in · daily visitor</div></div>
              <div style={{ background: "var(--down-bg)", borderRadius: 12, padding: 18 }}><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>What a buyer saw</div><div className="mono" style={{ fontSize: 46, fontWeight: 700, color: "var(--down)" }}>—</div><div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>not on page one</div></div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 16, marginBottom: 0 }}>Real case from our own tracking. The page existed, was indexed, and ranked for nobody but its owner.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ PRODUCT TOUR ═══════════ */}
      <section className="sec" id="tour" style={{ background: "var(--paper-2)", maxWidth: "none" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="rv" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 20px" }}><span className="kick">The product</span><h2 style={{ margin: "0 auto" }}>Four views. Everything a marketing lead opens on the first of the month.</h2></div>

          <div className="tour">
            <div className="rv"><h3>Positions by month, by country, from the day you join.</h3>
              <p>Your first scan is your baseline column. Every month after, a new one is added — nothing overwritten, nothing estimated. Results stream in while the scan runs.</p>
              <ul className="pts"><li>Page one only — 11 and 80 both mean nobody found you</li><li>Failed checks marked unmeasured, never counted as a loss</li><li>Click any keyword for every region and every month</li></ul></div>
            <div className="rv d1"><DashboardMock /></div>
          </div>

          <div className="tour flip">
            <div className="rv"><h3>Is AI recommending you — or a competitor?</h3>
              <p>Real buyer questions, not keywords, put to ChatGPT, Perplexity, Gemini and Claude every month. We record whether you're cited, where you rank among sources, and who gets cited instead.</p>
              <ul className="pts"><li>Citation rate per engine on identical questions</li><li>Strength by buyer-journey stage — see where you're invisible</li><li>Share of voice: the domains each engine trusts in your market</li></ul></div>
            <div className="rv d1"><MockAI /></div>
          </div>

          <div className="tour">
            <div className="rv"><h3>Keywords you should own — and who holds them now.</h3>
              <p>Every scan expands your list from real searches, drops what you already track, and checks the best against live page one. You get a build list, not a wish list.</p>
              <ul className="pts"><li>Real demand only — phrases people actually type</li><li>Quick wins: keywords you rank for without a page</li><li>Who owns page one, ranked by slots held</li></ul></div>
            <div className="rv d1"><MockOpps /></div>
          </div>

          <div className="tour flip">
            <div className="rv"><h3>What to fix, in the order it pays back.</h3>
              <p>Pages that rank on Google but never get cited come first — they're already written, just not answer-shaped. Then what to create, what to reclaim, what to defend. And the one robots.txt line that quietly blocks you.</p>
              <ul className="pts"><li>Crawler-access audit on day one, every month after</li><li>Do / don't rules applied to your actual pages</li><li>Ranked by expected return, not alphabetically</li></ul></div>
            <div className="rv d1"><MockFix /></div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="sec">
        <div className="rv"><span className="kick">Built from scars</span><h2>Every false signal a rank tracker can produce — fixed before you see it.</h2></div>
        <div className="grid3">
          {[["🌍", "In-country positions", "A buyer in Dubai sees a different page one than one in Delhi. We measure from both — real IPs, not a proxy guess."],
            ["🧮", "Organic blocks, not links", "Sitelinks inflate naive counts: a real #2 logs as #6. We count results the way a person reads the page."],
            ["🩺", "Unmeasured ≠ not ranking", "A search that fails is marked and retried, never recorded as zero. Your trend line can't show a crisis that didn't happen."],
            ["🧭", "Who holds the spot", "For every keyword, every month, the ten domains on page one. Who took your position is one click away."],
            ["🚫", "Crawler-access audit", "One robots.txt line can block Gemini and ChatGPT entirely. Checked the moment you sign up, and every month after."],
            ["📋", "Fix list, ranked by payoff", "Rank-on-Google-but-not-cited pages first. Then what to create. Then what to defend. With do / don't rules per page."]].map(([ic, t, d], i) => <div key={t} className={"fc rv d" + (i % 3)}><div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p></div>)}
        </div>
        <div style={{ marginTop: 26 }}><a href="/features" style={{ fontWeight: 650 }}>All features →</a> <span style={{ color: "var(--ink-3)", margin: "0 10px" }}>·</span> <a href="/compare" style={{ fontWeight: 650 }}>How it compares to Ahrefs and Semrush →</a></div>
      </section>

      {/* ═══════════ HOW ═══════════ */}
      <section className="sec" id="how" style={{ paddingTop: 0 }}>
        <div className="rv"><span className="kick">How it works</span><h2>Three minutes to set up. Results the same hour.</h2></div>
        <div className="grid3">
          {[["1", "Add your site and keywords", "Your domain, what you sell in a few words, the countries you sell to, and the phrases a buyer types when choosing you."],
            ["2", "We measure from each market", "Every keyword searched on Google through a real in-country IP. Every buyer question put to five AI engines. Page one only."],
            ["3", "Watch what moves", "Positions and citations land on your dashboard. Every month a new column appears. You read one banner and know."]].map(([n, t, d], i) => <div key={n} className={"fc rv d" + i}><div className="ic" style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{n}</div><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="sec" id="pricing" style={{ paddingTop: 10 }}>
        <div className="rv"><span className="kick">Pricing</span><h2>Simple plans. Two months free on annual.</h2>
          <p className="sub">Every plan includes all your countries, full history and automatic monthly scans. 14-day free trial, no card.</p></div>
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
        <div style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/pricing" style={{ fontWeight: 650 }}>Full pricing and plan comparison →</a>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setCur(c => c === "USD" ? "INR" : "USD")}>Show in {cur === "USD" ? "INR" : "USD"}</button>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="sec tight">
        <div className="rv"><h2 style={{ fontSize: 30 }}>Questions people ask before they sign up</h2></div>
        <div className="acc rv">
          {[["Why do I see a better position when I search myself?", "Google personalises results for signed-in users and boosts sites you visit often. Open an incognito window and you'll see what RankPulse sees — and what your buyers see."],
            ["Do you really ask ChatGPT and the others?", "Yes. Each of your buyer questions is put to ChatGPT, Perplexity, Gemini, Claude and Google AI Overview every month, and we record which sources each answer cites. It's measured, not modelled."],
            ["Why page one only?", "Position 11 and position 80 both mean nobody found you. Tracking beyond the top 10 adds noise and invites celebrating movement that changes nothing."],
            ["How is this different from Ahrefs or Semrush?", "They estimate from a crawl and charge for a thousand things you won't open. We run the actual search, from the actual country, and measure AI citations, which they don't. One grid."],
            ["What does “not measured” mean?", "A search that failed to return a readable page. We mark it and retry automatically. It is never counted as a loss."],
            ["What happens after the trial?", "Your data stays. Scans pause until you pick a plan. Nothing is deleted."]].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
}
