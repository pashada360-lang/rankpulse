import "./globals.css";
import "./tracker.css";

export const metadata = {
  title: "RankPulse — know exactly where you rank",
  description: "Monthly Google rankings for your keywords, measured from real IPs in every country you sell to. See what moved, by region, every month.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
