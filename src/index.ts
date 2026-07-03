import app from './app'

app.listen({ port: Number(process.env.PORT ?? 3000), hostname: '127.0.0.1' })

console.log(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
