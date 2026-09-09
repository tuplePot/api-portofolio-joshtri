import { Elysia } from 'elysia'
import { helmet } from 'elysia-helmet'
import { connectDB, mongoosePlugin } from './database'
import { isProd } from './config'
import { apiKeyPlugin, corsPlugin, loggerPlugin, openapiGuardPlugin, openapiPlugin, log } from './plugins'
import { authModule } from './modules/auth'
import { skillModule } from './modules/skill'
import { projectModule } from './modules/project'
import { workExperienceModule } from './modules/work-experience'
import { educationModule } from './modules/education'
import { lookupModule } from './modules/lookup'
import { deployModule } from './modules/deploy'
import { aiModule } from './modules/ai'

const app = new Elysia()
  .use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    }),
  )
  .use(corsPlugin)
  .use(loggerPlugin)
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
  .get('/favicon.ico', ({ set }) => { set.status = 204; return null })
  .get('/health', () => ({ status: 'ok', service: 'cms-portfolio', timestamp: new Date().toISOString() }))
  // OpenAPI docs — admin-guarded (login at /openapi/_/gate), safe in prod
  .use(openapiGuardPlugin)
  .use(openapiPlugin)
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