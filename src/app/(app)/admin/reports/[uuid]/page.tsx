import AdminReportDetailsClient from "./admin-report-details-client"

export default async function AdminReportDetailsPage({ params }: PageProps<"/admin/reports/[uuid]">) {
  const { uuid } = await params
  return <AdminReportDetailsClient uuid={uuid} />
}
