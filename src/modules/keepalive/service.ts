import { env } from '../../config'

interface KeepaliveResult {
  success: boolean
  message: string
  timestamp: string
  latencyMs: number
}

let lastResult: KeepaliveResult | null = null

export abstract class KeepaliveService {
  static isConfigured(): boolean {
    return !!(env.appwriteEndpoint && env.appwriteProjectId && env.appwriteApiKey)
  }

  static async ping(): Promise<KeepaliveResult> {
    if (!this.isConfigured()) {
      const result: KeepaliveResult = {
        success: false,
        message: 'Appwrite is not configured (set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY)',
        timestamp: new Date().toISOString(),
        latencyMs: 0,
      }
      lastResult = result
      return result
    }

    // Normalize: strip trailing /v1 so we don't get /v1/v1/health
    const base = env.appwriteEndpoint.replace(/\/v1\/?$/, '')

    const start = performance.now()
    try {
      const res = await fetch(`${base}/v1/health`, {
        headers: {
          'x-appwrite-project': env.appwriteProjectId,
          'x-appwrite-key': env.appwriteApiKey,
        },
      })
      const latencyMs = Math.round(performance.now() - start)

      if (!res.ok) {
        const result: KeepaliveResult = {
          success: false,
          message: `Appwrite responded with status ${res.status}`,
          timestamp: new Date().toISOString(),
          latencyMs,
        }
        lastResult = result
        return result
      }

      const result: KeepaliveResult = {
        success: true,
        message: 'Appwrite project is alive',
        timestamp: new Date().toISOString(),
        latencyMs,
      }
      lastResult = result
      return result
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - start)
      const result: KeepaliveResult = {
        success: false,
        message: err.message ?? 'Could not reach Appwrite',
        timestamp: new Date().toISOString(),
        latencyMs,
      }
      lastResult = result
      return result
    }
  }

  static getStatus() {
    return lastResult
  }
}
