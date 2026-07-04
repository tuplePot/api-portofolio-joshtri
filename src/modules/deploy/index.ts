import { Elysia } from 'elysia'
import { DeployService } from './service'
import { guard } from '../../libs/guard'

export const deployModule = new Elysia({ prefix: '/deploy' })
  // Protected (JWT required) — triggers a rebuild of the static portfolio
  .use(guard)
  .post('/', () => DeployService.trigger())
