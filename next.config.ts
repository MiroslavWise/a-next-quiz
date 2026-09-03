import type { NextConfig } from "next"

/** Браузер и CDN Vercel — 30 дней; без immutable, чтобы новый деплой подхватился. */
const PUBLIC_ASSET_CACHE = "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800"

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  experimental: {
    turbopackRustReactCompiler: true,
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a-golang-quiz-youth-825737499561.europe-west1.run.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.run.app",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "t.me",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.telegram.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.telegram-cdn.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    const cacheControl = { key: "Cache-Control", value: PUBLIC_ASSET_CACHE }
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      { source: "/lottie/:path*", headers: [cacheControl] },
      { source: "/avatars/:path*", headers: [cacheControl] },
      { source: "/element/:path*", headers: [cacheControl] },
      { source: "/webp/:path*", headers: [cacheControl] },
      { source: "/og/:path*", headers: [cacheControl] },
      { source: "/favicon.ico", headers: [cacheControl] },
    ]
  },
}

export default nextConfig
