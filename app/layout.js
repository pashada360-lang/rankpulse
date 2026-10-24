import "./globals.css";

export const metadata = {
  title: "RankPulse",
  description: "Track where your brand ranks on Google and whether AI assistants cite you — month on month, across any country.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
