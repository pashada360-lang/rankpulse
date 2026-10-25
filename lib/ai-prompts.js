/* Default buyer questions for a new site — eight funnel stages, brand and category substituted.
   Shared by onboarding, the keywords page and the worker. */
export const STAGES = ["Problem-aware", "Category education", "Vendor evaluation", "Comparison", "Supplier integration", "Implementation", "Pricing", "Brand"];

export function defaultPrompts(brand, category) {
  const c = (category || "this kind of software").trim();
  const b = (brand || "our brand").trim();
  return [
    ["Problem-aware", `how do I get started with ${c} for my business`],
    ["Problem-aware", `what problems does ${c} solve`],
    ["Category education", `what is ${c} and how does it work`],
    ["Category education", `how does ${c} integration work`],
    ["Vendor evaluation", `best ${c} providers`],
    ["Vendor evaluation", `top ${c} companies to consider`],
    ["Vendor evaluation", `which ${c} provider is best for a small team`],
    ["Comparison", `${b} vs competitors`],
    ["Comparison", `alternatives to ${b}`],
    ["Implementation", `what do I need to implement ${c}`],
    ["Implementation", `how long does ${c} take to set up`],
    ["Pricing", `how much does ${c} cost`],
    ["Pricing", `${c} pricing models explained`],
    ["Brand", `what is ${b}`],
    ["Brand", `is ${b} reliable`],
  ].map(([stage, prompt]) => ({ stage, prompt }));
}

export const ENGINE_LABELS = { chatgpt: "ChatGPT", perplexity: "Perplexity", gemini: "Gemini", claude: "Claude", google: "Google AI Overview" };
export const ENGINE_ORDER = ["chatgpt", "perplexity", "gemini", "claude", "google"];
