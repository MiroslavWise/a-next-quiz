import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  experimental: {
    turbopackRustReactCompiler: true,
  },
  images: {
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
    ],
  },
}

export default nextConfig
