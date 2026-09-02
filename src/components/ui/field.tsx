"use client"

import { useMemo, memo, type ComponentProps } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import Label from "@/components/ui/label"

import { cn } from "@/lib/utils"

function FieldSet({ className, ...props }: ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3", className)}
      {...props}
    />
  )
}

const fieldVariants = cva("group/field flex w-full gap-2 data-[invalid=true]:text-destructive", {
  variants: {
    orientation: {
      vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
      horizontal:
        "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      responsive:
        "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
})

function Field({ className, orientation = "vertical", ...props }: ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  )
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "group/field-label peer/field-label has-data-checked:border-primary/30 has-data-checked:bg-primary/5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border *:data-[slot=field]:p-2.5",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-left text-sm leading-normal font-normal group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  )
}

const FieldErrorList = memo(function FieldErrorList({
  errors,
  className,
  ...props
}: {
  errors: Array<{ message?: string } | undefined>
} & ComponentProps<"div">) {
  const content = useMemo(() => {
    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()]

    if (!uniqueErrors?.length) {
      return null
    }

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message ?? null
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.flatMap((error) => (error?.message ? [<li key={error.message}>{error.message}</li>] : []))}
      </ul>
    )
  }, [errors])

  if (content == null || content === "") {
    return null
  }

  return (
    <div role="alert" data-slot="field-error" className={cn("text-destructive text-sm font-normal", className)} {...props}>
      {content}
    </div>
  )
})

function FieldError({
  className,
  children,
  errors,
  ...props
}: ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  if (children) {
    return (
      <div role="alert" data-slot="field-error" className={cn("text-destructive text-sm font-normal", className)} {...props}>
        {children}
      </div>
    )
  }

  if (!errors?.length) {
    return null
  }

  return <FieldErrorList errors={errors} className={className} {...props} />
}

export { Field, FieldLabel, FieldDescription, FieldError, FieldSet }
