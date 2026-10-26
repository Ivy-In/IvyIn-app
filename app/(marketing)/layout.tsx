import { Footer, Header } from "@/components/marketing";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk">
      {/* Fonts from the mymind-style reference: Instrument Serif for headings, Nunito for body text. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Nunito:wght@400;600;700;800&display=swap"
      />
      <Header />
      {children}
      <Footer />
    </div>
  );
}
