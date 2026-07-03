import { Elysia, status } from 'elysia'

export const apiKeyPlugin = new Elysia({ name: 'api-key' })
  .onBeforeHandle(({ headers }) => {
    const key = headers['x-api-key']
    if (!key || key !== process.env.API_KEY) {
      return status(401, { success: false, message: 'Unauthorized', data: null })
    }
  })
