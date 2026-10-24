/* Free crawler-access audit: fetch the site's robots.txt server-side and report AI-bot blocks. */
import { auditRobots } from "../../../../lib/aeo-rules";

export async function POST(req) {
  try {
    const { domain } = await req.json();
    const d = String(domain || "").toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) return Response.json({ error: "Invalid domain" }, { status: 400 });

    let text = "", status = 0, url = "";
    for (const u of [`https://www.${d}/robots.txt`, `https://${d}/robots.txt`]) {
      try {
        const r = await fetch(u, { headers: { "User-Agent": "RankPulse-Audit/1.0" }, redirect: "follow", signal: AbortSignal.timeout(10000) });
        status = r.status; url = u;
        if (r.ok) { text = await r.text(); break; }
      } catch { /* try next */ }
    }
    const a = auditRobots(text);
    return Response.json({ domain: d, url, status, checkedAt: new Date().toISOString(), ...a, results: a.results });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
