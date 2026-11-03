import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Every page is rendered per request (nonce CSP + sessions), so Cache Components stays off.
  cacheComponents: false,
  poweredByHeader: false,
  serverExternalPackages: ["sharp", "@libsql/client"],
  experimental: {
    serverActions: {
      // Images are resized in the browser first; 7 MB covers a raw 6 MB file plus form overhead.
      bodySizeLimit: "7mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
