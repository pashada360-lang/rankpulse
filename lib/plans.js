/* Plans are defined once, here, and read by the pricing page, the checkout route and the worker. */
export const PLANS = {
  starter: { name: "Starter", monthly: 999,  annual: 9990,  keywords: 50,  regions: 2, desc: "One site, the keywords that matter." },
  growth:  { name: "Growth",  monthly: 1999, annual: 19990, keywords: 150, regions: 4, desc: "Every market you sell to.", hot: true },
  agency:  { name: "Agency",  monthly: 4999, annual: 49990, keywords: 500, regions: 4, desc: "Client sites under one login." },
};
/* annual = 10 × monthly → two months free */
export const inr = n => "₹" + n.toLocaleString("en-IN");
