import { Elysia } from 'elysia'
import { Skill } from '../skill/model'
import { ok } from '../../libs/response'

export const lookupModule = new Elysia({ prefix: '/lookup' })
  .get('/skills', async () => {
    const skills = await Skill.find().select('_id name icon color').lean()
    return ok(
      skills.map((s) => ({
        value: String(s._id),
        label: s.name,
        icon: s.icon,
        color: s.color,
      })),
      'Skills lookup fetched successfully',
    )
  })
