import type { II18nString } from '../../libs/i18n'

// ─── OpenRouter ──────────────────────────────────────────────────────────────

export interface OpenRouterError {
  data$?: unknown
  body?: unknown
  error?: unknown
  message?: string
}

// ─── Intent taxonomy ─────────────────────────────────────────────────────────
// Rule-based intent detection maps a user question to one of these, which the
// orchestrator uses to pick the right portfolio service function. Adding a new
// capability = add an Intent + a matcher + a context builder. No LLM call is
// spent on classification.

export enum Intent {
  ABOUT = 'ABOUT',                     // "Tell me about Josh"
  SUMMARIZE = 'SUMMARIZE',             // "Summarize the portfolio"
  SEARCH_PROJECTS = 'SEARCH_PROJECTS', // "Show frontend projects"
  GET_PROJECT = 'GET_PROJECT',         // "Explain project X"
  COMPARE_PROJECTS = 'COMPARE_PROJECTS', // "Compare A and B"
  SEARCH_BY_TECH = 'SEARCH_BY_TECH',   // "Which projects use Docker"
  LIST_SKILLS = 'LIST_SKILLS',         // "What backend frameworks do you use"
  TECH_FREQUENCY = 'TECH_FREQUENCY',   // "Which technologies used most often"
  RELATED_PROJECTS = 'RELATED_PROJECTS', // "Which projects are related"
  ARCHITECTURE = 'ARCHITECTURE',       // "Explain your architecture"
  STRONGEST_PROJECT = 'STRONGEST_PROJECT', // "Strongest backend project"
  RECOMMEND_TECH = 'RECOMMEND_TECH',   // "Which technologies to learn"
  TIMELINE = 'TIMELINE',               // "Your development journey"
  EXPERIENCE = 'EXPERIENCE',           // "Your work experience"
  FALLBACK = 'FALLBACK',               // anything unmatched
}

export type ProjectTypeFilter = 'FRONTEND' | 'BACKEND' | 'FULLSTACK'
export type SkillCategory =
  | 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'TOOL' | 'LIBRARY' | 'ORM'

// Structured hints extracted alongside the intent, used to narrow DB queries.
export interface IntentResult {
  intent: Intent
  question: string
  projectType?: ProjectTypeFilter
  category?: SkillCategory
}

// ─── Lean view types ─────────────────────────────────────────────────────────
// Shapes returned from `.lean().populate(...)` queries. Loosely typed on
// purpose — Mongoose's lean generics don't reflect populated refs well.

export type SkillLayer = 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'GENERAL'
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export interface SkillView {
  _id: string
  name: string
  category: SkillCategory
  layer?: SkillLayer
  level?: SkillLevel
  icon?: string
  color?: string
}

export interface ProjectView {
  _id: string
  title: II18nString
  description?: II18nString
  type?: ProjectTypeFilter
  projectYear: number
  githubRepoUrl?: string
  link?: string
  sortOrder?: number | null
  role?: II18nString
  problemSolved?: II18nString
  highlights?: II18nString[]
  status?: 'LIVE' | 'ARCHIVED' | 'WIP'
  featured?: boolean
  skillIds: SkillView[]
  relatedProjectIds: Array<{ _id: string; title: II18nString; type?: ProjectTypeFilter }>
}

export interface ExperienceView {
  role: II18nString
  company: II18nString
  startDate: Date
  endDate?: Date
  current: boolean
  description: II18nString
  tags: string[]
}

export interface EducationView {
  degree: II18nString
  school: II18nString
  startYear: number
  endYear?: number
  gpa?: string
  description: II18nString
}

// ─── API result ──────────────────────────────────────────────────────────────

export interface AskSource {
  id: string
  title: string
  type?: string
}

export interface AskResult {
  answer: string
  intent: Intent
  // Structured refs so the frontend can later render project cards/links.
  sources: AskSource[]
}
