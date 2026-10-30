import type { Metadata } from "next";
import "./globals.css";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com";
const DESCRIPTION = "Private, one-on-one college application help from advisors who recently went through the process.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: { default: "IvyIn: College consulting, from students who just went through it", template: "%s | IvyIn" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "IvyIn",
    locale: "en_US",
    title: "IvyIn: College consulting, from students who just went through it",
    description: DESCRIPTION,
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630, alt: "IvyIn, America's Premier College Consulting Group" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IvyIn: College consulting, from students who just went through it",
    description: DESCRIPTION,
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Instrument+Serif&family=Nunito:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
