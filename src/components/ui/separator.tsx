"use client"

import { type ComponentProps } from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

type TSeparator = ComponentProps<typeof SeparatorPrimitive.Root>

export default function Separator({ className, orientation = "horizontal", decorative = true, ...props }: TSeparator) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className,
      )}
      {...props}
    />
  )
}
