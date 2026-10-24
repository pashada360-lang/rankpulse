/* After Razorpay Checkout succeeds: verify the signature, activate the plan immediately.
   The webhook will confirm (and keep extending) it independently. */
import { sbAdmin } from "../../../../lib/supabase";
import { PLANS } from "../../../../lib/plans";
import { verifyCheckout, planUpdate } from "../../../../lib/razorpay";

export async function POST(req) {
  try {
    const tok = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const db = sbAdmin();
    const { data: u } = await db.auth.getUser(tok);
    if (!u?.user) return Response.json({ error: "Sign in first." }, { status: 401 });

    const body = await req.json();
    const { plan, cycle } = body;
    if (!PLANS[plan]) return Response.json({ error: "Unknown plan." }, { status: 400 });
    if (!verifyCheckout(body)) return Response.json({ error: "Signature mismatch — payment not verified." }, { status: 400 });

    const { data: acc } = await db.from("accounts").select("id").eq("owner_id", u.user.id).single();
    await db.from("accounts").update({ ...planUpdate(plan, cycle, null), razorpay_subscription_id: body.razorpay_subscription_id }).eq("id", acc.id);
    await db.from("payments").update({ status: "paid", raw: { payment_id: body.razorpay_payment_id, verified_at: new Date() } }).eq("provider_id", body.razorpay_subscription_id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
