/* Plans are defined once, here. Read by the marketing pricing page, the billing page,
   the checkout route and the worker. Annual = 10 × monthly → two months free. */
export const PLANS = {
  starter: {
    name: "Starter", desc: "One site. The keywords that decide deals.",
    usd: 29, inr: 2499, keywords: 50, regions: 2, sites: 1,
    aeo: false, perks: ["50 keywords", "2 countries", "Monthly automatic scans", "Full history, never deleted", "Who holds page one, per keyword", "CSV export"],
  },
  growth: {
    name: "Growth", desc: "Every market you sell to, plus AI search.", hot: true,
    usd: 79, inr: 6499, keywords: 200, regions: 4, sites: 1,
    aeo: true, perks: ["200 keywords", "4 countries", "AI-search visibility (ChatGPT, Perplexity, Gemini, Google AI)", "AEO fix list with do / don't per page", "Crawler-access audit", "Scan on demand", "Priority support"],
  },
  scale: {
    name: "Scale", desc: "Agencies and multi-brand teams.",
    usd: 199, inr: 16499, keywords: 1000, regions: 4, sites: 10,
    aeo: true, perks: ["1,000 keywords", "Up to 10 sites", "4 countries per site", "Everything in Growth", "Client-ready monthly PDF", "Dedicated onboarding"],
  },
};
export const ANNUAL_MONTHS = 10;
export const price = (p, cur, cycle) => {
  const m = cur === "INR" ? p.inr : p.usd;
  return cycle === "annual" ? m * ANNUAL_MONTHS : m;
};
export const fmt = (n, cur) => cur === "INR" ? "₹" + n.toLocaleString("en-IN") : "$" + n.toLocaleString("en-US");
export const guessCurrency = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = navigator.language || "";
    return (/Kolkata|Calcutta/.test(tz) || /-IN$/i.test(lang)) ? "INR" : "USD";
  } catch { return "USD"; }
};
