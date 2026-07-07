import { t } from 'elysia'
import { Schema, model } from 'mongoose'
import { i18nString, i18nText, I18nStringSchema } from '../../libs/i18n'
import type { IEducation } from './types'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

export const educationCreate = t.Object({
  degree: i18nString,
  school: i18nString,
  startYear: t.Number({ minimum: 1950, maximum: 2100 }),
  endYear: t.Optional(t.Number({ minimum: 1950, maximum: 2100 })),
  gpa: t.Optional(t.String({ maxLength: 10 })),
  description: i18nText,
})

export const educationUpdate = t.Partial(educationCreate)

export type EducationCreate = typeof educationCreate.static
export type EducationUpdate = typeof educationUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: I18nStringSchema, required: true },
    school: { type: I18nStringSchema, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    gpa: { type: String },
    description: { type: I18nStringSchema, required: true },
  },
  { timestamps: true }
)

export const Education = model<IEducation>('Education', EducationSchema)
