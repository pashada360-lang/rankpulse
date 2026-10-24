"use client";
import { Nav, Footer } from "./Site";

export default function Legal({ title, updated = "24 October 2026", children }) {
  return (
    <>
      <Nav />
      <div className="sec" style={{ maxWidth: 820, paddingTop: 56 }}>
        <span className="kick">Legal</span>
        <h1 className="disp" style={{ fontSize: "clamp(30px,4vw,44px)", fontWeight: 700 }}>{title}</h1>
        <p style={{ color: "var(--ink-3)", fontSize: 13.5, marginTop: 8 }}>Last updated {updated}</p>
        <div className="legalbody" style={{ marginTop: 28, color: "var(--ink-2)", lineHeight: 1.75, fontSize: 15.5 }}>{children}</div>
        <style>{`.legalbody h2{font-size:19px;margin:30px 0 8px;color:var(--ink)}.legalbody p{margin:0 0 12px}.legalbody ul{padding-left:20px;margin:0 0 12px}.legalbody li{margin:4px 0}`}</style>
      </div>
      <Footer />
    </>
  );
}
