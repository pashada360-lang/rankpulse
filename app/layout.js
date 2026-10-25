import "./globals.css";
import "./tracker.css";
import "./site.css";
import "./landing.css";
import { Outfit, DM_Sans, JetBrains_Mono } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-outfit", display: "swap" });
const dm = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-dm", display: "swap" });
const jb = JetBrains_Mono({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-jb", display: "swap" });

export const metadata = {
  title: "RankPulse — real Google positions, every market, every month",
  description: "Track where your brand ranks on Google from real IPs in each country you sell to, and whether ChatGPT, Perplexity and Gemini cite you. Monthly, honest, no estimates.",
  openGraph: { title: "RankPulse", description: "Real Google positions and AI-search visibility for the markets you sell to.", type: "website" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${dm.variable} ${jb.variable}`}>
      <body className="mk">{children}</body>
    </html>
  );
}
