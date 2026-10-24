"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sb, configured } from "../lib/supabase";
import { PLANS, inr } from "../lib/plans";

/* the hero visual: a keyword climbing the page-one ladder, month by month */
function Ladder() {
  const rivals = ["travelopro.com", "trawex.com", "developers.booking.com", "technoheaven.com", "altexsoft.com", "phptravels.com", "bookingxml.com", "siteminder.com", "hoteltechreport.com"];
  const [pos, setPos] = useState(7);
  const [month, setMonth] = useState(0);
  const months = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  useEffect(() => {
    const path = [7, 5, 4, 2, 1, 1];
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % path.length; setPos(path[i]); setMonth(i); }, 1800);
    return () => clearInterval(t);
  }, []);
  const rows = [];
  let r = 0;
  for (let p = 1; p <= 8; p++) {
    if (p === pos) rows.push({ p, d: "yourbrand.com", you: true });
    else rows.push({ p, d: rivals[r++], you: false });
  }
  return (
    <div className="ladder" aria-hidden="true">
      <div className="badge">{months[month]}-26 · India</div>
      <div className="lt"><span>hotel booking software</span><span>Google · page 1</span></div>
      {rows.map(x => (
        <div key={x.p} className={"row" + (x.you ? " you" : "")} style={{ transition: "all .5s ease" }}>
          <span className="n">#{x.p}</span>
          <span className="d">{x.d}</span>
          {x.you && <span className="chip ok" style={{ fontSize: 10 }}>you</span>}
        </div>
      ))}
    </div>
  );
}

