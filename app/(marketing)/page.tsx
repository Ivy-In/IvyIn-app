import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageBody } from "@/components/marketing";
import { StatsAndTicker } from "@/components/home/HomeSections";
import { Spotlight } from "@/components/home/Spotlight";
import { MentorCarousel } from "@/components/home/MentorCarousel";
import { Testimonials } from "@/components/sections/Extras";
import { CmsSection } from "@/components/sections/CmsSection";
import { EventsSection } from "@/components/sections/EventsSection";
import { HeroVideo } from "@/components/home/HeroVideo";
import { FaqSection } from "@/components/sections/FaqSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getPage } from "@/lib/content";
import css from "@/components/home/home.module.css";

export const metadata: Metadata = {
  title: { absolute: "IvyIn: College consulting, from students who just went through it" },
  description:
    "Private, one-on-one college application help from advisors who recently went through the process. Essays, applications, testing, activities and deadlines in one private place.",
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; sent?: string; error?: string }>;
}) {
  const sp = await searchParams;
  return (
    <>
      {/* Smooth scrolling for the menu links, off when the visitor prefers reduced motion. */}
      <style href="smooth-scroll" precedence="default">{`@media (prefers-reduced-motion: no-preference){html{scroll-behavior:smooth}}`}</style>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "IvyIn",
          url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com",
          logo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com"}/brand/logo-header.jpg`,
          description: "America's Premier College Consulting Group. Private, one-on-one college application help from advisors who recently went through the process.",
        }}
      />
      <div className="mk-banner">
        <p>
          Opportunities open now for consultants.{" "}
          <Link href="/apply">Apply now</Link>
        </p>
      </div>

      <div id="home" className={css.heroBg}>
        <HeroVideo />
        <PageBody
          heroOnly
          content={await getPage("home")}
          pills={{
            lead: "All your",
            items: ["essays", "applications", "testing", "activities", "deadlines"],
            tail: "in one private place.",
          }}
        />
      </div>
      <StatsAndTicker />
      <Spotlight />

      <CmsSection id="about" slug="about" eyebrow="About" tone="glow">
        <div style={{ marginTop: 28 }}>
          <MentorCarousel />
        </div>
      </CmsSection>
      <CmsSection id="how-it-works" slug="how-it-works" eyebrow="How it works" tone="flat" />
      <EventsSection monthParam={sp.month} />
      <CmsSection id="services" slug="services" eyebrow="Services" tone="glow" />
      <Testimonials />
      <FaqSection />
      <ContactSection sent={sp.sent} error={sp.error} />
    </>
  );
}
