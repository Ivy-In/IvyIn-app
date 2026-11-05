import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com";
const PAGES = ["", "/apply", "/guides", ...GUIDES.map((g) => `/guides/${g.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : 0.7,
  }));
}
