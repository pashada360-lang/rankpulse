/* Start a recurring subscription for a plan. Returns a subscription id for Razorpay Checkout.
   Needs RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET; until set, returns a friendly message. */
import { sbAdmin } from "../../../lib/supabase";
import { PLANS, price } from "../../../lib/plans";
import { configured, ensurePlan, rz } from "../../../lib/razorpay";

export async function POST(req) {
  try {
    const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const db = sbAdmin();
    const { data: u } = tok ? await db.auth.getUser(tok) : { data: null };
    if (!u?.user) return Response.json({ error: "Sign in first." }, { status: 401 });

    const { plan, cycle, currency } = await req.json();
    const p = PLANS[plan];
    const cur = currency === "INR" ? "INR" : "USD";
    if (!p || !["monthly", "annual"].includes(cycle)) return Response.json({ error: "Unknown plan." }, { status: 400 });
    if (!configured()) return Response.json({ error: "Payments are being switched on — email pashada360@gmail.com and we'll activate your plan by hand today." }, { status: 503 });

    const { data: acc } = await db.from("accounts").select("id, company").eq("owner_id", u.user.id).single();
    const planId = await ensurePlan(db, plan, cycle, cur);

    const sub = await rz("/subscriptions", {
      plan_id: planId,
      total_count: cycle === "annual" ? 10 : 120,     // 10 years either way; customer can cancel any time
      quantity: 1,
      customer_notify: 1,
      notes: { account_id: acc.id, plan, cycle, currency: cur, company: acc.company },
    });

    await db.from("payments").insert({
      account_id: acc.id, provider_id: sub.id, plan, cycle, currency: cur,
      amount: price(p, cur, cycle) * 100, amount_inr: cur === "INR" ? price(p, cur, cycle) : 0,
      status: "created", raw: sub,
    });
    await db.from("accounts").update({ razorpay_subscription_id: sub.id, currency: cur }).eq("id", acc.id);

    return Response.json({ key: process.env.RAZORPAY_KEY_ID, subscriptionId: sub.id, currency: cur });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
