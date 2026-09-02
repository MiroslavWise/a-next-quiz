"use client"

import { PropsWithChildren } from "react"

export default function StartLayout({ children }: PropsWithChildren) {
  return (
    <main className="relative flex h-full w-full flex-col items-center overflow-hidden px-0 text-white lg:px-4">
      <section className="relative z-10 mx-auto flex h-full min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">{children}</section>
    </main>
  )
}
