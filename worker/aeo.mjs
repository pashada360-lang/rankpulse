/* AI-answer citation scan for one site and month.
   ChatGPT / Perplexity / Gemini via Bright Data Web Scrapers (async trigger → poll → snapshot),
   Google AI Overview via the SERP API with brd_ai_overview=2,
   Claude via the Anthropic API web-search tool when ANTHROPIC_API_KEY is set. */
import { execFileSync } from "child_process";

const KEY = process.env.BRIGHTDATA_KEY;
const ZONE = process.env.BRIGHTDATA_ZONE || "serp_api1";
const ANTH = process.env.ANTHROPIC_API_KEY;
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const ENGINES = {
  chatgpt:    { dataset: "gd_m7aof0k82r803d5bjm", url: "https://chatgpt.com/",     extra: { country: "", web_search: true } },
  perplexity: { dataset: "gd_m7dhdot1vw9a7gc1n",  url: "https://www.perplexity.ai", extra: {} },
  gemini:     { dataset: "gd_mbz66arm2mf9cu856y", url: "https://gemini.google.com/", extra: { index: 1 } },
};

const JUNK = /^(myactivity\.google|accounts\.google|policies\.google|support\.google|gemini\.google|chatgpt\.com|perplexity\.ai|claude\.ai|anthropic\.com|gstatic\.com|googleusercontent\.com|google\.com)$|(^|\.)(gstatic|googleusercontent)\./i;
const host = u => { try { const h = new URL(String(u)).hostname.replace(/^www\./, ""); return JUNK.test(h) ? "" : h; } catch { return ""; } };

async function bd(path, opts = {}) {
  const r = await fetch("https://api.brightdata.com" + path, { ...opts, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
  const t = await r.text();
  return { ok: r.ok, status: r.status, text: t };
}

/* ───── scraper engines (batch all prompts in one job) ───── */
async function scrapeEngine(name, prompts, log) {
  const E = ENGINES[name];
  const body = prompts.map(p => ({ url: E.url, prompt: p.prompt, ...E.extra }));
  const trig = await bd(`/datasets/v3/trigger?dataset_id=${E.dataset}&include_errors=true`, { method: "POST", body: JSON.stringify(body) });
  if (!trig.ok) { log(`   ${name}: trigger failed ${trig.status}`); return {}; }
  const sid = JSON.parse(trig.text).snapshot_id;
  log(`   ${name}: submitted ${prompts.length} prompts · ${sid}`);

  let recs = null;
  for (let i = 0; i < 60; i++) {                     // up to ~30 min
    await sleep(30000);
    const pr = await bd(`/datasets/v3/progress/${sid}`);
    let st = {}; try { st = JSON.parse(pr.text); } catch { }
    if (st.status === "ready") {
      const snap = await bd(`/datasets/v3/snapshot/${sid}?format=json`);
      try { const j = JSON.parse(snap.text); recs = Array.isArray(j) ? j : (j.data || []); } catch { recs = []; }
      break;
    }
    if (st.status === "failed") { log(`   ${name}: job failed`); return {}; }
  }
  if (!recs) { log(`   ${name}: timed out`); return {}; }

  const out = {};
  for (const r of recs) {
    const p = r.prompt; if (!p) continue;
    const ordered = [];
    for (const arr of [r.citations, r.sources, r.links_attached, r.search_sources, r.references]) {
      if (!Array.isArray(arr)) continue;
      arr.slice().sort((a, b) => (Number(a.position) || 99) - (Number(b.position) || 99)).forEach(c => { const h = host(c.url || c.link || ""); if (h) ordered.push(h); });
    }
    const uniq = [...new Set(ordered)];
    const text = String(r.answer_text || r.answer_text_markdown || r.answer || "");
    out[p] = { answered: true, uniq, text };
  }
  log(`   ${name}: ${Object.keys(out).length}/${prompts.length} answered`);
  return out;
}

/* ───── Google AI Overview + organic position, one SERP call per prompt ───── */
function serp(q, cc) {
  const body = { zone: ZONE, url: `https://www.google.com/search?q=${encodeURIComponent(q)}&gl=${cc}&hl=en&brd_json=1&brd_ai_overview=2`, format: "raw", country: cc };
  try {
    const t = execFileSync("curl", ["-s", "-m", "150", "-X", "POST", "https://api.brightdata.com/request", "-H", `Authorization: Bearer ${KEY}`, "-H", "Content-Type: application/json", "--data-binary", JSON.stringify(body)], { maxBuffer: 64 * 1024 * 1024 }).toString();
    return JSON.parse(t);
  } catch { return null; }
}
async function googleAio(prompts, cc, domain, log) {
  const out = {};
  for (const p of prompts) {
    const j = serp(p.prompt, cc);
    if (!j) { await sleep(800); continue; }
    const org = (j.organic || []).slice(0, 10).map(o => host(o.link || ""));
    const orgPos = (() => { const i = org.findIndex(d => d && d.includes(domain)); return i < 0 ? 0 : i + 1; })();
    const ai = j.ai_overview;
    if (ai) {
      const links = [];
      for (const t of ai.texts || []) for (const l of t.links || []) { const h = host(l.link || l.url || ""); if (h) links.push(h); }
      for (const r of ai.references || []) { const h = host(r.link || r.url || ""); if (h) links.push(h); }
      const text = (ai.texts || []).map(t => t.snippet || "").join(" ");
      out[p.prompt] = { answered: true, uniq: [...new Set(links)], text, orgPos };
    } else out[p.prompt] = { answered: false, uniq: [], text: "", orgPos };
    await sleep(600);
  }
  log(`   google: ${Object.values(out).filter(x => x.answered).length}/${prompts.length} had an AI Overview`);
  return out;
}

/* ───── Claude via Anthropic API with web search ───── */
async function claude(prompts, log) {
  if (!ANTH) { log("   claude: ANTHROPIC_API_KEY not set — skipped"); return null; }
  const out = {};
  for (const p of prompts) {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": ANTH, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-5", max_tokens: 1200, tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 3 }], messages: [{ role: "user", content: p.prompt }] }),
      });
      const j = await r.json();
      const links = [], texts = [];
      for (const b of j.content || []) {
        if (b.type === "text") { texts.push(b.text); for (const c of b.citations || []) { const h = host(c.url || ""); if (h) links.push(h); } }
        if (b.type === "web_search_tool_result") for (const x of b.content || []) { const h = host(x.url || ""); if (h) links.push(h); }
      }
      out[p.prompt] = { answered: texts.length > 0, uniq: [...new Set(links)], text: texts.join(" ") };
    } catch { }
    await sleep(400);
  }
  log(`   claude: ${Object.keys(out).length}/${prompts.length} answered`);
  return out;
}

