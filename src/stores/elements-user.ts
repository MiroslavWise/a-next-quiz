"use client"

import { create } from "zustand"

export const useElementsUser = create<ElementsUserState>(() => ({
  isOpen: false,
}))

export const dispatchOpenElementsUser = () => useElementsUser.setState({ isOpen: true })
export const dispatchCloseElementsUser = () => useElementsUser.setState({ isOpen: false })

interface ElementsUserState {
  isOpen: boolean
}
