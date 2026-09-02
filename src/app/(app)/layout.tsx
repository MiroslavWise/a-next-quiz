import { type PropsWithChildren } from "react"

import MainContext from "@/providers/main-context"

export default function AppLayout({ children }: PropsWithChildren) {
  return <MainContext>{children}</MainContext>
}
