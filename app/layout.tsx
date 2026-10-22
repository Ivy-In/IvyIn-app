import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IvyIn",
  description: "College consulting, from students who just went through it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
