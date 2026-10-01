"use client"

import { SkillId } from "@/api/reports"
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react"

const defaultState: IStateSkill = {
  enabled: false,
  value: null,
  open: () => {},
  close: () => {},
  reportId: "",
  tgId: 0,
  activeIndex: 0,
  questionId: "",
}

const create = createContext<IStateSkill>(defaultState)

interface IProviderProps extends PropsWithChildren {
  reportId: string
  tgId: number
  activeIndex: number
  questionId?: string
}

export default function ContextInfoSkill({ children, reportId, tgId, activeIndex, questionId = "" }: IProviderProps) {
  const [value, setValue] = useState<SkillId | null>(null)

  const close = useCallback(() => setValue(null), [])
  const open = useCallback((skillId: SkillId) => {
    setValue((current) => (current === skillId ? null : skillId))
  }, [])

  useEffect(() => {
    setValue(null)
  }, [questionId, activeIndex, reportId])

  const state = useMemo<IStateSkill>(
    () => ({
      enabled: value !== null,
      value,
      open,
      close,
      reportId,
      tgId,
      activeIndex,
      questionId,
    }),
    [value, open, close, reportId, tgId, activeIndex, questionId],
  )

  return <create.Provider children={children} value={state} />
}

export const useContextInfoSkill = () => useContext(create)

interface IValueSkill {
  enabled: boolean
  value: SkillId | null
}

interface IStateSkill extends IValueSkill {
  open: (skillId: SkillId) => void
  close: () => void
  reportId: string
  tgId: number
  activeIndex: number
  questionId: string
}
