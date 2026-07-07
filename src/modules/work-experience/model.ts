import { t } from 'elysia'
import { Schema, model } from 'mongoose'
import { i18nString, i18nText, I18nStringSchema } from '../../libs/i18n'
import type { IWorkExperience } from './types'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

export const workExperienceCreate = t.Object({
  role: i18nString,
  company: i18nString,
  companyUrl: t.Optional(t.String({ maxLength: 500 })),
  startDate: t.String({ format: 'date-time' }),
  endDate: t.Optional(t.String({ format: 'date-time' })),
  current: t.Optional(t.Boolean()),
  description: i18nText,
  keyProjects: t.Optional(t.Array(
    t.Object({
      title: i18nString,
      description: i18nText,
    }),
    { maxItems: 20 }
  )),
  tags: t.Optional(t.Array(t.String({ maxLength: 50 }), { maxItems: 20 })),
})

export const workExperienceUpdate = t.Partial(workExperienceCreate)

export type WorkExperienceCreate = typeof workExperienceCreate.static
export type WorkExperienceUpdate = typeof workExperienceUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

const WorkExperienceSchema = new Schema<IWorkExperience>(
  {
    role: { type: I18nStringSchema, required: true },
    company: { type: I18nStringSchema, required: true },
    companyUrl: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: I18nStringSchema, required: true },
    keyProjects: [
      {
        title: { type: I18nStringSchema, required: true },
        description: { type: I18nStringSchema, required: true },
        _id: false,
      },
    ],
    tags: [{ type: String }],
  },
  { timestamps: true }
)

export const WorkExperience = model<IWorkExperience>('WorkExperience', WorkExperienceSchema)
