import { t } from 'elysia'
import mongoose, { Schema } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

const categoryEnum = t.Union([
  t.Literal('LANGUAGE'),
  t.Literal('FRAMEWORK'),
  t.Literal('DATABASE'),
  t.Literal('TOOL'),
  t.Literal('LIBRARY'),
  t.Literal('ORM'),
])

const objectId = t.String({ pattern: '^[0-9a-fA-F]{24}$' })

// Where a skill is applied (front/back/devops/general) — lets the assistant
// answer "backend frameworks" precisely instead of guessing from category.
const layerEnum = t.Union([
  t.Literal('FRONTEND'),
  t.Literal('BACKEND'),
  t.Literal('DEVOPS'),
  t.Literal('GENERAL'),
])

const levelEnum = t.Union([
  t.Literal('BEGINNER'),
  t.Literal('INTERMEDIATE'),
  t.Literal('ADVANCED'),
])

export const skillCreate = t.Object({
  name: t.String({ maxLength: 100 }),
  icon: t.String({ maxLength: 200 }),
  color: t.String({ maxLength: 50 }),
  category: categoryEnum,
  layer: t.Optional(layerEnum),
  level: t.Optional(levelEnum),
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
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'TOOL' | 'LIBRARY' | 'ORM'
  layer?: 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'GENERAL'
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  projectIds: mongoose.Types.ObjectId[]
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    category: { type: String, enum: ['LANGUAGE', 'FRAMEWORK', 'DATABASE', 'TOOL', 'LIBRARY', 'ORM'], required: true },
    layer: { type: String, enum: ['FRONTEND', 'BACKEND', 'DEVOPS', 'GENERAL'] },
    level: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
    projectIds: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true }
)

export const Skill = mongoose.model<ISkill>('Skill', SkillSchema)
