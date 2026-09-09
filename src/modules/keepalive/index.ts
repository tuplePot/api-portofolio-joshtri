import { Elysia } from 'elysia'
import { KeepaliveService } from './service'
import { ok, fail, guard } from '../../shared'
import { env } from '../../config'

export const keepaliveModule = new Elysia({ prefix: '/keepalive' })
  // Public — Vercel cron hits this. Verifies cron-secret header to prevent abuse.
  .get(
    '/cron',
    async ({ headers }) => {
      // In production, require the cron secret to prevent random traffic from
      // triggering pings. Vercel cron can send custom headers via the config.
      if (env.cronSecret && headers['cron-secret'] !== env.cronSecret) {
        return fail(401, 'Invalid cron secret')
      }
      const result = await KeepaliveService.ping()
      return ok(result, result.success ? 'keepalive ping sent' : 'keepalive ping failed')
    },
    {
      detail: {
        summary: 'Cron keepalive ping (auto-called by Vercel Cron)',
        description:
          'Pings the Appwrite health endpoint to prevent project pausing. Protected by cron-secret header.',
        tags: ['Keepalive'],
      },
    },
  )
  // Protected (JWT required) — manual trigger from the frontend admin panel.
  .use(guard)
  .post(
    '/ping',
    async () => {
      const result = await KeepaliveService.ping()
      return ok(result, result.success ? 'keepalive ping sent' : 'keepalive ping failed')
    },
    {
      detail: {
        summary: 'Manually trigger a keepalive ping',
        description: 'Pings the Appwrite project to keep it active. Requires authentication.',
        tags: ['Keepalive'],
      },
    },
  )
  // Protected (JWT required) — last ping status for the frontend dashboard.
  .get(
    '/status',
    () => {
      const status = KeepaliveService.getStatus()
      return ok(status, status ? 'last ping result' : 'no ping has been sent yet')
    },
    {
      detail: {
        summary: 'Last keepalive ping status',
        description: 'Returns the result of the most recent keepalive ping.',
        tags: ['Keepalive'],
      },
    },
  )
