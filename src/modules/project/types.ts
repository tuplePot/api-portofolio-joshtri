import mongoose from 'mongoose'
import type { II18nString } from '../../libs/i18n'

export const ProjectType = {
  FRONTEND: 'FRONTEND',
  BACKEND: 'BACKEND',
  FULLSTACK: 'FULLSTACK',
} as const

export type ProjectType = typeof ProjectType[keyof typeof ProjectType]

export interface IProject {
  title: II18nString
  description?: II18nString
  skillIds: mongoose.Types.ObjectId[]
  relatedProjectIds: mongoose.Types.ObjectId[]
  thumbnailId?: string
  link?: string
  screenshots: string[]
  projectYear: number
  type?: ProjectType
  githubRepoUrl?: string
  sortOrder?: number | null
}
