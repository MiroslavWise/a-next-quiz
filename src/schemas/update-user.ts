import { object, string, type InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const schema = object({
  pseudo: string().required("Псевдоним является обязательным").default(""),
  avatar: string().required("Аватар является обязательным").default(""),
  bg: string().default(""),
})

export const resolverUpdateUserFormData = yupResolver(schema)
export type UpdateUserFormData = InferType<typeof schema>
