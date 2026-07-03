import { Education, type EducationCreate, type EducationUpdate } from './model'
import { ok, fail } from '../../libs/response'

export abstract class EducationService {
  static async findAll() {
    const items = await Education.find().sort({ startYear: -1 }).lean()
    return ok(items, 'Education entries fetched successfully')
  }

  static async findById(id: string) {
    const item = await Education.findById(id).lean()
    if (!item) return fail(404, 'Education not found')
    return ok(item, 'Education fetched successfully')
  }

  static async create(data: EducationCreate) {
    const item = await Education.create(data)
    return ok(item, 'Education created successfully')
  }

  static async update(id: string, data: EducationUpdate) {
    const item = await Education.findByIdAndUpdate(id, data, { new: true }).lean()
    if (!item) return fail(404, 'Education not found')
    return ok(item, 'Education updated successfully')
  }

  static async remove(id: string) {
    const item = await Education.findByIdAndDelete(id).lean()
    if (!item) return fail(404, 'Education not found')
    return ok(item, 'Education deleted successfully')
  }
}
