import { Elysia, t } from 'elysia'
import { skillCreate, skillUpdate } from './model'
import { SkillService } from './service'
import { guard } from '../../libs/guard'

export const skillModule = new Elysia({ prefix: '/skills' })
  // Public
  .get('/', () => SkillService.findAll())
  .get('/:id', ({ params: { id } }) => SkillService.findById(id), {
    params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
  })
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post('/', ({ body }) => SkillService.create(body), {
        body: skillCreate,
      })
      .patch('/:id', ({ params: { id }, body }) => SkillService.update(id, body), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
        body: skillUpdate,
      })
      .delete('/:id', ({ params: { id } }) => SkillService.remove(id), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
      })
  )
