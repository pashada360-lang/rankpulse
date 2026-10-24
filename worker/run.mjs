/* RankPulse scan worker.
   Runs in GitHub Actions (free, 6h limit) because a full scan takes ~25 min —
   far longer than any serverless function allows.

   Picks up every queued run, scans it, writes results back, marks it done.
   Usage:  node worker/run.mjs            — process all queued runs
           node worker/run.mjs --monthly  — also queue a run for every active site */
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "child_process";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});
const KEY = process.env.BRIGHTDATA_KEY;
const ZONE = process.env.BRIGHTDATA_ZONE || "serp_api1";
const CC = { IN: "in", US: "us", ME: "ae", EU: "gb" };
const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const monthKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

/* ───────── Bright Data ───────── */
function post(body) {
  try {
    return execFileSync("curl", [
      "-s", "-m", "150", "-X", "POST", "https://api.brightdata.com/request",
      "-H", `Authorization: Bearer ${KEY}`,
      "-H", "Content-Type: application/json",
      "--data-binary", JSON.stringify(body),
    ], { maxBuffer: 64 * 1024 * 1024 }).toString();
  } catch { return ""; }
}

const host = u => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const SKIP = /google\.|gstatic|googleadservices|googleusercontent|youtube\.|translate\.goog|webcache/;

/* Count ORGANIC BLOCKS, not links. Sitelinks otherwise inflate positions —
   a genuine #2 logs as #6. Only anchors containing an <h3>, same-domain runs collapsed. */
function organicFromHtml(html) {
  const hits = [];
  for (const m of html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>(?:(?!<\/a>)[\s\S]){0,400}?<h3/g))
    hits.push({ i: m.index, h: m[1].replace(/&amp;/g, "&") });
  for (const m of html.matchAll(/<h3[^>]*>(?:(?!<\/h3>)[\s\S]){0,200}?<a[^>]*href="(https?:\/\/[^"]+)"/g))
    hits.push({ i: m.index, h: m[1].replace(/&amp;/g, "&") });
  hits.sort((a, b) => a.i - b.i);
  const out = []; let prev = "";
  for (const { h } of hits) {
    const d = host(h);
    if (!d || SKIP.test(d) || d === prev) continue;
    out.push(d); prev = d;
  }
  return out;
}

/* Returns { pos, top } or { err }.
   pos: null = measured but not on page one is represented as 0; null never leaves here. */
function query(phrase, domain, cc, tries = 2) {
  const base = `https://www.google.com/search?q=${encodeURIComponent(phrase)}&gl=${cc}&hl=en`;

  for (let a = 0; a < tries; a++) {
    const raw = post({ zone: ZONE, url: base + "&brd_json=1", format: "raw", country: cc });
    if (raw.trim()) {
      try {
        const j = JSON.parse(raw);
        const org = j.organic || [];
        if (org.length) {
          const top = org.slice(0, 10).map(o => host(o.link || "")).filter(d => d && !SKIP.test(d));
          const i = top.findIndex(d => d.includes(domain));
          return { pos: i < 0 ? 0 : i + 1, top };
        }
      } catch { /* fall through to html */ }
    }
    sleep(1200);
  }

  for (let a = 0; a < tries; a++) {
    const html = post({ zone: ZONE, url: base, format: "raw", data_format: "html", country: cc });
    if (html && html.length > 20000) {
      const u = organicFromHtml(html);
      /* STRICT GATE — a page we cannot parse into >=4 organic blocks is UNMEASURED,
         never "not ranking". Removing this once turned a whole month into false negatives. */
      if (u.length >= 4) {
        const top = u.slice(0, 10);
        const i = top.findIndex(d => d.includes(domain));
        return { pos: i < 0 ? 0 : i + 1, top };
      }
    }
    sleep(1200);
  }
  return { err: 1 };
}

/* ───────── one run ───────── */
async function processRun(run) {
  const { data: site } = await db.from("sites").select("*").eq("id", run.site_id).single();
  const { data: keywords } = await db.from("keywords").select("id, phrase").eq("site_id", run.site_id);
  if (!site || !keywords?.length) {
    await db.from("runs").update({ status: "failed", note: "no site or keywords", finished_at: new Date() }).eq("id", run.id);
    return;
  }

  await db.from("runs").update({ status: "running", started_at: new Date() }).eq("id", run.id);
  console.log(`\n▶ ${site.domain} · ${run.month} · ${keywords.length} keywords × ${site.regions.length} regions`);

  let measured = 0, ranking = 0, errors = 0;
  const failed = [];

  for (const region of site.regions) {
    const cc = CC[region] || "us";
    for (const k of keywords) {
      const r = query(k.phrase, site.domain, cc);
      if (r.err) { errors++; failed.push({ k, region, cc }); continue; }
      measured++; if (r.pos > 0) ranking++;
      await db.from("rankings").upsert({
        site_id: site.id, keyword_id: k.id, month: run.month, region,
        position: r.pos, top_domains: r.top, measured_at: new Date(),
      }, { onConflict: "keyword_id,month,region" });
      sleep(250);
    }
    console.log(`   ${region}: done`);
  }

  /* Retry pass — Bright Data returns empty 200s at random. Treating those as
     "not ranking" manufactures a collapse that never happened. */
  if (failed.length) {
    console.log(`   retrying ${failed.length} failures…`);
    for (const f of failed) {
      const r = query(f.k.phrase, site.domain, f.cc, 4);
      if (r.err) continue;
      errors--; measured++; if (r.pos > 0) ranking++;
      await db.from("rankings").upsert({
        site_id: site.id, keyword_id: f.k.id, month: run.month, region: f.region,
        position: r.pos, top_domains: r.top, measured_at: new Date(),
      }, { onConflict: "keyword_id,month,region" });
      sleep(400);
    }
  }

  await db.from("runs").update({
    status: "done", measured, ranking, errors,
    note: errors ? `${errors} still unmeasured` : null,
    finished_at: new Date(),
  }).eq("id", run.id);

  console.log(`✔ ${site.domain}: ${measured} measured, ${ranking} ranking, ${errors} unmeasured`);
}

/* ───────── main ───────── */
if (!KEY) { console.error("BRIGHTDATA_KEY not set"); process.exit(1); }

if (process.argv.includes("--monthly")) {
  const m = monthKey();
  const { data: sites } = await db.from("sites").select("id, account_id");
  let queued = 0;
  for (const s of sites || []) {
    const { data: acc } = await db.from("accounts").select("status, plan, trial_ends_at").eq("id", s.account_id).single();
    if (!acc || acc.status === "cancelled") continue;
    if (acc.plan === "trial" && acc.trial_ends_at && new Date(acc.trial_ends_at) < new Date()) continue;
    await db.from("runs").upsert({ site_id: s.id, month: m, status: "queued" }, { onConflict: "site_id,month" });
    queued++;
  }
  console.log(`queued ${queued} sites for ${m}`);
}

const { data: queue } = await db.from("runs").select("*").eq("status", "queued").order("id");
console.log(`${queue?.length || 0} run(s) to process`);
for (const run of queue || []) {
  try { await processRun(run); }
  catch (e) {
    console.error("run failed:", e.message);
    await db.from("runs").update({ status: "failed", note: String(e.message).slice(0, 300), finished_at: new Date() }).eq("id", run.id);
  }
}
console.log("\nall done");
