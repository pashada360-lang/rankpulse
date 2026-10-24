/* Create a Razorpay order for a plan. Needs RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in Vercel.
   Until those exist, returns a clear message rather than a broken checkout. */
import { sbAdmin } from "../../../lib/supabase";
import { PLANS, price } from "../../../lib/plans";

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

    const keyId = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !secret) {
      return Response.json({ error: "Payments are being switched on — email hello@rankpulse.app and we'll activate your plan by hand today." }, { status: 503 });
    }

    const { data: acc } = await db.from("accounts").select("id").eq("owner_id", u.user.id).single();
    const amount = price(p, cur, cycle) * 100;    // paise or cents

    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64") },
      body: JSON.stringify({ amount, currency: cur, receipt: `rp_${acc.id.slice(0, 8)}_${Date.now()}`, notes: { account_id: acc.id, plan, cycle } }),
    });
    const order = await r.json();
    if (!r.ok) return Response.json({ error: order.error?.description || "Razorpay rejected the order." }, { status: 502 });

    await db.from("payments").insert({ account_id: acc.id, provider_id: order.id, plan, cycle, amount_inr: cur === "INR" ? amount / 100 : 0, status: "created", raw: { ...order, currency: cur } });
    return Response.json({ key: keyId, orderId: order.id, amount, currency: cur });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
