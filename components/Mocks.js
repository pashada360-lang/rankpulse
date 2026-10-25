"use client";
import { useEffect, useRef, useState } from "react";

/* Small, dark, animated product panels for the marketing site.
   Not replicas of the dashboard — each shows one idea, moving. */

function useInView(ref) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: .3 });
    io.observe(el); return () => io.disconnect();
  }, [ref]);
  return on;
}

const Frame = ({ url, chip, children, chipLive }) => (
  <div className="mock float" aria-hidden="true">
    <div className="bar"><i /><i /><i /><span className="url">{url}</span>
      <span className="chip2"><i style={chipLive ? {} : { animation: "none", background: "#4ADE80" }} />{chip}</span></div>
    <div className="body">{children}</div>
  </div>
);

/* ─── 1. AI answers: engine bars grow, stage bars swap per engine ─── */
const ENG = [
  { n: "Perplexity", p: 65, stages: [["Vendor evaluation", 80], ["Comparison", 88], ["Category", 57], ["Problem-aware", 29]] },
  { n: "ChatGPT",    p: 61, stages: [["Vendor evaluation", 100], ["Comparison", 75], ["Category", 43], ["Problem-aware", 14]] },
  { n: "Gemini",     p: 4,  stages: [["Vendor evaluation", 10], ["Comparison", 0], ["Category", 0], ["Problem-aware", 0]] },
  { n: "Claude",     p: 48, stages: [["Vendor evaluation", 70], ["Comparison", 63], ["Category", 29], ["Problem-aware", 14]] },
];
export function MockAI() {
  const ref = useRef(null); const on = useInView(ref);
  const [e, setE] = useState(0);
  useEffect(() => { if (!on) return; const t = setInterval(() => setE(x => (x + 1) % ENG.length), 2600); return () => clearInterval(t); }, [on]);
  const cur = ENG[e];
  const col = p => p >= 50 ? "#4ADE80" : p >= 25 ? "#FBBF24" : "#F87171";
  return (
    <div ref={ref}><Frame url="dashboard · AI answers" chip={`${cur.n} · Oct-26`} chipLive>
      <div className="seg2">{ENG.map((x, i) => <span key={x.n} className={i === e ? "on" : ""}>{x.n}</span>)}</div>
      <div className="kp" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div><div className="l">Citation rate</div><div className="v" style={{ color: col(cur.p) }}>{cur.p}%</div></div>
        <div><div className="l">Cited first</div><div className="v">{Math.round(cur.p / 5)}</div></div>
        <div><div className="l">Named</div><div className="v">{Math.round(cur.p / 4) + 2}</div></div>
      </div>
      <div className="mk-lbl">Citation rate by engine · same 15 questions</div>
      {ENG.map((x, i) => <div key={x.n} className="mk-row"><span className={"mk-n" + (i === e ? " on" : "")}>{x.n}</span><span className="mk-track"><i style={{ width: on ? x.p + "%" : 0, background: col(x.p), transitionDelay: i * 120 + "ms" }} /></span><span className="mk-v">{x.p}%</span></div>)}
      <div className="mk-lbl" style={{ marginTop: 14 }}>Where you win — {cur.n}</div>
      {cur.stages.map(([s, p], i) => <div key={s} className="mk-row"><span className="mk-n">{s}</span><span className="mk-track"><i style={{ width: on ? p + "%" : 0, background: col(p), transitionDelay: i * 90 + "ms" }} /></span><span className="mk-v">{p}%</span></div>)}
    </Frame></div>
  );
}

