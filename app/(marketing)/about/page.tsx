import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "IvyIn is a college consulting service started by two students at top universities. Meet the team and see how our advisors work with students.",
  alternates: { canonical: "/about" },
};

export default async function Page() {
  return <PageBody content={await getPage("about")} />;
}
