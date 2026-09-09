import { cors } from '@elysiajs/cors'
import { env } from '../config'

const allowedOrigins = [
  'http://localhost:4321',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  ...env.frontendUrls
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
].filter((o): o is string => Boolean(o))

// CORS — restrict to known origins. Set FRONTEND_URLS env var (comma-separated)
// in production to include the deployed portfolio/CMS URLs.
export const corsPlugin = cors({ origin: allowedOrigins, credentials: true })