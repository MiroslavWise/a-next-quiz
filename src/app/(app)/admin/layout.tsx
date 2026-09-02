export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="text-foreground flex h-full w-full flex-col items-center px-0 lg:px-4">
      <section className="container mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-8">{children}</section>
    </main>
  )
}
