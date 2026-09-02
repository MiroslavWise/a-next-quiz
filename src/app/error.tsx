"use client"

import Button from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const handleHardReload = () => {
    try {
      const url = new URL(window.location.href)
      url.searchParams.set("t", Date.now().toString())
      window.location.replace(url.toString())
    } catch {
      window.location.reload()
    }
  }

  return (
    <main className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center p-4 pt-16 text-center">
      <h2 className="mb-2 text-3xl font-bold tracking-tight">Упс!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{error?.message || "Произошла непредвиденная ошибка."}</p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="outline" size="lg" className="min-w-40 font-medium">
          Попробовать снова
        </Button>
        <Button onClick={handleHardReload} variant="default" size="lg" className="min-w-40 font-medium">
          Обновить страницу
        </Button>
      </div>
    </main>
  )
}
