/* AEO guidance — the rules that decide whether an AI engine quotes a page.
   Used by the marketing /aeo page and by the in-product AI-search tab. */

export const DO_DONT = {
  do: [
    { t: "Answer in the first 60 words", d: "Open with a direct, self-contained answer to the title question. Engines lift the first extractable answer they find." },
    { t: "Make H2s the literal question", d: "“How much does hotel API integration cost?” — not “Pricing considerations”. Match the phrasing a buyer types." },
    { t: "One fact per sentence in the answer block", d: "Engines quote sentences, not paragraphs. A sentence carrying three claims can't be quoted cleanly." },
    { t: "Put a comparison table wherever a choice exists", d: "Tables are the single most-cited element across all four engines. Vendor vs vendor, approach vs approach, tier vs tier." },
    { t: "Add FAQPage schema", d: "Three to six questions per article, matching the H2s verbatim. It's the cheapest structured signal you can give." },
    { t: "Put a number in the answer", d: "“Live in 15 days”, “sub-500 ms”, “no per-booking fee” — concrete figures get quoted; adjectives don't." },
    { t: "Name competitors honestly", d: "Pages that compare fairly get cited more than pages that only sell. Engines favour sources that read as reference material." },
    { t: "Show a visible last-updated date", d: "And mean it — refresh quarterly. Engines discount stale pages." },
  ],
  dont: [
    { t: "Open with a story or a brand pitch", d: "If the first paragraph is scene-setting, the citation goes to whoever answered first." },
    { t: "Block AI crawlers in robots.txt", d: "GPTBot, Google-Extended, CCBot. It protects nothing public and silently removes you from the answer." },
    { t: "Hide the answer behind a form or a video", d: "Engines can't read a gated PDF or a YouTube embed. Put the answer in HTML text." },
    { t: "Write one 4,000-word page for twelve questions", d: "Engines cite the page whose title is the question. One focused page per question beats one monolith." },
    { t: "Use vague superlatives", d: "“Best-in-class”, “seamless”, “robust”. Unquotable. Replace each with a measurable claim or delete it." },
    { t: "Let the title and H1 disagree", d: "Engines reconcile the two; when they conflict, you lose the match on both." },
    { t: "Rely on images for key facts", d: "Pricing in a PNG, a comparison in a screenshot — invisible to every engine." },
    { t: "Chase brand-name long tail", d: "Ranking above a company for its own name is borrowed authority. Google reclaims it, and AI engines never granted it." },
  ],
};

/* The crawlers that matter, and what each one actually controls.
   `engine` is the EngineLogo key for the product the bot feeds (null = no public mark). */
export const AI_BOTS = [
  { ua: "GPTBot",         who: "OpenAI",      engine: "chatgpt", controls: "Training data. Does not affect live ChatGPT browsing (that's OAI-SearchBot).", severity: "medium" },
  { ua: "OAI-SearchBot",  who: "OpenAI",      engine: "chatgpt", controls: "Live ChatGPT search results and citations.", severity: "high" },
  { ua: "ChatGPT-User",   who: "OpenAI",      engine: "chatgpt", controls: "Pages fetched when a user asks ChatGPT to open a link.", severity: "medium" },
  { ua: "Google-Extended",who: "Google",      engine: "gemini", controls: "Gemini apps and Vertex grounding. Does not affect Google Search or AI Overviews.", severity: "high" },
  { ua: "PerplexityBot",  who: "Perplexity",  engine: "perplexity", controls: "Perplexity index and citations.", severity: "high" },
  { ua: "ClaudeBot",      who: "Anthropic",   engine: "claude", controls: "Claude training and retrieval.", severity: "medium" },
  { ua: "CCBot",          who: "Common Crawl",engine: null, controls: "The open corpus most models are trained on.", severity: "high" },
  { ua: "Bytespider",     who: "ByteDance",   engine: null, controls: "Doubao / TikTok search.", severity: "low" },
];

/* Parse robots.txt and report which AI crawlers are fully blocked (Disallow: /). */
export function auditRobots(text) {
  const lines = String(text || "").split(/\r?\n/).map(l => l.replace(/#.*$/, "").trim()).filter(Boolean);
  const groups = []; let cur = null;
  for (const l of lines) {
    const m = l.match(/^([a-z-]+)\s*:\s*(.*)$/i); if (!m) continue;
    const k = m[1].toLowerCase(), v = m[2].trim();
    if (k === "user-agent") { if (!cur || cur.rules.length) { cur = { agents: [], rules: [] }; groups.push(cur); } cur.agents.push(v.toLowerCase()); }
    else if (cur && (k === "disallow" || k === "allow")) cur.rules.push({ k, v });
  }
  const blockedFor = ua => {
    const g = groups.find(x => x.agents.includes(ua.toLowerCase()));
    const star = groups.find(x => x.agents.includes("*"));
    const rules = g ? g.rules : star ? star.rules : [];
    return rules.some(r => r.k === "disallow" && r.v === "/");
  };
  const results = AI_BOTS.map(b => ({ ...b, blocked: blockedFor(b.ua) }));
  const blocked = results.filter(b => b.blocked);
  return { results, blocked, ok: blocked.length === 0, hasFile: lines.length > 0 };
}

/* Turn a site's own numbers into prioritised recommendations. */
export function recommend({ audit, rankingCount, top3Count, keywordCount, hasAeo }) {
  const out = [];
  if (audit && !audit.hasFile) out.push({ p: 1, kind: "warn", t: "No robots.txt found", d: "That's fine for crawling, but add one with your sitemap URL so engines discover new pages faster." });
  if (audit && audit.blocked.length) {
    const hi = audit.blocked.filter(b => b.severity === "high").map(b => b.ua);
    out.push({ p: 0, kind: "crit", t: `robots.txt blocks ${audit.blocked.length} AI crawler${audit.blocked.length > 1 ? "s" : ""}`,
      d: `${audit.blocked.map(b => b.ua).join(", ")}. ${hi.length ? "Blocking " + hi.join(" and ") + " removes you from live AI answers entirely. " : ""}Delete those Disallow blocks — your pages are already public and indexed; this only stops engines crediting you.` });
  }
  if (audit && audit.ok) out.push({ p: 5, kind: "ok", t: "AI crawlers are allowed", d: "No AI user-agent is blocked site-wide. Re-checked every month — plugins add blocks without telling you." });
  if (keywordCount && rankingCount !== undefined) {
    const r = rankingCount / keywordCount;
    if (r < .3) out.push({ p: 2, kind: "warn", t: "Most tracked keywords aren't on page one", d: "Before chasing AI citations, build the pages. An engine can't cite a page Google can't find. Start with keywords ranking #11–#20 in your own Search Console — those are closest." });
    else if (top3Count !== undefined && top3Count / Math.max(1, rankingCount) < .25) out.push({ p: 3, kind: "info", t: "On page one, rarely in the top three", d: "Positions 4–10 get a fraction of the clicks. Apply the answer-first format to your ranking pages: direct answer in 60 words, question-phrased H2s, a comparison table, FAQ schema." });
    else out.push({ p: 4, kind: "ok", t: "Strong page-one footprint", d: "Now the question is whether AI engines cite those pages. That's the gap that's cheapest to close." });
  }
  if (!hasAeo) out.push({ p: 6, kind: "info", t: "AI-search tracking is on the Growth plan", d: "Measure citation rate across ChatGPT, Perplexity, Gemini and Google AI on real buyer questions, with a fix list ranked by payoff." });
  return out.sort((a, b) => a.p - b.p);
}
