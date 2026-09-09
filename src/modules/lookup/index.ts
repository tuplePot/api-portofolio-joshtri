import { Elysia } from 'elysia'
import { Skill } from '../skill/model'
import { ok } from '../../shared'

export const lookupModule = new Elysia({ prefix: '/lookup' })
  .get(
    '/skills',
    async () => {
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
    },
    {
      detail: {
        summary: 'List skills for form dropdowns',
        description: 'Lightweight id/name/icon/color list for CMS and portfolio forms.',
        tags: ['Lookup'],
      },
    }
  )
