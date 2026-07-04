import { Elysia, status } from 'elysia'
import { jwt as jwtPlugin } from '@elysiajs/jwt'

export const guard = new Elysia({ name: 'guard' })
  .use(
    jwtPlugin({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
      exp: '7d',
    })
  )
  .resolve({ as: 'scoped' }, async ({ jwt, headers }) => {
    const auth = headers['authorization']

    if (!auth?.startsWith('Bearer '))
      return status(401, { success: false, message: 'Unauthorized', data: null })

    const payload = await jwt.verify(auth.slice(7))
    if (!payload)
      return status(401, { success: false, message: 'Invalid or expired token', data: null })

    return { user: payload as { sub: string; email: string; role: string } }
  })
