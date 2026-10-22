import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "How It Works | IvyIn" };

export default async function Page() {
  return <PageBody content={await getPage("how-it-works")} />;
}
