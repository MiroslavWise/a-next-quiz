import Spinner from "@/components/ui/spinner"

export default function AdminLoading() {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-4">
      <Spinner className="size-10" />
    </div>
  )
}
