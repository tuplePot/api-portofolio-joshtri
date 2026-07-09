import { t } from 'elysia'
import mongoose, { Schema } from 'mongoose'
import { i18nString, i18nText, I18nStringSchema } from '../../libs/i18n'
import type { IProject } from './types'

export { ProjectType } from './types'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

const objectId = t.String({ pattern: '^[0-9a-fA-F]{24}$' })

export const projectCreate = t.Object({
  title: i18nString,
  description: t.Optional(i18nText),
  skillIds: t.Optional(t.Array(objectId)),
  relatedProjectIds: t.Optional(t.Array(objectId)),
  thumbnailId: t.Optional(t.String({ maxLength: 255 })),
  link: t.Optional(t.String({ maxLength: 500 })),
  screenshots: t.Optional(t.Array(t.String({ maxLength: 255 }))),
  projectYear: t.Optional(t.Number({ minimum: 1990, maximum: 2100 })),
  type: t.Optional(t.Union([
    t.Literal('FRONTEND'),
    t.Literal('BACKEND'),
    t.Literal('FULLSTACK'),
  ])),
  githubRepoUrl: t.Optional(t.String({ maxLength: 500 })),
  sortOrder: t.Optional(t.Union([t.Integer({ minimum: 1 }), t.Null()])),
  // Depth fields — richer signal for the AI assistant (GET_PROJECT, COMPARE,
  // STRONGEST). All optional / backfilled over time.
  role: t.Optional(i18nString),
  problemSolved: t.Optional(i18nText),
  highlights: t.Optional(t.Array(i18nString, { maxItems: 10 })),
  status: t.Optional(t.Union([
    t.Literal('LIVE'),
    t.Literal('ARCHIVED'),
    t.Literal('WIP'),
  ])),
  featured: t.Optional(t.Boolean()),
})

export const projectUpdate = t.Partial(projectCreate)

export type ProjectCreate = typeof projectCreate.static
export type ProjectUpdate = typeof projectUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: I18nStringSchema, required: true },
    description: { type: I18nStringSchema },
    skillIds: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    relatedProjectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    thumbnailId: { type: String },
    link: { type: String },
    screenshots: [{ type: String }],
    projectYear: { type: Number, required: true, default: new Date().getFullYear() },
    type: { type: String, enum: ['FRONTEND', 'BACKEND', 'FULLSTACK'] },
    githubRepoUrl: { type: String },
    sortOrder: { type: Number, default: null },
    role: { type: I18nStringSchema },
    problemSolved: { type: I18nStringSchema },
    highlights: [{ type: I18nStringSchema }],
    status: { type: String, enum: ['LIVE', 'ARCHIVED', 'WIP'] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Project = mongoose.model<IProject>('Project', ProjectSchema)
