import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // WebP only: AVIF conversion hung on one of our photos (design-custom-jig-bracket) in testing
  images: { formats: ["image/webp"] },
  async headers() {
    return [
      { source: "/:path*", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ] },
      { source: "/fonts/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/ziya/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }] },
      { source: "/photos/:file*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }] },
    ];
  },
};
export default nextConfig;
