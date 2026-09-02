"use client"

import { type ComponentProps } from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

export default function Switch({
  className,
  size: _size = "default",
  color,
  ...props
}: ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
  color?: string
}) {
  const checked = props.checked === true

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "inline-flex h-4.5 w-8 min-w-8 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors outline-none",
        "focus-visible:ring-ring ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "after:pointer-events-none after:absolute after:-inset-1 after:z-0 after:bg-transparent after:content-['']",
        "relative z-10",
        checked ? cn(color ?? "bg-black", "justify-end") : "bg-muted-foreground justify-start",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="pointer-events-none z-10 block size-4 shrink-0 rounded-full bg-white" />
    </SwitchPrimitive.Root>
  )
}
