import { object, string, type InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"

const schemaCreateQuizFormData = object({
  name: string()
    .min(3, "Название квиза должно быть не менее 3 символов")
    .max(100, "Название квиза не может превышать 100 символов")
    .required("Название квиза является обязательным")
    .default(""),
  description: string().max(200, "Описание квиза не может превышать 200 символов").default(""),
})

export const resolverCreateQuizFormData = yupResolver(schemaCreateQuizFormData)
export type CreateQuizFormData = InferType<typeof schemaCreateQuizFormData>
