import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "IvyIn: College consulting, from students who just went through it",
  description: "Private, one-on-one college application help from advisors who recently went through the process.",
};

export default async function Home() {
  return (
    <PageBody
      content={await getPage("home")}
      pills={{
        lead: "All your",
        items: ["essays", "applications", "testing", "activities", "deadlines"],
        tail: "in one private place.",
      }}
    />
  );
}
