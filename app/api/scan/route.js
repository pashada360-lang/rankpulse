/* Queue a scan. The heavy lifting happens in the GitHub Actions worker —
   a 580-request scan takes ~25 minutes and would time out here. */
import { sbAdmin } from "../../../lib/supabase";
import { monthKey } from "../../../lib/supabase";

export async function POST(req) {
  try {
    const { siteId, month } = await req.json();
    if (!siteId) return Response.json({ error: "siteId required" }, { status: 400 });

    const db = sbAdmin();
    const m = month || monthKey();

    const { data: site } = await db.from("sites").select("id, account_id").eq("id", siteId).single();
    if (!site) return Response.json({ error: "site not found" }, { status: 404 });

    const { data: acc } = await db.from("accounts")
      .select("status, plan, trial_ends_at").eq("id", site.account_id).single();

    if (acc?.status === "cancelled") {
      return Response.json({ error: "Subscription cancelled — reactivate to run scans." }, { status: 402 });
    }
    if (acc?.plan === "trial" && acc.trial_ends_at && new Date(acc.trial_ends_at) < new Date()) {
      return Response.json({ error: "Your free trial has ended. Choose a plan to keep tracking." }, { status: 402 });
    }

    const { data: existing } = await db.from("runs")
      .select("id, status").eq("site_id", siteId).eq("month", m).maybeSingle();

    if (existing && ["queued", "running"].includes(existing.status)) {
      return Response.json({ ok: true, status: existing.status, note: "already in progress" });
    }

    const { error } = await db.from("runs").upsert(
      { site_id: siteId, month: m, status: "queued", note: null },
      { onConflict: "site_id,month" }
    );
    if (error) throw error;

    return Response.json({ ok: true, status: "queued", month: m });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
