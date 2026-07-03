import { Elysia, t } from 'elysia'
import { workExperienceCreate, workExperienceUpdate } from './model'
import { WorkExperienceService } from './service'
import { guard } from '../../libs/guard'

export const workExperienceModule = new Elysia({ prefix: '/work-experiences' })
  // Public
  .get('/', () => WorkExperienceService.findAll())
  .get('/:id', ({ params: { id } }) => WorkExperienceService.findById(id), {
    params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
  })
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post('/', ({ body }) => WorkExperienceService.create(body), {
        body: workExperienceCreate,
      })
      .patch('/:id', ({ params: { id }, body }) => WorkExperienceService.update(id, body), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
        body: workExperienceUpdate,
      })
      .delete('/:id', ({ params: { id } }) => WorkExperienceService.remove(id), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
      })
  )
