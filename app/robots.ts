import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ivy-in.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/portal", "/admin", "/site", "/login", "/signup", "/mfa", "/logout"] },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
