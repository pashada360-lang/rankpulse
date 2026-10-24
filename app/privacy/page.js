import Legal from "../../components/Legal";
export const metadata = { title: "Privacy Policy — RankPulse" };
export default function Privacy() {
  return (
    <Legal title="Privacy Policy">
      <p>This policy explains what RankPulse collects, why, and how it is handled. We collect the minimum needed to run the service.</p>
      <h2>What we collect</h2>
      <ul>
        <li><b>Account data:</b> your email, company name and a hashed password, stored by our authentication provider (Supabase).</li>
        <li><b>Service data:</b> the domains, keywords, countries and questions you add, and the measurements we produce for them.</li>
        <li><b>Billing data:</b> plan, billing cycle and payment status. Card and bank details are collected and stored by Razorpay, never by us.</li>
        <li><b>Technical data:</b> standard server logs (IP address, browser, pages requested) kept for security and debugging for up to 30 days.</li>
      </ul>
      <p>We do not use advertising trackers, sell data, or build profiles of you.</p>
      <h2>How we use it</h2>
      <p>To run scans you request, show you results, bill you, respond to support requests and keep the service secure. We send transactional email (account, billing, scan completion). Marketing email only if you opt in, and you can opt out any time.</p>
      <h2>Where it lives</h2>
      <p>Application data is hosted on Supabase (database and authentication) and Vercel (application), and scans run on GitHub Actions. Search measurements are obtained through Bright Data's SERP API. Payments are processed by Razorpay. Each of these providers processes data under their own privacy terms.</p>
      <h2>Your rights</h2>
      <p>You can export your data from the dashboard at any time. You can ask us to correct or delete your account and data by emailing <a href="mailto:hello@rankpulse.app">hello@rankpulse.app</a>; we complete deletion within 30 days. Residents of jurisdictions with specific data-protection rights (including the EU, UK and India's DPDP Act) may exercise those rights through the same address.</p>
      <h2>Cookies</h2>
      <p>We use only the cookies and local storage needed to keep you signed in and remember dashboard preferences. No third-party advertising cookies.</p>
      <h2>Children</h2>
      <p>The Service is for businesses and is not directed at anyone under 18.</p>
      <h2>Changes</h2>
      <p>We will post updates here and, for material changes, email account holders.</p>
      <h2>Contact</h2>
      <p>ZentrumHub Technologies · Pune, India · <a href="mailto:hello@rankpulse.app">hello@rankpulse.app</a></p>
    </Legal>
  );
}
