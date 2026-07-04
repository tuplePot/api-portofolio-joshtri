import { ok, fail } from '../../libs/response'

export abstract class DeployService {
  static async trigger() {
    const hookUrl = process.env.DEPLOY_HOOK_URL
    if (!hookUrl) return fail(503, 'Deploy hook is not configured (set DEPLOY_HOOK_URL)')

    try {
      const res = await fetch(hookUrl, { method: 'POST' })
      if (!res.ok) return fail(502, `Deploy hook responded with status ${res.status}`)
      return ok(null, 'Deployment triggered — the site will update in a few minutes')
    } catch {
      return fail(502, 'Could not reach the deploy hook')
    }
  }
}
