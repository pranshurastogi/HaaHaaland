import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "HaaHaaLand — Your timeline, scouted",
  description:
    "Get scouted, rated, roasted, and matched with your football archetype.",
  openGraph: {
    title: "HaaHaaLand",
    description: "Your timeline, scouted. Your ego, benched.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
