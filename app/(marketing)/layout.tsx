import { Footer, Header } from "@/components/marketing";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk">
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}
