import { Elysia, t } from 'elysia'
import { projectCreate, projectUpdate } from './model'
import { ProjectService } from './service'
import { guard } from '../../shared'

const objectIdParam = t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) })

export const projectModule = new Elysia({ prefix: '/projects' })
  // Public
  .get(
    '/',
    () => ProjectService.findAll(),
    { detail: { summary: 'List all projects', tags: ['Projects'] } },
  )
  .get(
    '/:id',
    ({ params: { id } }) => ProjectService.findById(id),
    {
      params: objectIdParam,
      detail: { summary: 'Get a project by ID', tags: ['Projects'] },
    },
  )
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post(
        '/',
        ({ body }) => ProjectService.create(body),
        {
          body: projectCreate,
          detail: { summary: 'Create a project', tags: ['Projects'] },
        },
      )
      .patch(
        '/:id',
        ({ params: { id }, body }) => ProjectService.update(id, body),
        {
          params: objectIdParam,
          body: projectUpdate,
          detail: { summary: 'Update a project by ID', tags: ['Projects'] },
        },
      )
      .delete(
        '/:id',
        ({ params: { id } }) => ProjectService.remove(id),
        {
          params: objectIdParam,
          detail: { summary: 'Delete a project by ID', tags: ['Projects'] },
        },
      )
  )