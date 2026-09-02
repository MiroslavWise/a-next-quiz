"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { FilePlus } from "lucide-react"

import Button from "@/components/ui/button"
import AppPageHeaders from "@/components/common/AppPageHeaders"
import Skeleton from "@/components/ui/skeleton"
import { Item, ItemContent, ItemDescription, ItemFooter, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"

import { cn } from "@/lib/utils"
import { getQuizes } from "@/api/quizes"
import { useAuthJwtClaims } from "@/lib/jwt"
import { formatDateTimeHHmmDDMMYY } from "@/lib/date"

export default function AdminQuizzesList() {
  const claims = useAuthJwtClaims()
  const tgId = claims?.telegram_id

  const { data: quizes, isFetching } = useQuery({
    queryKey: ["quizes"],
    enabled: !!tgId,
    queryFn: getQuizes,
  })

  return (
    <section className="flex w-full flex-col pt-5">
      <AppPageHeaders
        title="Админ-панель"
        description="Управление квизами"
        toolbarTitle="Список квизов"
        accent="two"
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
        {isFetching ? (
          <ItemGroup className="gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index + "skeleton"} className="flex w-full items-center gap-4">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex w-full flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </ItemGroup>
        ) : (
          <>
            {quizes && quizes.length > 0 ? (
              <ItemGroup className="gap-2">
                {quizes.map((quiz) => (
                  <Item key={quiz?.id} variant="outline" asChild role="listitem" className="bg-background w-full">
                    <Link href={`/admin/quiz/${quiz?.id}`}>
                      {(quiz?.imageUrl ?? quiz?.image_url) ? (
                        <ItemMedia variant="image">
                          <img
                            src={quiz?.imageUrl ?? quiz?.image_url ?? ""}
                            alt={quiz?.name}
                            className="size-8 object-cover"
                            width={32}
                            height={32}
                            loading="lazy"
                          />
                        </ItemMedia>
                      ) : null}
                      <ItemContent>
                        <ItemTitle className="line-clamp-1 truncate">{quiz?.name}</ItemTitle>
                        <ItemDescription className={cn("text-xs", !quiz?.description && "hidden")}>{quiz?.description}</ItemDescription>
                        <ItemSeparator />
                        <ItemFooter>
                          <span className="text-muted-foreground text-xs">{formatDateTimeHHmmDDMMYY(quiz.created_at)}</span>
                        </ItemFooter>
                      </ItemContent>
                    </Link>
                  </Item>
                ))}
              </ItemGroup>
            ) : (
              <div className="border-border flex flex-col items-center gap-3 rounded-xl border border-dashed p-3 text-center">
                <div className="border-border bg-muted/60 flex size-10 items-center justify-center rounded-full border">
                  <FilePlus className="text-muted-foreground size-4" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-medium">Квизы ещё не созданы</p>
                  <p className="text-muted-foreground text-xs">Начните с создания первого квиза, чтобы участники могли проходить тесты.</p>
                </div>
                <footer className="flex items-center gap-3">
                  <Button asChild aria-label="Создать первый квиз">
            <Link href="/admin/create">Создать первый квиз</Link>
                  </Button>
                  <Button asChild variant="outline" aria-label="На главную">
                    <Link href="/">На главную</Link>
                  </Button>
                </footer>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
