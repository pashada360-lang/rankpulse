# RankPulse — go live

Four accounts, all free, no card. About 25 minutes end to end.

---

## 1 · Supabase — database and login

1. **https://supabase.com** → sign in with GitHub → **New project**
   Name `rankpulse`, region **Mumbai (ap-south-1)**, set a database password and save it somewhere.
2. Wait ~2 minutes for it to provision.
3. **SQL Editor → New query** → paste the whole of `supabase/schema.sql` → **Run**.
   You should see *Success. No rows returned*.
4. **Authentication → Providers → Email** → turn **Confirm email** OFF for now.
   (Customers get straight in. Turn it back on before you take real money.)
5. **Project Settings → API** — copy these three, you need them twice:

   | Name | Where it goes |
   |---|---|
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` `secret` key | `SUPABASE_SERVICE_KEY` |

   ⚠️ The **service_role** key bypasses all security. It goes in Vercel and GitHub secrets only —
   never in the browser, never committed, never pasted into a chat.

---

## 2 · GitHub — code and the scan worker

```bash
cd C:/Users/Pasha/Downloads/rankpulse
git remote add origin https://github.com/YOURNAME/rankpulse.git
git push -u origin main
```

Make the repo **private**.

Then **Settings → Secrets and variables → Actions → New repository secret**, four of them:

| Secret | Value |
|---|---|
| `SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_KEY` | the service_role key |
| `BRIGHTDATA_KEY` | your Bright Data API key |
| `BRIGHTDATA_ZONE` | `serp_api1` |

This is what actually runs the scans. A 580-request scan takes ~25 minutes, which no serverless
function allows — GitHub Actions gives you 6 hours per job and 2,000 free minutes a month.

---

## 3 · Vercel — the app

1. **https://vercel.com** → sign in with GitHub → **Add New → Project** → import `rankpulse`
2. Before deploying, add three **Environment Variables**:

   ```
   NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY  = eyJ...
   SUPABASE_SERVICE_KEY           = eyJ...
   ```
3. **Deploy.** You get `rankpulse.vercel.app` in about a minute.

---

## 4 · Test it end to end

1. Open your Vercel URL → **Start free**
2. Create an account, add a domain, pick two countries, paste 5 keywords
3. In GitHub → **Actions → RankPulse scans → Run workflow**
4. Watch the log. Results appear on the dashboard as they land.

If the Action says `BRIGHTDATA_KEY not set`, the secret name is wrong — it is case-sensitive.

---

## What runs when

| Trigger | What happens |
|---|---|
| 1st of month, 08:00 IST | Queues and scans every active site |
| Every 20 minutes | Picks up scans customers queued by hand |
| Actions → Run workflow | Manual, for testing |

---

## What this costs you

| | |
|---|---|
| Supabase, Vercel, GitHub | **₹0** — free tiers, no card |
| Bright Data | **~₹25 per customer per month** (100 keywords × 2 countries) |
| Razorpay / Stripe | ~2% per transaction, no monthly fee |

At ₹1,999/month per customer that is roughly a 98% gross margin. Your existing Bright Data
free credits cover the first several customers before you pay anything.

---

## Still to build

- **Payments** — Razorpay plans, annual = 2 months free, webhook to set `accounts.plan`
- **Landing page** — the current one is a placeholder
- **Email reports** — monthly summary when a scan finishes
- **AI citation tracking** — the ChatGPT / Perplexity / Gemini scanners from the internal tool

---

## Rules the code depends on

Do not relax these — each was learned by getting it wrong on the internal tracker.

**Unmeasured is not the same as not ranking.** `null` = we could not measure, `0` = measured and
not on page one. Conflating them turns a normal month into a fake collapse.

**A result page that yields fewer than 4 organic blocks is unmeasured.** The guard is in
`worker/run.mjs`. Removing it once turned an entire month into false negatives.

**Count organic blocks, not links.** Sitelinks otherwise inflate positions — a genuine #2 logs as #6.

**Bright Data returns empty 200s at random.** The worker always runs a retry pass. Never skip it.

**Page one only.** Position 11 and position 80 both mean nobody found you.
