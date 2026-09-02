import type { MetadataRoute } from "next"

import { SITE_ORIGIN } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/game-mechanics", "/og/", "/element/"],
      disallow: ["/admin", "/start", "/my-game-result"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  }
}
