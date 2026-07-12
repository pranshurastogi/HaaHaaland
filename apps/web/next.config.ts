import type { NextConfig } from "next";

const safeOrigin = (value: string | undefined) => {
  try {
    return value ? new URL(value).origin : "";
  } catch {
    return "";
  }
};
const connections = [
  "'self'",
  safeOrigin(process.env.NEXT_PUBLIC_CONVEX_URL),
  safeOrigin(process.env.NEXT_PUBLIC_POSTHOG_HOST),
].filter(Boolean);
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  `connect-src ${connections.join(" ")}`,
  "font-src 'self' data:",
  "media-src 'self' https:",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  allowedDevOrigins: ["127.0.0.1"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};
export default nextConfig;
