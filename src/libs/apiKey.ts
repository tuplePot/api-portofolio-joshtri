import { Elysia, status } from 'elysia'

// Routes reachable without an x-api-key header. The AI endpoints are called
// directly from the public portfolio site, so they must stay open.
const PUBLIC_PATHS = ['/docs', '/api/ai/ask', '/api/ai/suggestions', '/api/ai/health/openrouter']

export const apiKeyPlugin = new Elysia({ name: 'api-key' })
  // 'global' — onBeforeHandle is local-scoped by default, so without this the
  // check never applied to routes outside this plugin (i.e. every route)
  .onBeforeHandle({ as: 'global' }, ({ headers, path }) => {
    // docs are dev-only and opened directly in a browser (can't send headers)
    if (PUBLIC_PATHS.includes(path)) return

    const key = headers['x-api-key']
    if (!key || key !== process.env.API_KEY) {
      return status(401, { success: false, message: 'Unauthorized', data: null })
    }
  })
