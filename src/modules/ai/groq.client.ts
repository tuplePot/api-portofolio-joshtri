import { log } from '../../plugins/logger'
import { isGroqError } from './utils'
import { env } from '../../config'

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

// Groq chat models tried in order. Groq occasionally rate-limits (429) or
// deprecates a model, so a failure on one falls through to the next. Ordered by
// quality / multilingual (ID+EN) strength. Override the primary via GROQ_MODEL.
const GROQ_MODELS = [
  env.groqModel,
  'groq/compound',
  'openai/gpt-oss-120b',
  'groq/compound-mini',
  'openai/gpt-oss-20b',
].filter((m): m is string => Boolean(m))

const MAX_RETRY_WAIT_MS = 3000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqChatResponse {
  choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>
}

function isRateLimit(err: any): boolean {
  const code = err?.statusCode ?? err?.status
  return code === 429 || /rate.?limit|429/i.test(String(err?.message ?? ''))
}

function retryAfterMs(err: any): number {
  const secs = err?.retryAfterSeconds
  return Math.min((Number(secs) || 1) * 1000, MAX_RETRY_WAIT_MS)
}

// Assistant content can be a string or an array of content items.
function extractText(res: GroqChatResponse): string {
  const content = res?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map((c: any) => (typeof c === 'string' ? c : c?.text ?? '')).join('')
  }
  return ''
}

async function send(model: string, messages: ChatMessage[]): Promise<GroqChatResponse> {
  const apiKey = env.groqApiKey
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured')

  const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages, temperature: 0.4, max_tokens: 1024 }),
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    const retryAfterSeconds = Number(res.headers.get('retry-after')) || undefined
    throw Object.assign(new Error(`Groq API error ${res.status}: ${bodyText}`), {
      statusCode: res.status,
      retryAfterSeconds,
    })
  }

  return (await res.json()) as GroqChatResponse
}

/**
 * Send a chat completion, cycling through the Groq model list on rate limits.
 * Returns the assistant's text. Throws only when every model is exhausted.
 *
 * Kept intentionally simple (non-streaming) — streaming can be added later as a
 * separate `chatStream()` without touching callers.
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
  let lastErr: unknown

  for (const model of GROQ_MODELS) {
    try {
      return extractText(await send(model, messages))
    } catch (err) {
      lastErr = err
      if (isRateLimit(err)) {
        await new Promise((r) => setTimeout(r, retryAfterMs(err)))
        try {
          return extractText(await send(model, messages))
        } catch (retryErr) {
          lastErr = retryErr
          continue // still throttled — try the next model
        }
      }
      break // non-rate-limit error — no point trying other models
    }
  }

  const detail = isGroqError(lastErr)
    ? lastErr.body ?? lastErr.error ?? lastErr.message ?? lastErr
    : lastErr
  log.error({ err: detail }, 'Groq chat failed')
  throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
}

export async function checkConnection(): Promise<boolean> {
  const key = env.groqApiKey
  // Mask the key — never print secrets in full to the terminal/logs.
  log.info(`Checking Groq connection with API key: gsk_...${key.slice(-4)}`)
  const res = await fetch(`${GROQ_BASE_URL}/models`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  return res.ok
}
