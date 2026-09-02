import { type PropsWithChildren } from "react"

export default function AdminLayout({ children }: PropsWithChildren) {
  return (
    <main className="text-foreground flex h-full min-h-0 w-full flex-col items-center overflow-y-auto px-0">
      <section className="container mx-auto flex w-full max-w-5xl flex-col px-4 pt-6 pb-10">{children}</section>
    </main>
  )
}
