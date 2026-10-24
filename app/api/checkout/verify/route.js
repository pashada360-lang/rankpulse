/* Verify Razorpay's signature after checkout, then activate the plan. */
import crypto from "crypto";
import { sbAdmin } from "../../../../lib/supabase";
import { PLANS } from "../../../../lib/plans";

export async function POST(req) {
  try {
    const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const db = sbAdmin();
    const { data: u } = await db.auth.getUser(tok);
    if (!u?.user) return Response.json({ error: "Sign in first." }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, cycle } = await req.json();
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expected = crypto.createHmac("sha256", secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (expected !== razorpay_signature) return Response.json({ error: "Signature mismatch — payment not verified." }, { status: 400 });

    const p = PLANS[plan];
    const { data: acc } = await db.from("accounts").select("id").eq("owner_id", u.user.id).single();
    const now = new Date();
    const renews = new Date(now); renews.setMonth(renews.getMonth() + (cycle === "annual" ? 12 : 1));

    await db.from("accounts").update({
      plan, status: "active", billing_cycle: cycle,
      keyword_limit: p.keywords, region_limit: p.regions,
      plan_started: now, plan_renews: renews,
    }).eq("id", acc.id);

    await db.from("payments").update({ status: "paid", raw: { razorpay_payment_id, razorpay_signature } }).eq("provider_id", razorpay_order_id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
