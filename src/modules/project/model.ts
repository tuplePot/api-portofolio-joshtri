import { t } from 'elysia'
import mongoose, { Schema } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

const objectId = t.String({ pattern: '^[0-9a-fA-F]{24}$' })

export const projectCreate = t.Object({
  title: t.String({ maxLength: 200 }),
  description: t.Optional(t.String({ maxLength: 2000 })),
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

export interface IProject {
  title: string
  description?: string
  skillIds: mongoose.Types.ObjectId[]
  thumbnailId?: string
  link?: string
  screenshots: string[]
  projectYear: number
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String },
    skillIds: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    thumbnailId: { type: String },
    link: { type: String },
    screenshots: [{ type: String }],
    projectYear: { type: Number, required: true, default: new Date().getFullYear() },
  },
  { timestamps: true }
)

export const Project = mongoose.model<IProject>('Project', ProjectSchema)
