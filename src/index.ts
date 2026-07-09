import app from './app'
import { log } from './libs/logger'

app.listen({ port: Number(process.env.PORT ?? 3000), hostname: '127.0.0.1' })

log.info(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
