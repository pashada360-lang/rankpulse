/* Keyword opportunities for one site: free Google Autocomplete expansion seeded from the
   customer's own keywords, filtered against what they already track, then the best ~40
   verified against live page one so we can show who holds each spot. */
import { execFileSync } from "child_process";

const KEY = process.env.BRIGHTDATA_KEY;
const ZONE = process.env.BRIGHTDATA_ZONE || "serp_api1";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SKIP = /google\.|gstatic|googleadservices|googleusercontent|youtube\.|translate\.goog|webcache/;
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

const SUFFIX = ["", "provider", "pricing", "cost", "for small business", "software", "companies", "vs", "alternatives", "integration", "best", "how to"];
const PREFIX = ["best", "top", "how to choose", "what is", "cheapest"];
const JUNK = /\b(job|jobs|salary|career|login|download|apk|near me|movie|lyrics|pdf|ppt|wikipedia|meaning in hindi)\b/;

async function suggest(q, gl) {
  try {
    const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=${gl}&q=${encodeURIComponent(q)}`, { headers: { "User-Agent": "Mozilla/5.0" } });
    const t = await r.text(); const j = JSON.parse(t); return Array.isArray(j[1]) ? j[1] : [];
  } catch { return []; }
}
const classify = k => /\b(vs|versus|alternative|alternatives|compare)\b/.test(k) ? "Comparison"
  : /^(how|what|why|when|which|is|are|does|can)\b/.test(k) || /\b(guide|tutorial|explained|examples?)\b/.test(k) ? "Blog"
  : /\b(api|integration|sdk|documentation|docs|developer)\b/.test(k) ? "Integration" : "Commercial";

function verify(kw, cc, domain) {
  const body = { zone: ZONE, url: `https://www.google.com/search?q=${encodeURIComponent(kw)}&gl=${cc}&hl=en&brd_json=1`, format: "raw", country: cc };
  try {
    const t = execFileSync("curl", ["-s", "-m", "120", "-X", "POST", "https://api.brightdata.com/request", "-H", `Authorization: Bearer ${KEY}`, "-H", "Content-Type: application/json", "--data-binary", JSON.stringify(body)], { maxBuffer: 32 * 1024 * 1024 }).toString();
    const j = JSON.parse(t); const org = (j.organic || []).slice(0, 10).map(o => host(o.link || "")).filter(d => d && !SKIP.test(d));
    if (!org.length) return null;
    const i = org.findIndex(d => d.includes(domain));
    return { pos: i < 0 ? 0 : i + 1, top: org };
  } catch { return null; }
}

export async function runOpps({ db, site, month, cc, limit = 40, log = console.log }) {
  const { data: kws } = await db.from("keywords").select("phrase").eq("site_id", site.id);
  const own = new Set((kws || []).map(k => k.phrase.toLowerCase()));
  const seeds = [...own].slice(0, 25);
  if (!seeds.length) return { found: 0 };

  const found = new Map();
  const add = k => { k = String(k).toLowerCase().trim(); if (k.length < 8 || own.has(k) || JUNK.test(k)) return; found.set(k, (found.get(k) || 0) + 1); };
  let calls = 0;
  for (const s of seeds) {
    for (const x of SUFFIX) { (await suggest(x ? `${s} ${x}` : s, cc)).forEach(add); calls++; await sleep(150); }
    for (const p of PREFIX) { (await suggest(`${p} ${s}`, cc)).forEach(add); calls++; await sleep(150); }
    if (calls > 400) break;                                 // stay well under Google's throttle
  }
  const ranked = [...found].map(([phrase, n]) => ({ phrase, n, cls: classify(phrase) }))
    .sort((a, b) => b.n - a.n || a.phrase.length - b.phrase.length);
  log(`   opportunities: ${ranked.length} candidates from ${calls} autocomplete calls`);

  const top = ranked.slice(0, limit);
  let verified = 0;
  for (const o of top) {
    const v = verify(o.phrase, cc, site.domain);
    const score = Math.min(60, o.n * 12) + ({ Commercial: 20, Comparison: 18, Blog: 12, Integration: 10 }[o.cls]) + (v && v.pos > 0 ? 15 : 0);
    await db.from("opportunities").upsert({
      site_id: site.id, month, phrase: o.phrase, cls: o.cls, demand: true, score,
      position: v ? v.pos : null, top_domains: v ? v.top : [], updated_at: new Date(),
    }, { onConflict: "site_id,phrase" });
    if (v) verified++;
    await sleep(300);
  }
  log(`   opportunities: ${top.length} stored, ${verified} verified on page one`);
  return { found: ranked.length, stored: top.length };
}
