import { OpenRouter } from '@openrouter/sdk'
import { log } from '../../libs/logger'
import { isOpenRouterError } from './utils'

const openrouter = new OpenRouter({
  appTitle: 'portofolio-me',
  appCategories: 'landing page, personal website',
  apiKey: process.env.OPENROUTER_API_KEY || '',
})

// Free models are shared and get rate-limited (429) constantly. We try them in
// order so a throttle on one falls through to the next. Ordered by quality /
// multilingual (ID+EN) strength. Override the primary via OPENROUTER_MODEL.
const FREE_MODELS = [
  process.env.OPENROUTER_MODEL,
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'google/gemma-4-31b-it:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
].filter((m): m is string => Boolean(m))

const MAX_RETRY_WAIT_MS = 3000

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function isRateLimit(err: any): boolean {
  const code = err?.statusCode ?? err?.status ?? err?.data$?.error?.code
  return code === 429 || /rate.?limit|429/i.test(String(err?.message ?? ''))
}

function retryAfterMs(err: any): number {
  const secs = err?.data$?.error?.metadata?.retry_after_seconds
  return Math.min((Number(secs) || 1) * 1000, MAX_RETRY_WAIT_MS)
}

// Assistant content can be a string or an array of content items.
function extractText(res: any): string {
  const content = res?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map((c: any) => (typeof c === 'string' ? c : c?.text ?? '')).join('')
  }
  return ''
}

async function send(model: string, messages: ChatMessage[]) {
  return openrouter.chat.send({ chatRequest: { messages, model } })
}

/**
 * Send a chat completion, cycling through the free-model list on rate limits.
 * Returns the assistant's text. Throws only when every model is exhausted.
 *
 * Kept intentionally simple (non-streaming) — streaming can be added later as a
 * separate `chatStream()` without touching callers.
 */
export async function chat(messages: ChatMessage[]): Promise<string> {
  let lastErr: unknown

  for (const model of FREE_MODELS) {
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

  const detail = isOpenRouterError(lastErr)
    ? lastErr.data$ ?? lastErr.body ?? lastErr.error ?? lastErr.message ?? lastErr
    : lastErr
  log.error({ err: detail }, 'OpenRouter chat failed')
  throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail))
}

export async function checkConnection(): Promise<boolean> {
  const key = process.env.OPENROUTER_API_KEY ?? ''
  // Mask the key — never print secrets in full to the terminal/logs.
  log.info(`Checking OpenRouter connection with API key: sk-or-...${key.slice(-4)}`)
  const res = await fetch('https://openrouter.ai/api/v1/key', {
    headers: { Authorization: `Bearer ${key}` },
  })
  return res.ok
}
