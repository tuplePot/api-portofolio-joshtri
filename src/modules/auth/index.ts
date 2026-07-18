import { Elysia } from 'elysia'
import { jwt as jwtPlugin } from '@elysiajs/jwt'
import { rateLimit } from 'elysia-rate-limit'
import { loginBody, type LoginBody } from './model'
import { AuthService } from './service'
import { fail, ok } from '../../libs/response'

export const authModule = new Elysia({ prefix: '/auth' })
  .use(
    jwtPlugin({
      name: 'jwt',
      secret: process.env.JWT_SECRET!,
      exp: '7d',
    })
  )
  .use(
    rateLimit({
      duration: 60 * 1000,
      max: 10,
      // Only apply to the login route — elysia-rate-limit hooks run globally
      // and would otherwise throttle unrelated routes like GET /api/projects.
      skip: (req) => !new URL(req.url).pathname.endsWith('/auth/login'),
      generator: (req, server) =>
        server?.requestIP(req)?.address ??
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        req.headers.get('x-real-ip') ??
        'unknown',
      errorResponse: new Response(
        JSON.stringify({ success: false, message: 'Too many login attempts, please try again later', data: null }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      ),
    })
  )
  .post(
    '/login',
    async ({ body, jwt }: { body: LoginBody; jwt: { sign: (payload: Record<string, string>) => Promise<string> } }) => {
      const user = await AuthService.validateCredentials(body)
      if (!user) return fail(401, 'Invalid email or password')

      const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      })

      return ok({ token }, 'Login successful')
    },
    { body: loginBody }
  )
