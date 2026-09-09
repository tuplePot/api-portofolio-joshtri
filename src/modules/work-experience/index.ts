import { Elysia, t } from 'elysia'
import { workExperienceCreate, workExperienceUpdate } from './model'
import { WorkExperienceService } from './service'
import { guard } from '../../shared'

const objectIdParam = t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) })

export const workExperienceModule = new Elysia({ prefix: '/work-experiences' })
  // Public
  .get(
    '/',
    () => WorkExperienceService.findAll(),
    { detail: { summary: 'List all work experiences', tags: ['Work Experiences'] } },
  )
  .get(
    '/:id',
    ({ params: { id } }) => WorkExperienceService.findById(id),
    {
      params: objectIdParam,
      detail: { summary: 'Get a work experience by ID', tags: ['Work Experiences'] },
    },
  )
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post(
        '/',
        ({ body }) => WorkExperienceService.create(body),
        {
          body: workExperienceCreate,
          detail: { summary: 'Create a work experience', tags: ['Work Experiences'] },
        },
      )
      .patch(
        '/:id',
        ({ params: { id }, body }) => WorkExperienceService.update(id, body),
        {
          params: objectIdParam,
          body: workExperienceUpdate,
          detail: { summary: 'Update a work experience by ID', tags: ['Work Experiences'] },
        },
      )
      .delete(
        '/:id',
        ({ params: { id } }) => WorkExperienceService.remove(id),
        {
          params: objectIdParam,
          detail: { summary: 'Delete a work experience by ID', tags: ['Work Experiences'] },
        },
      )
  )