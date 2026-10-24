"use client";
import { useEffect } from "react";

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".rv").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export function Nav({ dark = false }) {
  return (
    <nav className={"mnav" + (dark ? " dark" : "")}>
      <div className="mnav-in">
        <a className="brand" href="/"><div className="mark">R</div>RankPulse</a>
        <div className="links">
          <a href="/features">Features</a>
          <a href="/aeo">AI search</a>
          <a href="/compare">Compare</a>
          <a href="/pricing">Pricing</a>
        </div>
        <div className="spacer" />
        <a className="btn btn-ghost" href="/login">Sign in</a>
        <a className="btn btn-primary" href="/signup">Start free</a>
      </div>
    </nav>
  );
}

export function CTA({ title = "Know where you stand by this time tomorrow.", sub = "Three minutes to set up. Real positions from every market you sell to, within the hour. No card." }) {
  return (
    <section className="cta2">
      <div className="orb a" style={{ opacity: .35 }} />
      <div className="in">
        <h2>{title}</h2>
        <p>{sub}</p>
        <a className="btn-glow" href="/signup" style={{ display: "inline-block" }}>Start free — 14 days</a>
        <div className="note-sm" style={{ color: "rgba(255,255,255,.5)", marginTop: 14 }}>No card · cancel any time · your data stays yours</div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mfoot">
      <div className="in">
        <div>
          <div className="brand" style={{ color: "#fff" }}><div className="mark">R</div>RankPulse</div>
          <p style={{ maxWidth: "36ch", marginTop: 12, lineHeight: 1.6 }}>Real Google positions and AI-search visibility for the markets you actually sell to. Measured monthly, from in-country IPs, with nothing personalised.</p>
        </div>
        <div><h4>Product</h4><a href="/features">Features</a><a href="/aeo">AI search visibility</a><a href="/pricing">Pricing</a><a href="/compare">vs Ahrefs & Semrush</a></div>
        <div><h4>Company</h4><a href="/about">About</a><a href="/contact">Contact</a><a href="/about#method">Methodology</a></div>
        <div><h4>Legal</h4><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><a href="/refunds">Refunds &amp; Cancellation</a><a href="/login">Sign in</a></div>
      </div>
      <div className="legal"><span>© {new Date().getFullYear()} RankPulse · ZentrumHub Technologies Pvt. Ltd., Pune, India</span><span>Prices in USD and INR · GST extra in India · Payments by Razorpay</span></div>
    </footer>
  );
}
