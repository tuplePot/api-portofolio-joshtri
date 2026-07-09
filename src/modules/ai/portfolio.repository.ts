import { Project } from '../project/model'
import { Skill } from '../skill/model'
import { WorkExperience } from '../work-experience/model'
import { Education } from '../education/model'
import type {
  ProjectView,
  SkillView,
  ExperienceView,
  EducationView,
} from './types'

/**
 * Repository layer — the ONLY place that talks to Mongoose for the assistant.
 * A personal portfolio is tiny, so we load whole collections and let the
 * service filter in memory. This keeps queries trivial and makes a future swap
 * to a vector store / RAG index a change isolated to this file.
 */
export abstract class PortfolioRepository {
  static async getProjects(): Promise<ProjectView[]> {
    const projects = await Project.find()
      .populate('skillIds', '_id name category layer level icon color')
      .populate('relatedProjectIds', '_id title type')
      .lean()
    return projects as unknown as ProjectView[]
  }

  static async getSkills(): Promise<SkillView[]> {
    const skills = await Skill.find().select('_id name category layer level icon color').lean()
    return skills as unknown as SkillView[]
  }

  static async getExperience(): Promise<ExperienceView[]> {
    const exp = await WorkExperience.find().sort({ startDate: -1 }).lean()
    return exp as unknown as ExperienceView[]
  }

  static async getEducation(): Promise<EducationView[]> {
    const edu = await Education.find().sort({ startYear: -1 }).lean()
    return edu as unknown as EducationView[]
  }
}
