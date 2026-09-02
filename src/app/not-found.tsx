import Link from "next/link"

import Button from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center p-4 pt-16 text-center">
      <h2 className="mb-2 text-3xl font-bold tracking-tight">404</h2>
      <p className="text-muted-foreground mb-6 max-w-md">Страница не найдена.</p>
      <Button asChild variant="default" size="lg">
        <Link href="/">На главную</Link>
      </Button>
    </main>
  )
}
