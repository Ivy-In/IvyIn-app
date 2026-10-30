import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: { absolute: "IvyIn: College consulting, from students who just went through it" },
  description:
    "Private, one-on-one college application help from advisors who recently went through the process. Essays, applications, testing, activities and deadlines in one private place.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  return (
    <>
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
    <PageBody
      content={await getPage("home")}
      pills={{
        lead: "All your",
        items: ["essays", "applications", "testing", "activities", "deadlines"],
        tail: "in one private place.",
      }}
    />
    </>
  );
}
