import type { II18nString } from '../../libs/i18n'
import type { OpenRouterError } from './types'

export function isOpenRouterError(e: unknown): e is OpenRouterError {
  return typeof e === 'object' && e !== null
}

// Pick a display string from an i18n field, English-first (recruiters), falling
// back to Indonesian. The LLM is told separately to answer in the user's
// language, so English context is fine.
export function pick(v?: Partial<II18nString> | null): string {
  if (!v) return ''
  return v.en || v.id || ''
}

// Normalize for keyword/entity matching: lowercase, collapse whitespace.
export function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim()
}
