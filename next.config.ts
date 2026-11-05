import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow uploads up to the 50 MB per-file limit, plus form overhead.
      bodySizeLimit: "52mb",
    },
  },
  // The marketing pages are now sections of the home page. Old links land on the right section.
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/how-it-works", destination: "/#how-it-works", permanent: false },
      { source: "/services", destination: "/#services", permanent: false },
      { source: "/resources", destination: "/#resources", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
      { source: "/events", destination: "/#events", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
      {
        // Student sites must never be indexed.
        source: "/site/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
