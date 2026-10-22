import type { Metadata } from "next";
import { PageBody } from "@/components/marketing";
import { getPage } from "@/lib/content";

export const metadata: Metadata = { title: "About | IvyIn" };

export default async function Page() {
  return <PageBody content={await getPage("about")} />;
}
