import { Elysia, status } from 'elysia'
import { env } from '../config'

// Routes reachable without an x-api-key header. The AI endpoints are called
// directly from the public portfolio site, so they must stay open. Everything
// under /openapi is opened directly in a browser (can't send headers) and is
// protected separately by openapiGuardPlugin (admin login), so the API-key
// check skips the whole prefix. The keepalive/cron path is hit by Vercel Cron
// and is protected by its own cron-secret header check instead.
const PUBLIC_PATHS = [
  '/health',
  '/api/ai/ask',
  '/api/ai/suggestions',
  '/api/ai/health/groq',
  '/api/keepalive/cron',
]

export const apiKeyPlugin = new Elysia({ name: 'plugin.apiKey' })
  // 'global' — onBeforeHandle is local-scoped by default, so without this the
  // check never applied to routes outside this plugin (i.e. every route)
  .onBeforeHandle({ as: 'global' }, ({ headers, path }) => {
    if (PUBLIC_PATHS.includes(path) || path.startsWith('/openapi')) return

    const key = headers['x-api-key']
    if (!key || key !== env.apiKey) {
      return status(401, { success: false, message: 'Unauthorized', data: null })
    }
  })
