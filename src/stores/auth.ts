"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { IUser } from "@/interface/user"
import { AuthStatus } from "@/enum/auth"

export const useAuth = create(
  persist<AuthState, [], [], Pick<AuthState, "token" | "user">>(
    () => ({
      token: null,
      status: AuthStatus.PENDING,
      user: null,
    }),
    {
      name: "::auth--youth-quiz--::",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? sessionStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            },
      ),
      partialize: (s) => ({ token: s.token, user: s.user }),
    },
  ),
)

export const dispatchAuth = (params: { token: string; user: IUser | null }) =>
  useAuth.setState(
    (s) => ({
      ...s,
      token: params.token,
      status: AuthStatus.AUTHENTICATED,
      user: params.user,
    }),
    true,
  )

export const dispatchSetUser = (user: IUser) => useAuth.setState((s) => ({ ...s, user }), true)

export const dispatchUnauthenticated = () =>
  useAuth.setState(
    (s) => ({
      ...s,
      status: AuthStatus.UNAUTHENTICATED,
      token: null,
      user: null,
    }),
    true,
  )

interface AuthState {
  token: string | null
  status: AuthStatus
  user: IUser | null
}
