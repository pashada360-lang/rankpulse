/* Razorpay webhook — the source of truth for renewals, failures and cancellations.
   Configure in Razorpay: Account & Settings → Webhooks → this URL, secret → RAZORPAY_WEBHOOK_SECRET. */
import { sbAdmin } from "../../../../lib/supabase";
import { verifyWebhook, planUpdate } from "../../../../lib/razorpay";

export async function POST(req) {
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers.get("x-razorpay-signature"))) {
    return new Response("bad signature", { status: 400 });
  }
  const evt = JSON.parse(raw);
  const db = sbAdmin();
  const eventId = req.headers.get("x-razorpay-event-id") || `${evt.event}:${evt.created_at}`;

  /* idempotency — Razorpay retries deliveries */
  const { error: dup } = await db.from("webhook_events").insert({ id: eventId, event: evt.event });
  if (dup) return Response.json({ ok: true, duplicate: true });

  const sub = evt.payload?.subscription?.entity;
  const pay = evt.payload?.payment?.entity;
  const notes = sub?.notes || pay?.notes || {};
  const accountId = notes.account_id;

  const findAccount = async () => {
    if (accountId) return accountId;
    if (sub?.id) { const { data } = await db.from("accounts").select("id").eq("razorpay_subscription_id", sub.id).maybeSingle(); return data?.id; }
    return null;
  };
  const acc = await findAccount();
  if (!acc) return Response.json({ ok: true, ignored: "no account" });

  switch (evt.event) {
    case "subscription.activated":
    case "subscription.charged": {
      const upd = planUpdate(notes.plan || "growth", notes.cycle || "monthly", sub?.current_end || null);
      await db.from("accounts").update({ ...upd, razorpay_subscription_id: sub.id }).eq("id", acc);
      if (pay) await db.from("payments").insert({ account_id: acc, provider_id: pay.id, plan: notes.plan || "growth", cycle: notes.cycle || "monthly", currency: pay.currency, amount: pay.amount, amount_inr: pay.currency === "INR" ? pay.amount / 100 : 0, status: "paid", raw: pay });
      break;
    }
    case "subscription.pending":
    case "subscription.halted":
      await db.from("accounts").update({ status: "past_due" }).eq("id", acc);
      break;
    case "subscription.cancelled":
    case "subscription.completed":
    case "subscription.expired":
      await db.from("accounts").update({ status: "cancelled" }).eq("id", acc);
      break;
    case "payment.failed":
      if (pay) await db.from("payments").insert({ account_id: acc, provider_id: pay.id, plan: notes.plan || "", cycle: notes.cycle || "", currency: pay.currency, amount: pay.amount, amount_inr: 0, status: "failed", raw: pay });
      break;
    default:
      break;
  }
  return Response.json({ ok: true });
}
