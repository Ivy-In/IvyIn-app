import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description: "Explore IvyIn college consulting: weekly one-on-one meetings with the same consultant, plus pricing and payment options.",
  alternates: { canonical: "/services" },
};

export default async function Page() {
  return <PageBody content={await getPage("services")} />;
}
