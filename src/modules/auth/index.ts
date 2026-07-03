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
      duration: 60 * 1000, // 1 minute window
      max: 10,             // max 10 attempts per IP per window
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
