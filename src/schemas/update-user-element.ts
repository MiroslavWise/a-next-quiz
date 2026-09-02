import { object, string, type InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

import { EUserElement } from "@/enum/element"

/** Значения для `PATCH /user/element` — см. `EUserElement`. */
export const USER_ELEMENT_VALUES = [
  EUserElement.FIRE,
  EUserElement.WATER,
  EUserElement.AIR,
  EUserElement.EARTH,
] as const

const schema = object({
  element: string()
    .oneOf([...USER_ELEMENT_VALUES], "Выберите одну из четырёх стихий")
    .required("Выберите стихию"),
})

export const resolverUpdateUserElementFormData = yupResolver(schema)
export type UpdateUserElementFormData = InferType<typeof schema>
