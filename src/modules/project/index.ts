import { Elysia, t } from 'elysia'
import { projectCreate, projectUpdate } from './model'
import { ProjectService } from './service'
import { guard } from '../../libs/guard'

export const projectModule = new Elysia({ prefix: '/projects' })
  // Public
  .get('/', () => ProjectService.findAll())
  .get('/:id', ({ params: { id } }) => ProjectService.findById(id), {
    params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
  })
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post('/', ({ body }) => ProjectService.create(body), {
        body: projectCreate,
      })
      .patch('/:id', ({ params: { id }, body }) => ProjectService.update(id, body), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
        body: projectUpdate,
      })
      .delete('/:id', ({ params: { id } }) => ProjectService.remove(id), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
      })
  )
