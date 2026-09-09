import { Elysia, t } from 'elysia'
import { educationCreate, educationUpdate } from './model'
import { EducationService } from './service'
import { guard } from '../../shared'

const objectIdParam = t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) })

export const educationModule = new Elysia({ prefix: '/educations' })
  // Public
  .get(
    '/',
    () => EducationService.findAll(),
    { detail: { summary: 'List all education entries', tags: ['Education'] } },
  )
  .get(
    '/:id',
    ({ params: { id } }) => EducationService.findById(id),
    {
      params: objectIdParam,
      detail: { summary: 'Get an education entry by ID', tags: ['Education'] },
    },
  )
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post(
        '/',
        ({ body }) => EducationService.create(body),
        {
          body: educationCreate,
          detail: { summary: 'Create an education entry', tags: ['Education'] },
        },
      )
      .patch(
        '/:id',
        ({ params: { id }, body }) => EducationService.update(id, body),
        {
          params: objectIdParam,
          body: educationUpdate,
          detail: { summary: 'Update an education entry by ID', tags: ['Education'] },
        },
      )
      .delete(
        '/:id',
        ({ params: { id } }) => EducationService.remove(id),
        {
          params: objectIdParam,
          detail: { summary: 'Delete an education entry by ID', tags: ['Education'] },
        },
      )
  )