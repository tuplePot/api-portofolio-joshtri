import { status } from 'elysia'

export const ok = <T>(data: T, message: string) => ({
  success: true as const,
  message,
  data,
})

export const fail = (code: number, message: string) =>
  status(code, { success: false as const, message, data: null })
