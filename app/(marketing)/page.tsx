import type { Metadata } from "next";
import Link from "next/link";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "IvyIn: College consulting, from students who just went through it",
  description: "Private, one-on-one college application help from advisors who recently went through the process.",
};

export default async function Home() {
  return (
    <>
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
