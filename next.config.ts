import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
    ],
  },
}

export default nextConfig
