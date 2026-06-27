import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fireshots — AI App Store Screenshot Generator",
  description:
    "Turn raw app screenshots into polished, store-ready marketing images with AI. Upload, generate, download — in under a minute.",
  keywords: ["app store screenshots", "marketing screenshots", "AI", "mockup generator"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
