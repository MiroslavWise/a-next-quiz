import { useAuth } from "@/stores/auth"

const getApiHeaders = (): Record<string, string> => {
  const { token } = useAuth.getState()
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`,
  }
}

export default getApiHeaders
