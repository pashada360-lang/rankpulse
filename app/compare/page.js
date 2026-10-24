"use client";
import { Nav, Footer, CTA, useReveal } from "../../components/Site";

const ROWS = [
  ["Starting price", "$29 / mo", "$129 / mo", "$139 / mo", "$65 / mo"],
  ["Positions measured", "Live search from in-country IP", "Estimated from crawl index", "Estimated from crawl index", "Live search (shared proxies)"],
  ["Personalisation removed", "Yes — no cookies, no history", "n/a (estimated)", "n/a (estimated)", "Partly"],
  ["AI-search citations (ChatGPT, Perplexity, Gemini)", "Yes, by funnel stage", "No", "Limited add-on", "No"],
  ["AEO fix list with do / don't", "Yes", "No", "No", "No"],
  ["Crawler-access audit (robots.txt)", "Every month", "No", "No", "No"],
  ["Who holds page one, per keyword", "Stored every month", "Yes", "Yes", "Yes"],
  ["Unmeasured vs not-ranking distinction", "Yes — never fakes a zero", "No", "No", "No"],
  ["Learning curve", "One grid", "Days", "Days", "Hours"],
  ["Built for", "Small B2B teams", "SEO agencies", "Enterprise marketing", "SEO freelancers"],
];

export default function Compare() {
  useReveal();
  return (
    <>
      <div className="band"><div className="orb a" /><Nav dark />
        <div className="sec" style={{ color: "#fff", paddingTop: 60, paddingBottom: 60 }}>
          <span className="eyebrow2">Compare</span>
          <h1 className="disp" style={{ fontSize: "clamp(34px,5vw,56px)", marginTop: 20, maxWidth: "18ch", lineHeight: 1.05 }}>You don't need Ahrefs. You need to know if you moved.</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.72)" }}>Enterprise SEO suites are extraordinary tools for SEO agencies. For a marketing lead who opens one grid on the first of the month, they are an expensive way to feel behind. Here is an honest comparison.</p>
        </div>
      </div>
      <section className="sec">
        <div className="tablewrap rv"><table className="cmp">
          <thead><tr><th style={{ width: "26%" }}></th><th className="us">RankPulse</th><th>Ahrefs</th><th>Semrush</th><th>SE Ranking</th></tr></thead>
          <tbody>{ROWS.map(r => <tr key={r[0]}><td style={{ fontWeight: 600, color: "var(--ink)" }}>{r[0]}</td>{r.slice(1).map((c, i) => <td key={i} className={i === 0 ? "us" : ""}>{c}</td>)}</tr>)}</tbody>
        </table></div>
        <p style={{ color: "var(--ink-3)", fontSize: 12.5, marginTop: 14 }}>Competitor prices are their published entry tiers in USD as of this page's last review and may change. Feature descriptions are our reading of their public documentation. If we've got something wrong, tell us and we'll fix it.</p>
      </section>
      <section className="sec" style={{ background: "var(--paper-2)", maxWidth: "none" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="split">
            <div className="rv"><span className="kick">When to pick them</span><h2>Be honest with yourself about which one you are.</h2>
              <ul className="check">
                <li className="ok"><span><b>Pick Ahrefs or Semrush</b> if you run SEO for many clients, need backlink intelligence, or do keyword research at scale. They are the right tool and worth every dollar.</span></li>
                <li className="ok"><span><b>Pick RankPulse</b> if you have one or a few sites, a defined list of keywords that drive deals, buyers in more than one country, and you want to know — reliably, monthly — whether you moved and whether AI is citing you.</span></li>
              </ul></div>
            <div className="card2 rv d1" style={{ padding: 26 }}>
              <div className="kick">The thing they don't measure</div>
              <h3 style={{ fontSize: 20 }}>Buyers moved to AI assistants. Rank trackers didn't follow.</h3>
              <p style={{ color: "var(--ink-2)", marginTop: 10 }}>A citation rate of 61% on ChatGPT fell to 37% over two months on a site whose Google rankings held steady. Nothing in a classic rank tracker would have shown it. RankPulse made it the headline.</p>
              <a href="/aeo" style={{ fontWeight: 650, display: "inline-block", marginTop: 12 }}>How AI-search tracking works →</a>
            </div>
          </div>
        </div>
      </section>
      <CTA title="Try the one-grid version for 14 days." />
      <Footer />
    </>
  );
}
