import { Skill, type SkillCreate, type SkillUpdate } from './model'
import { ok, fail } from '../../libs/response'

export abstract class SkillService {
  static async findAll() {
    const skills = await Skill.find().lean()
    return ok(skills, 'Skills fetched successfully')
  }

  static async findById(id: string) {
    const skill = await Skill.findById(id).lean()
    if (!skill) return fail(404, 'Skill not found')
    return ok(skill, 'Skill fetched successfully')
  }

  static async create(data: SkillCreate) {
    const skill = await Skill.create(data)
    return ok(skill, 'Skill created successfully')
  }

  static async update(id: string, data: SkillUpdate) {
    const skill = await Skill.findByIdAndUpdate(id, data, { new: true }).lean()
    if (!skill) return fail(404, 'Skill not found')
    return ok(skill, 'Skill updated successfully')
  }

  static async remove(id: string) {
    const skill = await Skill.findByIdAndDelete(id).lean()
    if (!skill) return fail(404, 'Skill not found')
    return ok(skill, 'Skill deleted successfully')
  }
}
