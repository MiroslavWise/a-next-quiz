"use client"

import {
  useEffect,
  useState,
  useRef,
  type Dispatch,
  type SetStateAction,
  type RefObject,
  type LegacyRef,
  type Ref,
  type DispatchWithoutAction,
} from "react"

export const useOutsideClickEvent = (
  cd?: DispatchWithoutAction,
): [boolean, Dispatch<SetStateAction<boolean>>, RefObject<HTMLDivElement> | LegacyRef<HTMLDivElement> | Ref<HTMLDivElement> | any] => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        if (cd) cd()
      }
    }
    document.addEventListener("click", handleClickOutside)

    return () => document.removeEventListener("click", handleClickOutside)
  }, [])

  return [isOpen, setIsOpen, dropdownRef]
}
