import { Elysia } from 'elysia'
import { DeployService } from './service'
import { guard } from '../../shared'

export const deployModule = new Elysia({ prefix: '/deploy' })
  // Protected (JWT required) — triggers a rebuild of the static portfolio
  .use(guard)
  .post(
    '/',
    () => DeployService.trigger(),
    {
      detail: {
        summary: 'Trigger a site redeploy',
        description: 'Fires the configured hosting provider deploy hook (Vercel/Netlify/Cloudflare).',
        tags: ['Deploy'],
      },
    }
  )