import { Project, type ProjectCreate, type ProjectUpdate } from './model'
import { ok, fail } from '../../libs/response'

export abstract class ProjectService {
  static async findAll() {
    const projects = await Project.find()
      .populate('skillIds')
      .populate('relatedProjectIds', '_id title type thumbnailId')
      .lean()
    return ok(projects, 'Projects fetched successfully')
  }

  static async findById(id: string) {
    const project = await Project.findById(id)
      .populate('skillIds')
      .populate('relatedProjectIds', '_id title type thumbnailId')
      .lean()
    if (!project) return fail(404, 'Project not found')
    return ok(project, 'Project fetched successfully')
  }

  static async create(data: ProjectCreate) {
    const project = await Project.create(data)
    return ok(project, 'Project created successfully')
  }

  static async update(id: string, data: ProjectUpdate) {
    const project = await Project.findByIdAndUpdate(id, data, { new: true })
      .populate('skillIds')
      .lean()
    if (!project) return fail(404, 'Project not found')
    return ok(project, 'Project updated successfully')
  }

  static async remove(id: string) {
    const project = await Project.findByIdAndDelete(id).lean()
    if (!project) return fail(404, 'Project not found')
    return ok(project, 'Project deleted successfully')
  }
}
