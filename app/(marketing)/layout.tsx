import { Footer, Header } from "@/components/marketing";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mk">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
