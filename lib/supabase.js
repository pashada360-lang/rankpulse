import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const configured = Boolean(URL && ANON);

/* Browser client — carries the signed-in user, so every query is filtered by RLS. */
let browser;
export function sb() {
  if (!configured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY in your Vercel project settings, then redeploy. " +
      "These are read at build time, so adding them without a rebuild has no effect."
    );
  }
  if (!browser) {
    browser = createClient(URL, ANON, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return browser;
}

/* Server client — bypasses RLS. Only for API routes and the worker, never the browser. */
export function sbAdmin() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!URL || !key) throw new Error("SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_URL missing on the server.");
  return createClient(URL, key, { auth: { persistSession: false } });
}

export const REGIONS = {
  IN: { name: "India", cc: "in" },
  US: { name: "United States", cc: "us" },
  ME: { name: "Middle East", cc: "ae" },
  EU: { name: "Europe", cc: "gb" },
};

export const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function lastMonths(n = 6) {
  const out = [];
  const d = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push({
      k: monthKey(x),
      label: x.toLocaleString("en", { month: "short" }) + "-" + String(x.getFullYear()).slice(2),
    });
  }
  return out;
}
