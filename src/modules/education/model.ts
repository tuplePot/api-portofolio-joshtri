import { t } from 'elysia'
import { Schema, model } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

export const educationCreate = t.Object({
  degree: t.String({ maxLength: 200 }),
  school: t.String({ maxLength: 200 }),
  startYear: t.Number({ minimum: 1950, maximum: 2100 }),
  endYear: t.Optional(t.Number({ minimum: 1950, maximum: 2100 })),
  gpa: t.Optional(t.String({ maxLength: 10 })),
  description: t.String({ maxLength: 3000 }),
})

export const educationUpdate = t.Partial(educationCreate)

export type EducationCreate = typeof educationCreate.static
export type EducationUpdate = typeof educationUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

export interface IEducation {
  degree: string
  school: string
  startYear: number
  endYear?: number
  gpa?: string
  description: string
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    school: { type: String, required: true },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    gpa: { type: String },
    description: { type: String, required: true },
  },
  { timestamps: true }
)

export const Education = model<IEducation>('Education', EducationSchema)
