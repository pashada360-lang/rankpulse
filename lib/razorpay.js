/* Razorpay helpers — server only. Never import from a client component. */
import crypto from "crypto";
import { PLANS, price } from "./plans";

const KEY = () => process.env.RAZORPAY_KEY_ID;
const SECRET = () => process.env.RAZORPAY_KEY_SECRET;
export const configured = () => Boolean(KEY() && SECRET());

export async function rz(path, body, method = "POST") {
  const r = await fetch("https://api.razorpay.com/v1" + path, {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${KEY()}:${SECRET()}`).toString("base64") },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.description || `Razorpay ${r.status}`);
  return j;
}

/* One Razorpay Plan per tier × cycle × currency, created on first use and cached in the DB. */
export async function ensurePlan(db, planKey, cycle, currency) {
  const p = PLANS[planKey];
  const id = `${planKey}:${cycle}:${currency}`;
  const { data: hit } = await db.from("rzp_plans").select("plan_id").eq("id", id).maybeSingle();
  if (hit?.plan_id) return hit.plan_id;

  const plan = await rz("/plans", {
    period: cycle === "annual" ? "yearly" : "monthly",
    interval: 1,
    item: { name: `RankPulse ${p.name} (${cycle}, ${currency})`, amount: price(p, currency, cycle) * 100, currency, description: p.desc },
    notes: { plan: planKey, cycle, currency },
  });
  await db.from("rzp_plans").upsert({ id, plan_id: plan.id, created_at: new Date() });
  return plan.id;
}

/* Checkout signature: HMAC(payment_id|subscription_id, key_secret) */
export function verifyCheckout({ razorpay_payment_id, razorpay_subscription_id, razorpay_signature }) {
  const exp = crypto.createHmac("sha256", SECRET()).update(`${razorpay_payment_id}|${razorpay_subscription_id}`).digest("hex");
  return exp === razorpay_signature;
}

/* Webhook signature: HMAC(raw body, webhook_secret) */
export function verifyWebhook(rawBody, signature) {
  const s = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!s || !signature) return false;
  const exp = crypto.createHmac("sha256", s).update(rawBody).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(exp), Buffer.from(signature)); } catch { return false; }
}

/* Apply a plan to an account. `until` is a unix seconds timestamp from Razorpay, or null to compute. */
export function planUpdate(planKey, cycle, until) {
  const p = PLANS[planKey];
  const renews = until ? new Date(until * 1000) : (() => { const d = new Date(); d.setMonth(d.getMonth() + (cycle === "annual" ? 12 : 1)); return d; })();
  return { plan: planKey, status: "active", billing_cycle: cycle, keyword_limit: p.keywords, region_limit: p.regions, plan_started: new Date(), plan_renews: renews };
}
