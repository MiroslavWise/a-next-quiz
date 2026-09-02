import Link from "next/link"
import { FilePlus } from "lucide-react"

import Button from "@/components/ui/button"
import AppPageHeaders from "@/components/common/AppPageHeaders"

import QuizzesListPanel from "@/views/admin/QuizzesListPanel"

/**
 * Админ-список квизов: Server Component (заголовки + CTA) + клиентский список.
 * Доступ is_admin — в admin/template.tsx.
 */
export default function AdminQuizzesPage() {
  return (
    <section className="flex w-full flex-col pt-5">
      <AppPageHeaders
        title="Админ-панель"
        description="Управление квизами"
        toolbarTitle="Список квизов"
        accent="two"
        backTo="/"
        backAriaLabel="На главную"
        toolbarAction={
          <Button asChild variant="outline" aria-label="Создать новый квиз">
            <Link href="/admin/create" className="inline-flex items-center gap-1.5">
              <FilePlus className="size-3.5" />
            </Link>
          </Button>
        }
      />
      <div className="flex w-full flex-col py-4">
        <QuizzesListPanel />
      </div>
    </section>
  )
}
