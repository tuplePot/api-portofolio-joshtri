import { t } from 'elysia'
import mongoose, { Schema } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

const objectId = t.String({ pattern: '^[0-9a-fA-F]{24}$' })

const i18nString = t.Object({
  id: t.String({ maxLength: 200 }),
  en: t.String({ maxLength: 200 }),
})

const i18nText = t.Object({
  id: t.String({ maxLength: 2000 }),
  en: t.String({ maxLength: 2000 }),
})

export const projectCreate = t.Object({
  title: i18nString,
  description: t.Optional(i18nText),
  skillIds: t.Optional(t.Array(objectId)),
  thumbnailId: t.Optional(t.String({ maxLength: 255 })),
  link: t.Optional(t.String({ maxLength: 500 })),
  screenshots: t.Optional(t.Array(t.String({ maxLength: 255 }))),
  projectYear: t.Optional(t.Number({ minimum: 1990, maximum: 2100 })),
})

export const projectUpdate = t.Partial(projectCreate)

export type ProjectCreate = typeof projectCreate.static
export type ProjectUpdate = typeof projectUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

export interface II18nString {
  id: string
  en: string
}

export interface IProject {
  title: II18nString
  description?: II18nString
  skillIds: mongoose.Types.ObjectId[]
  thumbnailId?: string
  link?: string
  screenshots: string[]
  projectYear: number
}

const I18nStringSchema = new Schema<II18nString>({
  id: { type: String, required: true },
  en: { type: String, required: true },
}, { _id: false })

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: I18nStringSchema, required: true },
    description: { type: I18nStringSchema },
    skillIds: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    thumbnailId: { type: String },
    link: { type: String },
    screenshots: [{ type: String }],
    projectYear: { type: Number, required: true, default: new Date().getFullYear() },
  },
  { timestamps: true }
)

export const Project = mongoose.model<IProject>('Project', ProjectSchema)
