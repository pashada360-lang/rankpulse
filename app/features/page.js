"use client";
import { Nav, Footer, CTA, useReveal } from "../../components/Site";

const GROUPS = [
  { kick: "Rank tracking", h: "Positions you can act on, not estimates you have to trust.", items: [
    ["In-country measurement", "Each keyword is searched through a real IP inside each country you choose. Google in Dubai is not Google in Delhi, and the numbers reflect that."],
    ["Nothing personalised", "No cookies, no history, no sign-in. The page one a stranger gets — the only one that matters for acquisition."],
    ["Page one only", "Positions 1–10. Beyond that, nobody clicks, and the data only tempts you to celebrate noise."],
    ["Organic blocks, not links", "Sitelinks and rich results inflate naive counts — a real #2 gets logged as #6. We count organic result blocks the way a human reads the page."],
    ["Unmeasured ≠ not ranking", "A search that fails is marked and retried, never counted as a zero. Your month-on-month comparison is always like-for-like."],
    ["Full page one stored", "For every keyword, every month, the ten domains that held page one. Who took your spot is one click away."],
  ]},
  { kick: "History and reporting", h: "A trend you can defend in a leadership meeting.", items: [
    ["Locked monthly snapshots", "Each month is stored under its own key. Nothing is ever overwritten, so July is still July in December."],
    ["Movement, not totals", "Up, down, new, lost — per keyword and per region. Totals hide what happened; movement shows it."],
    ["Keyword groups and tabs", "Commercial, priority, long tail. Keep brand-name long tail out of your headline number so it can't flatter you."],
    ["Per-keyword drawer", "Click any keyword for every region this month, a position sparkline, and the full month × region table."],
    ["Scan on demand", "Ship a change, run a scan, see the effect within the hour. Automatic scans still run on the first of every month."],
    ["CSV export", "Everything you see, as a file, for the deck or the spreadsheet."],
  ]},
  { kick: "AI search", h: "The channel your buyers moved to while rank trackers weren't looking.", items: [
    ["Real buyer questions", "Nobody types keywords into ChatGPT. We ask the questions buyers actually ask — by funnel stage — and check who gets cited."],
    ["Four engines", "ChatGPT, Perplexity, Gemini and Google AI Overview, measured the same way so the numbers are comparable."],
    ["Cited vs named", "Being mentioned and being linked are different outcomes. We track both, because the gap between them is where the fix is."],
    ["Fix list with payoff order", "Pages that rank on Google but never get cited are the cheapest wins. We rank every fix by expected return."],
    ["Crawler-access audit", "One robots.txt line can block Gemini and OpenAI entirely. We check it on day one and every month after."],
    ["Do / don't per page", "Concrete formatting rules that decide whether an engine quotes you or a competitor — applied to your actual pages."],
  ]},
];

export default function Features() {
  useReveal();
  return (
    <>
      <div className="band"><div className="orb a" /><Nav dark />
        <div className="sec" style={{ color: "#fff", paddingTop: 60, paddingBottom: 60 }}>
          <span className="eyebrow2">Features</span>
          <h1 className="disp" style={{ fontSize: "clamp(34px,5vw,58px)", marginTop: 20, maxWidth: "18ch", lineHeight: 1.05 }}>Everything a marketing lead needs. Nothing they'd have to learn.</h1>
          <p className="lead" style={{ color: "rgba(255,255,255,.72)" }}>Built by a team that tracked their own 145 keywords across four markets for three months, got burned by every false signal a rank tracker can produce, and fixed each one.</p>
        </div>
      </div>
      {GROUPS.map((g, gi) => (
        <section key={g.kick} className="sec" style={{ background: gi % 2 ? "var(--paper-2)" : "var(--paper)", maxWidth: "none" }}>
          <div style={{ maxWidth: 1180, margin: "0 auto" }}>
            <div className="rv"><span className="kick">{g.kick}</span><h2>{g.h}</h2></div>
            <div className="grid3">{g.items.map(([t, d], i) => <div key={t} className={"fc rv d" + (i % 3)}><h3 style={{ marginTop: 0 }}>{t}</h3><p>{d}</p></div>)}</div>
          </div>
        </section>
      ))}
      <CTA title="See your real positions by this time tomorrow." />
      <Footer />
    </>
  );
}
