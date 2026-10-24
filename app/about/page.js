"use client";
import { Nav, Footer, CTA, useReveal } from "../../components/Site";

export default function About() {
  useReveal();
  return (
    <>
      <div className="band"><div className="orb a" /><Nav dark />
        <div className="sec" style={{ color: "#fff", paddingTop: 60, paddingBottom: 60 }}>
          <span className="eyebrow2">About</span>
          <h1 className="disp" style={{ fontSize: "clamp(34px,5vw,56px)", marginTop: 20, maxWidth: "18ch", lineHeight: 1.05 }}>We built this because the tools we paid for kept lying to us.</h1>
        </div>
      </div>
      <section className="sec">
        <div className="split">
          <div className="rv">
            <span className="kick">The story</span>
            <h2>It started as an internal tool at a travel-tech company.</h2>
            <p className="sub">ZentrumHub sells hotel-booking infrastructure to travel companies in India, the Gulf, Europe and the US. The marketing team needed one honest answer every month: are we moving up or down, in each market, on the keywords that bring deals?</p>
            <p className="sub">Every tool we tried either estimated instead of measured, showed us our own personalised results, or buried the answer under forty tabs. So we built one that runs the real search from the real country and keeps one grid. Then we added the channel none of them tracked — whether AI assistants cite you — because that's where our buyers had gone.</p>
            <p className="sub">Three months in, we'd found an 8-place gap between what our founder saw and what buyers saw, a robots.txt line that made us invisible to Gemini, and 25 keywords we ranked for without a single page built. Fixing those tripled our top-three placements. RankPulse is that tool, for everyone.</p>
          </div>
          <div className="card2 rv d1" style={{ padding: 26 }} id="method">
            <span className="kick">Methodology</span>
            <ul className="check">
              <li className="ok"><span><b>Live search, in-country.</b> Each keyword is searched on Google through an IP inside the target country, with no cookies or history.</span></li>
              <li className="ok"><span><b>Organic blocks only.</b> We count result blocks the way a person reads the page, so sitelinks never inflate a position.</span></li>
              <li className="ok"><span><b>Page one only.</b> Positions 1–10. Beyond that is noise.</span></li>
              <li className="ok"><span><b>Unmeasured is not zero.</b> A failed check is recorded as unmeasured and retried. It never counts as a loss.</span></li>
              <li className="ok"><span><b>Locked monthly snapshots.</b> Nothing is overwritten. Like-for-like comparisons only.</span></li>
              <li className="ok"><span><b>AI citations on real questions.</b> Buyer questions by funnel stage, put to each engine, scored on whether your domain is cited and whether your brand is named.</span></li>
            </ul>
          </div>
        </div>
      </section>
      <CTA title="Get the honest number every month." />
      <Footer />
    </>
  );
}
