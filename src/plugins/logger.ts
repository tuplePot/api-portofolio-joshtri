import { createPinoLogger } from '@bogeychan/elysia-logger'
import { env, isProd } from '../config'

// Shared pino logger. Pretty, colorized output in dev; plain JSON in prod so a
// log aggregator can parse it. Import `log` in services/lifecycle hooks; inside
// route handlers prefer `ctx.log` (provided by `loggerPlugin`).
export const log = createPinoLogger({
  level: env.logLevel,
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
        },
      }),
})

// Structured request logging + `ctx.log` inside handlers. Skip the root
// route, which is just a 404 probe and would spam the logs.
export const loggerPlugin = log.into({
  autoLogging: { ignore: (ctx) => ctx.path === '/' },
})