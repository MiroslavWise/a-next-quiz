export function reportPath(reportId: string | number, subpath?: string) {
  const base = `/report/${reportId}`
  return subpath ? `${base}/${subpath}` : base
}
