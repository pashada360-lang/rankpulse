"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sb, configured } from "../lib/supabase";
import { PLANS, price, fmt, guessCurrency } from "../lib/plans";
import { Nav, Footer, CTA, useReveal } from "../components/Site";
import DashboardMock from "../components/DashboardMock";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [cur, setCur] = useState("USD");
  useEffect(() => {
    setCur(guessCurrency());
    if (!configured) return setReady(true);
    sb().auth.getSession().then(({ data }) => data.session ? router.replace("/dashboard") : setReady(true));
  }, [router]);
  useReveal();
  if (!ready) return null;

  return (
    <>
      <div className="band">
        <div className="orb a" /><div className="orb b" />
        <Nav dark />
        <section className="hero2">
          <div>
            <span className="eyebrow2"><span className="dot" style={{ background: "#67E8F9" }} />Live positions · AI-search citations · every month</span>
            <h1 style={{ marginTop: 22 }}>Know exactly where you rank in <span className="hl">every market you sell to.</span></h1>
            <p className="lead">RankPulse checks your Google position from a real IP in each country, every month, and tells you whether ChatGPT, Perplexity and Gemini cite you when buyers ask. No estimates. No personalised results. Just what a stranger sees.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
              <a className="btn-glow" href="/signup">Start free — 14 days</a>
              <a className="btn-dark-ghost" href="#how">See how it works</a>
            </div>
            <div className="note-sm">No card · first results within the hour · cancel any time</div>
            <div className="pillrow">
              <span><b>4</b> markets from in-country IPs</span>
              <span><b>4</b> AI engines tracked</span>
              <span>Page one only — <b>no vanity data</b></span>
            </div>
          </div>
          <DashboardMock />
        </section>
      </div>

      {/* ── the problem ── */}
      <section className="sec">
        <div className="split">
          <div className="rv">
            <span className="kick">The problem</span>
            <h2>Your own Google results are lying to you.</h2>
            <p className="sub">Signed in, on a site you visit every day, Google quietly promotes your own pages. Teams routinely “see” a #1 their customers never get. Then a month later they wonder why leads dropped.</p>
            <p className="sub">RankPulse measures with no cookies, no history, no sign-in — from the country your buyer is actually in. We found an 8-place gap between a team's own view and reality on their most important keyword. That gap is the product.</p>
          </div>
          <div className="card2 rv d1" style={{ padding: 26 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-3)" }}>Same keyword · same day · India</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              <div style={{ background: "var(--paper-2)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>What the founder saw</div>
                <div className="mono" style={{ fontSize: 44, fontWeight: 700, color: "var(--up)" }}>#1</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>signed in · daily visitor</div>
              </div>
              <div style={{ background: "var(--down-bg)", borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>What a buyer saw</div>
                <div className="mono" style={{ fontSize: 44, fontWeight: 700, color: "var(--down)" }}>—</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>not on page one</div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 16, marginBottom: 0 }}>Real case from our own tracking. The page existed, was indexed, and ranked for nobody but its owner.</p>
          </div>
        </div>
      </section>

      {/* ── stats ── */}
      <section className="sec tight" style={{ paddingTop: 0 }}>
        <div className="statrow">
          <div className="rv"><div className="stat">145</div><div className="l">keywords tracked across 4 markets for 3 months to build this</div></div>
          <div className="rv d1"><div className="stat">8→23</div><div className="l">top-3 placements gained in one month by acting on the data</div></div>
          <div className="rv d2"><div className="stat">61%</div><div className="l">of buyer questions where an AI assistant cited the source brand</div></div>
          <div className="rv d3"><div className="stat">≈$1</div><div className="l">what a full 4-market monthly scan actually costs to run</div></div>
        </div>
      </section>

      {/* ── features ── */}
      <section className="sec" id="features">
        <div className="rv"><span className="kick">What you get</span><h2>One grid that answers “did we move?”</h2>
          <p className="sub">Not forty tabs. The view a marketing lead actually opens on the first of the month.</p></div>
        <div className="grid3">
          {[
            ["🌍", "In-country positions", "A buyer in Dubai sees a different page one than one in Delhi. We measure from both — real IPs, not a proxy guess."],
            ["📅", "Month-on-month history", "Every keyword, every region, every month. Nothing is ever overwritten, so a trend is a trend."],
            ["🤖", "AI-search visibility", "Do ChatGPT, Perplexity, Gemini and Google AI cite you when buyers ask? Measured on real questions, by funnel stage."],
            ["🧭", "Who holds the spot", "For every keyword we store the full page one. See exactly which competitor sits where you want to be."],
            ["🩺", "Honest about gaps", "A failed check is marked unmeasured — never counted as a loss. Your numbers can't show a crisis that didn't happen."],
            ["⚡", "Runs itself", "Scans run on the 1st of every month, automatically. Trigger one by hand the day you ship a change."],
          ].map(([ic, t, d], i) => (
            <div key={t} className={"fc rv d" + (i % 3)}><div className="ic">{ic}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
        <div style={{ marginTop: 28 }}><a href="/features" style={{ fontWeight: 650 }}>All features →</a></div>
      </section>

      {/* ── AEO ── */}
      <section className="band" style={{ padding: "0" }}>
        <div className="orb b" style={{ top: "auto", bottom: -120, right: "30%" }} />
        <div className="sec" style={{ color: "#fff" }}>
          <div className="split">
            <div className="rv">
              <span className="kick" style={{ color: "#A5B4FC" }}>AI search · included on Growth and above</span>
              <h2 style={{ color: "#fff" }}>Buyers are asking ChatGPT now. Are you the answer?</h2>
              <p className="sub" style={{ color: "rgba(255,255,255,.72)" }}>We put real buyer questions — not keywords — to ChatGPT, Perplexity, Gemini and Google AI Overview, and measure whether your site is cited. Then we tell you what to fix, page by page: what to add, what to stop doing, and the one robots.txt line that silently blocks you.</p>
              <ul className="check" style={{ color: "#fff" }}>
                <li className="ok" style={{ color: "rgba(255,255,255,.8)" }}>Citation rate per engine and per funnel stage</li>
                <li className="ok" style={{ color: "rgba(255,255,255,.8)" }}>Pages that rank on Google but never get cited — the cheapest fixes</li>
                <li className="ok" style={{ color: "rgba(255,255,255,.8)" }}>Crawler-access audit: the GPTBot / Google-Extended blocks that make you invisible</li>
              </ul>
              <div style={{ marginTop: 24 }}><a className="btn-dark-ghost" href="/aeo" style={{ display: "inline-block" }}>How AI-search tracking works →</a></div>
            </div>
            <div className="rv d1">
              <div className="aeo-cards">
                {[["Perplexity", 65], ["ChatGPT", 61], ["Google AI", 31], ["Gemini", 4]].map(([e, p]) => (
                  <div key={e} style={{ background: "rgba(255,255,255,.05)", borderColor: "rgba(255,255,255,.1)" }}>
                    <div className="e" style={{ color: "rgba(255,255,255,.7)" }}>{e}</div>
                    <div className="p" style={{ color: "#fff" }}>{p}%</div>
                    <div className="bar3" style={{ background: "rgba(255,255,255,.08)" }}><i style={{ width: p + "%" }} /></div>
                  </div>
                ))}
              </div>
              <div className="card2" style={{ marginTop: 14, padding: 18, background: "rgba(255,255,255,.05)", borderColor: "rgba(255,255,255,.1)", color: "#fff" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#FCA5A5" }}>🚫 Crawler blocked</div>
                <div className="mono" style={{ fontSize: 12.5, marginTop: 8, color: "rgba(255,255,255,.8)", lineHeight: 1.7 }}>User-agent: Google-Extended<br />Disallow: /</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,.7)", margin: "10px 0 0" }}>Gemini named this brand in 9 answers and linked it in 1. It knew who they were — and wasn't allowed to say so. One line, ten minutes, fixed.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── how ── */}
      <section className="sec" id="how">
        <div className="rv"><span className="kick">How it works</span><h2>Three minutes to set up. Results the same hour.</h2></div>
        <div className="grid3">
          {[["1", "Add your site and keywords", "Your domain, the countries you sell to, and the phrases a buyer types when choosing you. Paste a list; we'll suggest more from your own sitemap."],
            ["2", "We measure from each market", "Every keyword is searched on Google through a real IP in each country, with no cookies or history. Page one only."],
            ["3", "Watch what moves", "Positions land on your dashboard by region and month. Click any keyword for its full history and who ranks around it. Every month after, it repeats on its own."]].map(([n, t, d], i) => (
            <div key={n} className={"fc rv d" + i}><div className="ic" style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>{n}</div><h3>{t}</h3><p>{d}</p></div>
          ))}
        </div>
      </section>

      {/* ── pricing preview ── */}
      <section className="sec" id="pricing" style={{ paddingTop: 20 }}>
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
              <a className={"btn " + (p.hot ? "" : "btn-ghost")} href={`/signup?plan=${k}`} style={p.hot ? {} : {}}>Start 14-day trial</a>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <a href="/pricing" style={{ fontWeight: 650 }}>Full pricing and plan comparison →</a>
          <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12.5 }} onClick={() => setCur(c => c === "USD" ? "INR" : "USD")}>Show in {cur === "USD" ? "INR" : "USD"}</button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="sec tight">
        <div className="rv"><h2 style={{ fontSize: 30 }}>Questions people ask before they sign up</h2></div>
        <div className="acc rv">
          {[
            ["Why do I see a better position when I search myself?", "Google personalises results for signed-in users and boosts sites you visit often. Open an incognito window and you'll see what RankPulse sees — and what your buyers see."],
            ["Why page one only?", "Position 11 and position 80 both mean nobody found you. Tracking beyond the top 10 adds noise and invites celebrating movement that changes nothing."],
            ["How is this different from Ahrefs or Semrush?", "They estimate from a crawl of the web and charge for a thousand things you won't open. We run the actual search, from the actual country, and keep one grid. We also measure AI-search citations, which they don't. See the comparison page."],
            ["What does “not measured” mean?", "A search that failed to return a readable page. We mark it and retry automatically. It is never counted as a loss, so your trend line can't lie to you."],
            ["Can I change my keywords?", "Any time. Add, remove or regroup them from the dashboard. History for a removed keyword is kept."],
            ["What happens after the trial?", "Your data stays. Scans pause until you pick a plan. Nothing is deleted."],
          ].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
}
