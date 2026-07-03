import { WorkExperience, type WorkExperienceCreate, type WorkExperienceUpdate } from './model'
import { ok, fail } from '../../libs/response'

export abstract class WorkExperienceService {
  static async findAll() {
    const items = await WorkExperience.find().sort({ startDate: -1 }).lean()
    return ok(items, 'Work experiences fetched successfully')
  }

  static async findById(id: string) {
    const item = await WorkExperience.findById(id).lean()
    if (!item) return fail(404, 'Work experience not found')
    return ok(item, 'Work experience fetched successfully')
  }

  static async create(data: WorkExperienceCreate) {
    const item = await WorkExperience.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      tags: data.tags ?? [],
    })
    return ok(item, 'Work experience created successfully')
  }

  static async update(id: string, data: WorkExperienceUpdate) {
    const item = await WorkExperience.findByIdAndUpdate(
      id,
      {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
      { new: true }
    ).lean()
    if (!item) return fail(404, 'Work experience not found')
    return ok(item, 'Work experience updated successfully')
  }

  static async remove(id: string) {
    const item = await WorkExperience.findByIdAndDelete(id).lean()
    if (!item) return fail(404, 'Work experience not found')
    return ok(item, 'Work experience deleted successfully')
  }
}
