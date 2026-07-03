import { Elysia, t } from 'elysia'
import { educationCreate, educationUpdate } from './model'
import { EducationService } from './service'
import { guard } from '../../libs/guard'

export const educationModule = new Elysia({ prefix: '/educations' })
  // Public
  .get('/', () => EducationService.findAll())
  .get('/:id', ({ params: { id } }) => EducationService.findById(id), {
    params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
  })
  // Protected (JWT required)
  .guard({}, (app) =>
    app
      .use(guard)
      .post('/', ({ body }) => EducationService.create(body), {
        body: educationCreate,
      })
      .patch('/:id', ({ params: { id }, body }) => EducationService.update(id, body), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
        body: educationUpdate,
      })
      .delete('/:id', ({ params: { id } }) => EducationService.remove(id), {
        params: t.Object({ id: t.String({ pattern: '^[0-9a-fA-F]{24}$' }) }),
      })
  )
