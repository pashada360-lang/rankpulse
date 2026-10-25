/* Sample account for /dashboard?demo=1 — lets prospects (and us) see the real product
   without signing in. Shapes match the Supabase rows the dashboard reads. */
import { monthKey } from "./supabase";

const back = n => { const d = new Date(); return monthKey(new Date(d.getFullYear(), d.getMonth() - n, 1)); };

const KW = [
  ["hotel booking software", "commercial", "Core product", [8, 6, 4, 2]],
  ["best booking engine for otas", "commercial", "Core product", [0, 9, 5, 3]],
  ["white label travel portal", "commercial", "White label", [5, 5, 3, 1]],
  ["b2b hotel booking platform", "commercial", "B2B", [0, 0, 7, 4]],
  ["hotel api provider", "commercial", "Core product", [10, 1, 1, 1]],
  ["channel manager pricing", "priority", "Pricing", [3, 2, 2, 2]],
  ["hotel api aggregator", "priority", "Core product", [3, 2, 1, 1]],
  ["ota api integration", "priority", "Integration", [0, 6, 6, 0]],
  ["how to integrate hotelbeds api", "longtail", "Guides", [0, 0, 8, 6]],
  ["hotel booking api price", "longtail", "Pricing", [7, 5, 5, 5]],
];
const SHIFT = { IN: 0, US: 1, ME: 2, EU: 3 };

export function demoData() {
  const months = [back(3), back(2), back(1), back(0)];
  const site = { id: "demo", domain: "yourbrand.com", brand_word: "yourbrand", regions: ["IN", "US", "ME", "EU"], created_at: new Date(new Date().getFullYear(), new Date().getMonth() - 3, 3).toISOString(), category: "hotel booking API" };
  const acc = { id: "demo", plan: "growth", keyword_limit: 200, status: "active" };
  const rows = KW.map(([phrase, tab, grp, base], i) => {
    const cells = {};
    for (const [r, sh] of Object.entries(SHIFT)) months.forEach((m, j) => {
      const v = base[j]; cells[`${m}|${r}`] = v === 0 ? 0 : Math.min(10, v + ((i + sh) % 3 === 0 ? sh : 0));
    });
    return { id: "k" + i, site_id: "demo", phrase, tab, grp, cells };
  });
  const runs = [{ id: "r1", month: months[3], status: "done" }, { id: "r0", month: months[2], status: "done" }];
  const prompts = [
    ["Vendor evaluation", "best hotel booking api providers"], ["Vendor evaluation", "top hotel api companies"],
    ["Comparison", "yourbrand vs competitors"], ["Category education", "how does hotel api integration work"],
    ["Pricing", "how much does a hotel api cost"], ["Problem-aware", "how do I add hotels to my travel site"],
  ].map(([stage, prompt], i) => ({ id: "p" + i, site_id: "demo", stage, prompt }));
  const RATE = { chatgpt: [1, 1, 1, 0, 0, 0], perplexity: [1, 1, 1, 1, 0, 0], gemini: [0, 0, 1, 0, 0, 0], claude: [1, 0, 1, 1, 0, 0], google: [1, 1, 0, 0, 0, 0] };
  const COMPS = ["travelopro.com", "trawex.com", "altexsoft.com", "vervotech.com", "developers.booking.com"];
  const cites = [];
  for (const [engine, hits] of Object.entries(RATE)) prompts.forEach((p, i) => cites.push({
    id: engine + i, site_id: "demo", prompt_id: p.id, month: months[3], engine, answered: true,
    cited: !!hits[i], mention: !!hits[i] || i === 2, src_rank: hits[i] ? 1 + (i % 2) : null, sources: 6,
    comps: COMPS.slice(i % 2, i % 2 + 3), org_pos: engine === "google" ? [2, 4, 1, 0, 6, 0][i] : null,
  }));
  const opps = [
    ["hotel api provider in india", "Commercial", 2, ["travelopro.com", "trawex.com", "amarinfotech.com"], 92],
    ["white label hotel booking platform", "Commercial", 0, ["technoheaven.com", "cultbooking.com", "travelopro.com"], 88],
    ["b2b vs b2c travel portal", "Comparison", 5, ["it4tsolutions.com", "flightslogic.com"], 84],
    ["how to integrate hotelbeds api", "Blog", 0, ["developer.hotelbeds.com", "altexsoft.com"], 79],
    ["hotel channel manager company", "Commercial", 8, ["siteminder.com", "hoteltechreport.com"], 76],
    ["hotel booking api documentation", "Integration", 0, ["developers.booking.com", "developer.hotelbeds.com"], 70],
  ].map(([phrase, cls, position, top_domains, score], i) => ({ id: i, phrase, cls, demand: true, position, top_domains, score }));
  return { site, acc, rows, runs, prompts, cites, opps, months: months.map(month => ({ month })) };
}
