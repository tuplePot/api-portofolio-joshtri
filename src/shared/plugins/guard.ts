import { Elysia, status } from 'elysia'
import { jwt as jwtPlugin } from '@elysiajs/jwt'
import { env } from '../../config'

// JWT guard — verifies the Authorization: Bearer <token> header and exposes
// the decoded `user` on the context. Use inside a `.guard({}, (app) => ...)`.
export const guard = new Elysia({ name: 'shared.guard' })
  .use(
    jwtPlugin({
      name: 'jwt',
      secret: env.jwtSecret,
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