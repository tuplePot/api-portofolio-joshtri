import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { mongoosePlugin } from './libs/mongoose'
import { authModule } from './modules/auth'
import { skillModule } from './modules/skill'
import { projectModule } from './modules/project'
import { workExperienceModule } from './modules/work-experience'
import { educationModule } from './modules/education'
import { docsModule } from './modules/docs'
import { lookupModule } from './modules/lookup'

// Fail fast if required env vars are missing — prevents signing JWTs with "undefined"
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'] as const
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}

const isProd = process.env.NODE_ENV === 'production'

const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
].filter((o): o is string => Boolean(o))

const app = new Elysia()
  .use(helmet())
  .use(cors({
    origin: allowedOrigins,
    credentials: true,
  }))
  .onError(({ error, set, code }) => {
    // Elysia request validation (TypeBox)
    if (code === 'VALIDATION') {
      set.status = 422
      return { success: false, message: error.message, data: null }
    }

    // Mongoose validation (required field missing, enum mismatch, etc.)
    if (error instanceof Error && error.name === 'ValidationError') {
      set.status = 422
      const message = Object.values((error as any).errors)
        .map((e: any) => e.message)
        .join(', ')
      return { success: false, message, data: null }
    }

    // Mongoose CastError (invalid ObjectId format)
    if (error instanceof Error && error.name === 'CastError') {
      set.status = 400
      return { success: false, message: 'Invalid ID format', data: null }
    }

    set.status = 500
    // Never expose internal error details in production
    return {
      success: false,
      message: isProd ? 'Internal server error' : ((error as any).message ?? 'Internal server error'),
      data: null,
    }
  })
  .use(mongoosePlugin)
  .get('/', () => 'Portfolio API')
  .use(docsModule)
  .group('/api', (app) =>
    app
      .use(authModule)
      .use(lookupModule)
      .use(skillModule)
      .use(projectModule)
      .use(workExperienceModule)
      .use(educationModule)
  )
  .listen({ port: Number(process.env.PORT ?? 3000), hostname: '127.0.0.1' })

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
