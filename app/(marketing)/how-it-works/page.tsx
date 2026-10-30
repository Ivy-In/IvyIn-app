import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "How It Works",
  description: "See how IvyIn works, from your first call to your final submission. A simple private process with one consultant every week.",
  alternates: { canonical: "/how-it-works" },
};

export default async function Page() {
  return <PageBody content={await getPage("how-it-works")} />;
}
