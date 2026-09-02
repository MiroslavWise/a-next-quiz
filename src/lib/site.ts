/** Публичный origin (OG, canonical, sitemap). На Vercel — NEXT_PUBLIC_SITE_ORIGIN. */
export const SITE_ORIGIN =
  (process.env.NEXT_PUBLIC_SITE_ORIGIN as string | undefined)?.replace(/\/$/, "") || "https://a-next-quiz.vercel.app"

export const SITE_NAME = "QAND"
