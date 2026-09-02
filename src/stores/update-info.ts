"use client"

import { create } from "zustand"

export const useUpdateInfo = create<UpdateInfoState>(() => ({
  isOpen: false,
  avatar: "",
  pseudo: "",
  bg: "",
}))

export const dispatchUpdateInfo = (avatar: string, pseudo: string, bg: string) =>
  useUpdateInfo.setState((s) => ({ ...s, isOpen: true, avatar, pseudo, bg }))
export const dispatchCloseUpdateInfo = () => useUpdateInfo.setState((s) => ({ ...s, isOpen: false, avatar: "", pseudo: "" }))

interface UpdateInfoState {
  isOpen: boolean
  avatar: string
  pseudo: string
  bg: string
}
