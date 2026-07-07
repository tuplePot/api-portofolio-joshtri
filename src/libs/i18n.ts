import { t } from 'elysia'
import { Schema } from 'mongoose'

export const i18nString = t.Object({
  id: t.String({ maxLength: 200 }),
  en: t.String({ maxLength: 200 }),
})

export const i18nText = t.Object({
  id: t.String({ maxLength: 2000 }),
  en: t.String({ maxLength: 2000 }),
})

export interface II18nString {
  id: string
  en: string
}

export const I18nStringSchema = new Schema<II18nString>(
  {
    id: { type: String, required: true },
    en: { type: String, required: true },
  },
  { _id: false }
)
