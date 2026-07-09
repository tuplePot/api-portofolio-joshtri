import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { helmet } from 'elysia-helmet'
import { connectDB, mongoosePlugin } from './libs/mongoose'
import { apiKeyPlugin } from './libs/apiKey'
import { log } from './libs/logger'
import { authModule } from './modules/auth'
import { skillModule } from './modules/skill'
import { projectModule } from './modules/project'
import { workExperienceModule } from './modules/work-experience'
import { educationModule } from './modules/education'
import { docsModule } from './modules/docs'
import { lookupModule } from './modules/lookup'
import { deployModule } from './modules/deploy'
import { aiModule } from './modules/ai'

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'] as const
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}

const isProd = process.env.NODE_ENV === 'production'

const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.FRONTEND_URLS?.split(',').map(url => url.trim()) ?? []),
].filter((o): o is string => Boolean(o))

const app = new Elysia()
  .use(helmet())
  .use(cors({ origin: allowedOrigins, credentials: true }))
  // Structured request logging + `ctx.log` inside handlers. Skip the root
  // route, which is just a 404 probe and would spam the logs.
  .use(log.into({ autoLogging: { ignore: (ctx) => ctx.path === '/' } }))
  .onError(({ error, set, code }) => {
    log.error({ code, err: error }, 'request failed')
    if (code === 'VALIDATION') {
      set.status = 422
      return { success: false, message: error.message, data: null }
    }
    if (error instanceof Error && error.name === 'ValidationError') {
      set.status = 422
      const message = Object.values((error as any).errors)
        .map((e: any) => e.message)
        .join(', ')
      return { success: false, message, data: null }
    }
    if (error instanceof Error && error.name === 'CastError') {
      set.status = 400
      return { success: false, message: 'Invalid ID format', data: null }
    }
    set.status = 500
    return {
      success: false,
      message: isProd ? 'Internal server error' : ((error as any).message ?? 'Internal server error'),
      data: null,
    }
  })
  // 1. API key check — rejects unauthorized requests before touching the DB
  .use(apiKeyPlugin)
  // 2. DB connection — only reached for valid requests
  .onBeforeHandle(connectDB)
  .use(mongoosePlugin)
  // Root returns 404 — nothing to see here
  .get('/', ({ set }) => { set.status = 404; return null })
  // Docs only available in development
  .use(isProd ? new Elysia() : docsModule)
  .group('/api', (app) =>
    app
      .use(authModule)
      .use(lookupModule)
      .use(skillModule)
      .use(projectModule)
      .use(workExperienceModule)
      .use(educationModule)
      .use(deployModule)
      .use(aiModule)
  )

export default app
