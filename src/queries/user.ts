import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query"

import { getUserByTgId } from "@/api/user"
import type { IUser } from "@/interface/user"

export const userQueryKey = (telegramId: string | number) => ["user", telegramId] as const

export const userQueryOptions = (telegramId: string | number) =>
  queryOptions({
    queryKey: userQueryKey(telegramId),
    queryFn: () => getUserByTgId(telegramId),
  })

export async function fetchUserByTgId(queryClient: QueryClient, telegramId: string | number): Promise<IUser | null> {
  try {
    return await queryClient.fetchQuery(userQueryOptions(telegramId))
  } catch {
    return null
  }
}

export function setUserQueryCache(queryClient: QueryClient, user: IUser) {
  queryClient.setQueryData(userQueryKey(user.telegram_id), user)
}

export function useUserByTgId(telegramId: string | number | null | undefined, options?: { enabled?: boolean }) {
  const id = telegramId!
  return useQuery({
    ...userQueryOptions(id),
    enabled: !!telegramId && (options?.enabled ?? true),
  })
}
