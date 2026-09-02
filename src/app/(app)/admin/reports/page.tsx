import AppPageHeaders from "@/components/common/AppPageHeaders"

import ReportsListPanel from "@/views/admin/reports/ReportsListPanel"

/**
 * Отчёты: Server Component (заголовки) + клиентский список.
 * Доступ is_admin — в admin/template.tsx.
 */
export default function AdminReportsPage() {
  return (
    <section className="flex w-full flex-col pt-5">
      <AppPageHeaders
        title="Отчёты"
        description="Список сохранённых отчётов"
        toolbarTitle="Все отчёты"
        accent="one"
        backTo="/"
        backAriaLabel="На главную"
      />
      <div className="flex w-full flex-col py-4">
        <ReportsListPanel />
      </div>
    </section>
  )
}