function Counter({ to, suffix = "" }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now(), dur = 1100;
      const tick = t => { const k = Math.min(1, (t - start) / dur); setV(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref} className="counter">{v.toLocaleString("en-IN")}{suffix}</span>;
}

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [cycle, setCycle] = useState("monthly");

  useEffect(() => {
    if (!configured) { setChecking(false); return; }
    sb().auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard"); else setChecking(false);
    });
  }, [router]);

  /* scroll reveal + top progress bar */
  useEffect(() => {
    if (checking) return;
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), { threshold: .12 });
    document.querySelectorAll(".rev").forEach(el => io.observe(el));
    const bar = document.getElementById("pbar");
    const onScroll = () => { const h = document.documentElement; bar && (bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + "%"); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, [checking]);

  if (checking) return null;

  return (
    <>
      <div className="bar-fixed" id="pbar" />
      <nav className="nav"><div className="nav-in">
        <div className="brand"><div className="mark">R</div>RankPulse</div>
        <div className="spacer" />
        <a href="#how" style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 600 }}>How it works</a>
        <a href="#pricing" style={{ color: "var(--ink-2)", fontSize: 14, fontWeight: 600, marginLeft: 16 }}>Pricing</a>
        <a className="btn btn-ghost" href="/login" style={{ marginLeft: 16 }}>Sign in</a>
        <a className="btn btn-primary" href="/signup">Start free</a>
      </div></nav>

      <div className="wrap">
        {/* ───────── hero ───────── */}
        <section className="hero">
          <div>
            <span className="eyebrow"><span className="dot" style={{ background: "var(--up)" }} />Live Google positions · every month</span>
            <h1 style={{ marginTop: 18 }}>See exactly where you rank — in every country you sell to.</h1>
            <p className="lead">
              Add your keywords once. RankPulse checks your Google position from a real IP address in each
              market, every month, and shows you what moved — by keyword, by region, over time.
              No estimates. No guessing from your own personalised results.
            </p>
            <div style={{ display: "flex", gap: 11, marginTop: 26, flexWrap: "wrap" }}>
              <a className="btn btn-primary" href="/signup" style={{ padding: "12px 22px", fontSize: 15 }}>Start free — 14 days</a>
              <a className="btn btn-ghost" href="#how" style={{ padding: "12px 22px", fontSize: 15 }}>See how it works</a>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 12 }}>No card needed · first scan runs within 30 minutes</p>
          </div>
          <Ladder />
        </section>

        {/* ───────── proof strip ───────── */}
        <div className="kpis rev">
          <div className="kpi"><div className="l">Markets</div><div className="v"><Counter to={4} suffix="+" /></div><div className="s">India · US · Middle East · Europe, from in-country IPs</div></div>
          <div className="kpi"><div className="l">Positions tracked</div><div className="v">1–10</div><div className="s">page one only — where the clicks are</div></div>
          <div className="kpi"><div className="l">History kept</div><div className="v">∞</div><div className="s">every month saved, never overwritten</div></div>
          <div className="kpi"><div className="l">Setup time</div><div className="v"><Counter to={3} suffix=" min" /></div><div className="s">domain, countries, keywords — done</div></div>
        </div>

        {/* ───────── why ───────── */}
        <section className="section rev">
          <h2>Your own Google results are lying to you.</h2>
          <p className="sub">
            Signed in, on a site you visit every day, Google quietly promotes your own pages. You see a #1
            that your customers never get. RankPulse measures with no cookies, no history and no sign-in —
            from the country your buyer is actually in. What a stranger sees, not what you see.
          </p>
          <div className="feat">
            <div className="f"><h3>Real in-country positions</h3><p>A searcher in Dubai sees a different page one than one in Delhi. We check from both, so you know where you actually stand in each market.</p></div>
            <div className="f"><h3>Month-on-month movement</h3><p>Every keyword, every region, every month in one grid. Click any keyword and see its full history and who ranks around it.</p></div>
            <div className="f"><h3>Honest about gaps</h3><p>A failed check is marked unmeasured — never counted as “not ranking”. Your numbers never show a crisis that didn't happen.</p></div>
            <div className="f"><h3>Who ranks instead of you</h3><p>For every keyword we store the full page one, so you can see exactly which competitor holds the spot you want.</p></div>
            <div className="f"><h3>Runs itself</h3><p>Scans run on the 1st of every month automatically. Trigger one by hand whenever you ship a change.</p></div>
            <div className="f"><h3>Built for small teams</h3><p>No per-seat pricing, no 40-tab dashboard. The one view that answers “did we move?” — and nothing you have to learn.</p></div>
          </div>
        </section>

        {/* ───────── how ───────── */}
        <section className="section rev" id="how">
          <h2>How it works</h2>
          <p className="sub">Three steps, about three minutes. Your first results land the same day.</p>
          <div className="steps3">
            <div className="step"><div className="num">1</div><h3>Add your site and keywords</h3><p>Your domain, the countries you sell to, and the phrases a buyer types when choosing you — one per line.</p></div>
            <div className="step"><div className="num">2</div><h3>We measure from each market</h3><p>Every keyword is searched on Google through a real IP in each country, with no cookies or history. Page one only.</p></div>
            <div className="step"><div className="num">3</div><h3>Watch what moves</h3><p>Positions land on your dashboard by region and month. Every month after, it repeats on its own.</p></div>
          </div>
        </section>

        {/* ───────── pricing ───────── */}
        <section className="section rev" id="pricing">
          <h2>Simple pricing. Two months free on annual.</h2>
          <p className="sub">Every plan includes all countries, full history, competitor page-one data and automatic monthly scans. 14-day free trial on all of them.</p>
          <div className="seg" style={{ marginTop: 22 }}>
            <button className={cycle === "monthly" ? "on" : ""} onClick={() => setCycle("monthly")}>Monthly</button>
            <button className={cycle === "annual" ? "on" : ""} onClick={() => setCycle("annual")}>Annual <span style={{ color: "var(--up)", marginLeft: 4 }}>−2 months</span></button>
          </div>
          <div className="plans">
            {Object.entries(PLANS).map(([k, p]) => (
              <div key={k} className={"plan" + (p.hot ? " hot" : "")}>
                <div className="pn">{p.name}{p.hot && <span className="chip ok" style={{ marginLeft: 8 }}>Most popular</span>}</div>
                <div className="pp">{cycle === "monthly" ? inr(p.monthly) : inr(Math.round(p.annual / 12))}<small>/month</small></div>
                {cycle === "annual" && <div style={{ fontSize: 12.5, color: "var(--ink-3)" }}>{inr(p.annual)} billed yearly · 12 months for the price of 10</div>}
                <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "10px 0 0" }}>{p.desc}</p>
                <ul>
                  <li>{p.keywords} keywords</li>
                  <li>{p.regions} countries</li>
                  <li>Monthly automatic scans</li>
                  <li>Full history, never deleted</li>
                  <li>Who ranks on page one, per keyword</li>
                </ul>
                <a className={"btn " + (p.hot ? "btn-primary" : "btn-ghost")} href={`/signup?plan=${k}&cycle=${cycle}`}>Start 14-day trial</a>
              </div>
            ))}
          </div>
        </section>

        {/* ───────── faq ───────── */}
        <section className="section rev">
          <h2>Questions</h2>
          <div className="faq">
            <div><h4>Why do I see a better position when I search myself?</h4><p>Google personalises results for signed-in users and boosts sites you visit often. Open an incognito window and you'll see what RankPulse sees.</p></div>
            <div><h4>Why page one only?</h4><p>Position 11 and position 80 both mean nobody found you. Tracking beyond the top 10 adds noise and invites celebrating movement that changes nothing.</p></div>
            <div><h4>How often does it scan?</h4><p>Automatically on the 1st of every month. You can also trigger a scan by hand any time — results land within about 30 minutes.</p></div>
            <div><h4>What does “not measured” mean?</h4><p>A search that failed to return a readable page. We mark it rather than guess, and retry automatically. It is never counted as a loss.</p></div>
            <div><h4>Can I change my keywords?</h4><p>Any time. Add, remove or regroup them from the dashboard. History for a removed keyword is kept.</p></div>
            <div><h4>What happens after the trial?</h4><p>Your data stays. Scans pause until you pick a plan. Nothing is deleted.</p></div>
          </div>
        </section>

        <div className="cta rev">
          <h2>Know where you stand by this time tomorrow.</h2>
          <p>Three minutes to set up. Your first real positions, from every market you sell to, within the hour.</p>
          <a className="btn" href="/signup" style={{ padding: "12px 24px", fontSize: 15 }}>Start free — no card</a>
        </div>

        <footer style={{ borderTop: "1px solid var(--rule)", padding: "22px 0 40px", fontSize: 12.5, color: "var(--ink-3)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span>© {new Date().getFullYear()} RankPulse</span>
          <span><a href="/login">Sign in</a> · <a href="#pricing">Pricing</a> · <a href="mailto:pasha@zentrumhub.com">Contact</a></span>
        </footer>
      </div>
    </>
  );
}
