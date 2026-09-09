import type { II18nString } from '../../shared'
import type { GroqError } from './types'

export function isGroqError(e: unknown): e is GroqError {
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
