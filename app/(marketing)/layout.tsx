import { Footer, Header } from "@/components/marketing";
import { Intro } from "@/components/home/Intro";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk">
      <Intro />
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
    </div>
  );
}
