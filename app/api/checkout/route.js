/* Create a Razorpay order for a plan. Needs RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in Vercel.
   Until those are set, returns a clear message rather than a broken checkout. */
import { sbAdmin } from "../../../lib/supabase";
import { PLANS } from "../../../lib/plans";

async function userFrom(req) {
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!tok) return null;
  const { data } = await sbAdmin().auth.getUser(tok);
  return data?.user || null;
}

export async function POST(req) {
  try {
    const user = await userFrom(req);
    if (!user) return Response.json({ error: "Sign in first." }, { status: 401 });

    const { plan, cycle } = await req.json();
    const p = PLANS[plan];
    if (!p || !["monthly", "annual"].includes(cycle)) return Response.json({ error: "Unknown plan." }, { status: 400 });

    const keyId = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !secret) {
      return Response.json({ error: "Payments are being switched on — email pasha@zentrumhub.com and we'll activate your plan by hand today." }, { status: 503 });
    }

    const db = sbAdmin();
    const { data: acc } = await db.from("accounts").select("id, company").eq("owner_id", user.id).single();
    const amount = (cycle === "monthly" ? p.monthly : p.annual) * 100;   // paise

    const r = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64") },
      body: JSON.stringify({ amount, currency: "INR", receipt: `rp_${acc.id.slice(0, 8)}_${Date.now()}`, notes: { account_id: acc.id, plan, cycle } }),
    });
    const order = await r.json();
    if (!r.ok) return Response.json({ error: order.error?.description || "Razorpay rejected the order." }, { status: 502 });

    await db.from("payments").insert({ account_id: acc.id, provider_id: order.id, plan, cycle, amount_inr: amount / 100, status: "created", raw: order });
    return Response.json({ key: keyId, orderId: order.id, amount });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
