import { Elysia, t } from 'elysia'
import { AiService } from './ai.service'
import { SUGGESTED_QUESTIONS } from './suggestions'
import { ok, fail, createRateLimiter, getClientIp } from '../../shared'

// Public endpoint → cap per visitor so nobody can drain the Groq quota.
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
      detail: {
        summary: 'Ask the portfolio AI assistant',
        description: 'Intent → business logic → structured context → 1 LLM call. Rate-limited to 15/min/IP.',
        tags: ['AI Assistant'],
      },
    },
  )
  // Starter questions for the chat UI (bilingual).
  .get(
    '/suggestions',
    () => ok(SUGGESTED_QUESTIONS, 'ok'),
    { detail: { summary: 'Suggested starter questions', tags: ['AI Assistant'] } },
  )
  // Liveness check for the Groq key/connection.
  .get(
    '/health/groq',
    async () => {
      const connected = await AiService.checkConnection()
      return ok({ connected }, 'ok')
    },
    { detail: { summary: 'Groq API connectivity check', tags: ['AI Assistant'] } },
  )