/* ─── 2. Opportunities: rows land one by one, a quick win lights up ─── */
const OPPS = [
  { k: "hotel api provider in india", t: "Commercial", you: 2, who: ["travelopro", "trawex"], s: 92 },
  { k: "white label booking platform", t: "Commercial", you: 0, who: ["technoheaven", "cultbooking"], s: 88 },
  { k: "b2b vs b2c travel portal", t: "Comparison", you: 5, who: ["it4tsolutions", "flightslogic"], s: 84 },
  { k: "how to integrate hotelbeds api", t: "Blog", you: 0, who: ["developer.hotelbeds", "altexsoft"], s: 79 },
  { k: "hotel channel manager company", t: "Commercial", you: 8, who: ["siteminder", "hoteltechreport"], s: 76 },
];
export function MockOpps() {
  const ref = useRef(null); const on = useInView(ref);
  const [n, setN] = useState(0);
  useEffect(() => { if (!on) return; let i = 0; const t = setInterval(() => { i++; setN(i); if (i >= OPPS.length) clearInterval(t); }, 420); return () => clearInterval(t); }, [on]);
  return (
    <div ref={ref}><Frame url="dashboard · opportunities" chip={`${OPPS.length} new keywords`}>
      <div className="kp" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        <div><div className="l">New keywords</div><div className="v">{Math.min(n, OPPS.length) * 97}</div></div>
        <div><div className="l">You already rank</div><div className="v" style={{ color: "#4ADE80" }}>{OPPS.slice(0, n).filter(o => o.you).length * 5}</div></div>
        <div><div className="l">Pages to build</div><div className="v">{Math.min(n, OPPS.length) * 83}</div></div>
      </div>
      <table><thead><tr><th>Keyword</th><th>Type</th><th style={{ textAlign: "center" }}>You</th><th>Who ranks now</th><th style={{ textAlign: "right" }}>Score</th></tr></thead>
        <tbody>{OPPS.map((o, i) => { const live = i < n; return (
          <tr key={o.k} className={live && o.you && o.you <= 3 ? "live" : ""} style={{ opacity: live ? 1 : .18, transform: live ? "none" : "translateX(10px)", transition: "all .45s cubic-bezier(.2,.7,.2,1)" }}>
            <td>{o.k}</td>
            <td><span className="mk-pill">{o.t}</span></td>
            <td className={"n " + (o.you ? (o.you <= 3 ? "g1" : "g2") : "g3")}>{o.you ? "#" + o.you : "—"}</td>
            <td>{o.who.map(w => <span key={w} className="mk-chip">{w}</span>)}</td>
            <td className="n" style={{ textAlign: "right", color: o.s >= 85 ? "#4ADE80" : "#FBBF24" }}>{live ? o.s : ""}</td>
          </tr>); })}</tbody></table>
      <div className="mk-foot">★ Ranking without a page — build it, take the top spot</div>
    </Frame></div>
  );
}

/* ─── 3. Fix list: the AEO actions, status chips cycling ─── */
const FIX = [
  ["Format fix", "how much does integration cost", "#F87171", "ranks #1 · zero AI citations"],
  ["Create", "is there a free hotel api", "#FBBF24", "no page exists"],
  ["Citation fix", "best hotel api providers", "#FBBF24", "named, linked elsewhere"],
  ["Defend", "hotel api aggregator vs direct", "#4ADE80", "cited by 4 engines"],
];
export function MockFix() {
  const ref = useRef(null); const on = useInView(ref);
  const [n, setN] = useState(0);
  useEffect(() => { if (!on) return; let i = 0; const t = setInterval(() => { i++; setN(i); if (i >= FIX.length + 1) clearInterval(t); }, 500); return () => clearInterval(t); }, [on]);
  return (
    <div ref={ref}><Frame url="dashboard · improve" chip="4 actions ranked by payoff">
      <div className="mk-crawl" style={{ opacity: n > 0 ? 1 : 0, transition: "opacity .5s" }}>
        <span className="mk-dot" />robots.txt &nbsp;<span style={{ fontFamily: "var(--mono)", color: "#FCA5A5" }}>Google-Extended · Disallow: /</span><span style={{ marginLeft: "auto", color: "#FCA5A5", fontWeight: 700 }}>Blocked</span>
      </div>
      {FIX.map(([t, q, c, why], i) => { const live = i < n - 1; return (
        <div key={t} className="mk-fix" style={{ opacity: live ? 1 : .18, transform: live ? "none" : "translateY(6px)", transition: "all .45s cubic-bezier(.2,.7,.2,1)", borderLeftColor: c }}>
          <div><span className="mk-tag" style={{ background: c, color: "#0F1424" }}>{t}</span><span className="mk-q">{q}</span></div>
          <div className="mk-why">{why}</div>
        </div>); })}
    </Frame></div>
  );
}
