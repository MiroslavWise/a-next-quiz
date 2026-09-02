import { useAuthJwtClaims } from "@/lib/jwt"

/** Админ всегда видит фото и служебные подписи пользователей; менеджер и игроки — нет. */
export const useShowDataUser = () => {
  const claims = useAuthJwtClaims()
  return claims?.is_admin ?? false
}
