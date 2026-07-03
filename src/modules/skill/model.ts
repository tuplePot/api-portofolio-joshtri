import { t } from 'elysia'
import mongoose, { Schema } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

const categoryEnum = t.Union([
  t.Literal('LANGUAGE'),
  t.Literal('FRAMEWORK'),
  t.Literal('DATABASE'),
  t.Literal('TOOL'),
])

const objectId = t.String({ pattern: '^[0-9a-fA-F]{24}$' })

export const skillCreate = t.Object({
  name: t.String({ maxLength: 100 }),
  icon: t.String({ maxLength: 200 }),
  color: t.String({ maxLength: 50 }),
  category: categoryEnum,
  projectIds: t.Optional(t.Array(objectId)),
})

export const skillUpdate = t.Partial(skillCreate)

export type SkillCreate = typeof skillCreate.static
export type SkillUpdate = typeof skillUpdate.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

export interface ISkill {
  name: string
  icon: string
  color: string
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'TOOL'
  projectIds: mongoose.Types.ObjectId[]
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    category: { type: String, enum: ['LANGUAGE', 'FRAMEWORK', 'DATABASE', 'TOOL'], required: true },
    projectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
)

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema)