/* ───── entry ───── */
export async function runAeo({ db, site, month, cc, engines, log = console.log }) {
  const { data: prompts } = await db.from("ai_prompts").select("id, prompt, stage").eq("site_id", site.id);
  if (!prompts?.length) { log("   no AI prompts for this site"); return { answered: 0 }; }
  const brandRe = new RegExp((site.brand_word || site.domain.split(".")[0]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const byPrompt = Object.fromEntries(prompts.map(p => [p.prompt, p]));

  const results = {};
  for (const e of engines) {
    if (ENGINES[e]) results[e] = await scrapeEngine(e, prompts, log);
    else if (e === "google") results[e] = await googleAio(prompts, cc, site.domain, log);
    else if (e === "claude") results[e] = await claude(prompts, log);
  }

  let n = 0;
  for (const [engine, res] of Object.entries(results)) {
    if (!res) continue;
    for (const p of prompts) {
      const r = res[p.prompt];
      const row = { site_id: site.id, prompt_id: p.id, month, engine, measured_at: new Date() };
      if (!r) { Object.assign(row, { answered: false, cited: false, mention: false, src_rank: null, sources: 0, comps: [] }); }
      else {
        const idx = r.uniq.findIndex(h => h.includes(site.domain));
        Object.assign(row, {
          answered: r.answered, cited: idx >= 0, mention: brandRe.test(r.text),
          src_rank: idx >= 0 ? idx + 1 : null, sources: r.uniq.length,
          comps: r.uniq.filter(h => !h.includes(site.domain)).slice(0, 12),
          org_pos: r.orgPos ?? null,
        });
      }
      await db.from("ai_citations").upsert(row, { onConflict: "prompt_id,month,engine" });
      n++;
    }
  }
  return { answered: n };
}

