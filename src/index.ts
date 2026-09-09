import app from './app'
import { env } from './config'
import { log } from './plugins'

app.listen(env.port)

log.info(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)