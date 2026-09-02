import AppPageHeaders from "@/components/common/AppPageHeaders"

import AdminCacheReset from "@/views/admin/staff/AdminCacheReset"
import StaffRolesPanel from "@/views/admin/staff/StaffRolesPanel"

/**
 * Staff: Server Component (заголовки) + клиентские острова
 * (список ролей, сброс кэша / TMA popup).
 * Доступ is_admin — в admin/template.tsx.
 */
export default function AdminStaffPage() {
  return (
    <section className="flex w-full flex-col pt-5">
      <AppPageHeaders
        title="Команда"
        description="Администраторы и менеджеры из конфигурации сервера"
        toolbarTitle="Роли"
        accent="three"
        backTo="/admin"
        backAriaLabel="Назад к админке"
      />
      <div className="flex w-full flex-col gap-8 py-4">
        <StaffRolesPanel />
        <AdminCacheReset />
      </div>
    </section>
  )
}
