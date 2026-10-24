import { createClient } from "@supabase/supabase-js";

/* Browser client — carries the signed-in user, so every query is filtered by RLS. */
let browser;
export function sb() {
  if (!browser) {
    browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: true, autoRefreshToken: true } }
    );
  }
  return browser;
}

/* Server client — bypasses RLS. Only for API routes and the worker, never the browser. */
export function sbAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );
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
