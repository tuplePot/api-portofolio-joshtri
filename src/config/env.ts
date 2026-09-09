// Centralized, validated environment configuration.
// Read env vars here once; the rest of the app imports `env` instead of
// touching `process.env` directly.

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'API_KEY'] as const
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`)
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  logLevel: process.env.LOG_LEVEL ?? 'info',
  jwtSecret: process.env.JWT_SECRET ?? '',
  apiKey: process.env.API_KEY ?? '',
  // Comma-separated list of allowed CORS origins (production frontend URLs).
  frontendUrls: process.env.FRONTEND_URLS ?? '',
  // Optional deploy hook URL (Vercel/Netlify/Cloudflare) for the Publish Site button.
  deployHookUrl: process.env.DEPLOY_HOOK_URL ?? '',
  // AI assistant — Groq. Optional GROQ_MODEL overrides the primary model.
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? '',
  // Seed credentials — only used when running the seed script.
  seedEmail: process.env.SEED_EMAIL ?? '',
  seedPassword: process.env.SEED_PASSWORD ?? '',
  // Production deploy URL — used as the OpenAPI server url when set.
  prodUrl: process.env.PROD_URL ?? '',
  // Appwrite keepalive — pings your Appwrite project so it doesn't pause.
  appwriteEndpoint: process.env.APPWRITE_ENDPOINT ?? '',
  appwriteProjectId: process.env.APPWRITE_PROJECT_ID ?? '',
  appwriteApiKey: process.env.APPWRITE_API_KEY ?? '',
  // Secret to verify Vercel cron requests.
  cronSecret: process.env.CRON_SECRET ?? '',
} as const

export const isProd = env.nodeEnv === 'production'
