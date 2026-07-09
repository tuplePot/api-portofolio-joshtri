import { Elysia, t } from 'elysia'
import { AiService } from './ai.service'
import { SUGGESTED_QUESTIONS } from './suggestions'
import { ok, fail } from '../../libs/response'
import { createRateLimiter, getClientIp } from '../../libs/rateLimit'

// Public endpoint → cap per visitor so nobody can drain the OpenRouter quota.
const askLimiter = createRateLimiter({ windowMs: 60_000, max: 15 })

export const aiModule = new Elysia({ prefix: '/ai' })
  // Ask the portfolio assistant. Public — called from the browser chat panel.
  .post(
    '/ask',
    async ({ body }) => {
      const result = await AiService.ask(body.prompt)
      return ok(result, 'ok')
    },
    {
      body: t.Object({
        prompt: t.String({ minLength: 1, maxLength: 500 }),
      }),
      beforeHandle({ headers, server, request, set }) {
        const ip = getClientIp(headers, server ?? undefined, request)
        const rl = askLimiter(ip)
        if (!rl.allowed) {
          set.headers['retry-after'] = String(rl.retryAfter)
          return fail(429, 'Too many requests — please slow down and try again shortly.')
        }
      },
    },
  )
  // Starter questions for the chat UI (bilingual).
  .get('/suggestions', () => ok(SUGGESTED_QUESTIONS, 'ok'))
  // Liveness check for the OpenRouter key/connection.
  .get('/health/openrouter', async () => {
    const connected = await AiService.checkConnection()
    return ok({ connected }, 'ok')
  })
