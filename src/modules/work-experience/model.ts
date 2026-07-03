import { t } from 'elysia'
import { Schema, model } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

export const workExperienceCreate = t.Object({
  role: t.String({ maxLength: 150 }),
  company: t.String({ maxLength: 150 }),
  companyUrl: t.Optional(t.String({ maxLength: 500 })),
  startDate: t.String({ format: 'date-time' }),
  endDate: t.Optional(t.String({ format: 'date-time' })),
  current: t.Optional(t.Boolean()),
  description: t.String({ maxLength: 3000 }),
  tags: t.Optional(t.Array(t.String({ maxLength: 50 }), { maxItems: 20 })),
})

export const workExperienceUpdate = t.Partial(workExperienceCreate)

export type WorkExperienceCreate = typeof workExperienceCreate.static
export type WorkExperienceUpdate = typeof workExperienceUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

export interface IWorkExperience {
  role: string
  company: string
  companyUrl?: string
  startDate: Date
  endDate?: Date
  current: boolean
  description: string
  tags: string[]
}

const WorkExperienceSchema = new Schema<IWorkExperience>(
  {
    role: { type: String, required: true },
    company: { type: String, required: true },
    companyUrl: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
)

export const WorkExperience = model<IWorkExperience>('WorkExperience', WorkExperienceSchema)
