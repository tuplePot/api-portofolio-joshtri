import { Elysia, t } from 'elysia'
import { skillCreate, skillUpdate } from './model'
import { SkillService } from './service'
import { guard } from '../../shared'

const objectIdParam = t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) })

export const skillModule = new Elysia({ prefix: '/skills' })
  // Public
  .get(
    '/',
    () => SkillService.findAll(),
    { detail: { summary: 'List all skills', tags: ['Skills'] } },
  )
  .get(
    '/:id',
    ({ params: { id } }) => SkillService.findById(id),
    {
      params: objectIdParam,
      detail: { summary: 'Get a skill by ID', tags: ['Skills'] },
    },
  )
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post(
        '/',
        ({ body }) => SkillService.create(body),
        {
          body: skillCreate,
          detail: { summary: 'Create a skill', tags: ['Skills'] },
        },
      )
      .patch(
        '/:id',
        ({ params: { id }, body }) => SkillService.update(id, body),
        {
          params: objectIdParam,
          body: skillUpdate,
          detail: { summary: 'Update a skill by ID', tags: ['Skills'] },
        },
      )
      .delete(
        '/:id',
        ({ params: { id } }) => SkillService.remove(id),
        {
          params: objectIdParam,
          detail: { summary: 'Delete a skill by ID', tags: ['Skills'] },
        },
      )
  )