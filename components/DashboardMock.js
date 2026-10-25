"use client";
import { useEffect, useState } from "react";
import Flag from "./Flag";

/* A believable, animated preview of the real dashboard: regions switch, a scan runs,
   results land row by row, deltas appear. Everything shown is the kind of data the
   product really produces — positions 1–10, month columns, who moved. */
const ROWS = [
  { k: "hotel booking software",     m: [8, 6, 4, 2] },
  { k: "best booking engine for otas", m: [0, 9, 5, 3] },
  { k: "white label travel portal",  m: [5, 5, 3, 1] },
  { k: "b2b hotel booking platform", m: [0, 0, 7, 4] },
  { k: "channel manager pricing",    m: [3, 2, 2, 2] },
];
const REG = ["India", "United States", "UAE", "United Kingdom"];
const CODE = ["IN", "US", "AE", "GB"];
const MONTHS = ["Jul", "Aug", "Sep", "Oct"];

export default function DashboardMock({ size = "md" }) {
  const [reg, setReg] = useState(0);
  const [landed, setLanded] = useState(0);
  const [scan, setScan] = useState(true);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i <= ROWS.length) setLanded(i);
      else if (i === ROWS.length + 3) setScan(false);
      else if (i === ROWS.length + 8) { setReg(r => (r + 1) % REG.length); setLanded(0); setScan(true); i = 0; }
    }, 700);
    return () => clearInterval(t);
  }, []);

  const cls = v => v === 0 ? "g3" : v <= 3 ? "g1" : v <= 6 ? "g2" : "";
  const show = v => v === 0 ? "—" : v;
  const ranking = ROWS.slice(0, landed).filter(r => r.m[3] > 0).length;
  const top3 = ROWS.slice(0, landed).filter(r => r.m[3] > 0 && r.m[3] <= 3).length;

  return (
    <div className={"mock float" + (size === "lg" ? " lg" : "")} aria-hidden="true">
      <div className="bar">
        <i /><i /><i />
        <span className="url">rankpulse.app/dashboard · yourbrand.com</span>
        <span className="chip2"><i />{scan && <Flag code={CODE[reg]} size={13} />}{scan ? `Scanning ${REG[reg]} · ~4 min` : `Last scan Oct-26`}</span>
      </div>
      <div className="body">
        <div className="seg2">{REG.map((r, i) => <span key={r} className={i === reg ? "on" : ""} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Flag code={CODE[i]} size={14} />{r}</span>)}</div>
        <div className="kp">
          <div><div className="l">Ranking in top 10</div><div className="v">{ranking}<small>▲ {Math.max(0, ranking - 2)}</small></div></div>
          <div><div className="l">Top 3</div><div className="v">{top3}<small>▲ {Math.max(0, top3 - 1)}</small></div></div>
          <div><div className="l">Keywords</div><div className="v">{ROWS.length}</div></div>
        </div>
        <table>
          <thead><tr><th>Keyword</th>{MONTHS.map(m => <th key={m} style={{ textAlign: "center" }}>{m}-26</th>)}<th style={{ textAlign: "center" }}>Δ</th></tr></thead>
          <tbody>
            {ROWS.map((r, i) => {
              const on = i < landed;
              const d = r.m[2] > 0 && r.m[3] > 0 ? r.m[2] - r.m[3] : null;
              return (
                <tr key={r.k} className={on && i === landed - 1 && scan ? "live" : ""} style={{ opacity: on ? 1 : .35, transition: "opacity .4s" }}>
                  <td>{r.k}</td>
                  {r.m.map((v, j) => <td key={j} className={"n " + cls(v)}>{on || j < 3 ? show(v) : <span className="typing" />}</td>)}
                  <td className="n" style={{ color: d > 0 ? "#4ADE80" : d < 0 ? "#F87171" : "rgba(255,255,255,.4)" }}>{on ? (d === null ? (r.m[2] === 0 && r.m[3] > 0 ? "new" : "·") : d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : "=") : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
