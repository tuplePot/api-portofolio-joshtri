import { openapi } from '@elysia/openapi'
import { env, isProd } from '../config'

// OpenAPI documentation. Served at /openapi (Scalar UI); raw spec at /openapi/json.
// Enabled in all environments — access is protected by openapiGuardPlugin
// (admin login via /openapi/_/gate), so the docs are safe to expose in prod.
// Tags are declared here so the docs UI groups routes and shows section descriptions;
// individual routes opt into a tag via `detail: { tags: [...] }`.
export const openapiPlugin = openapi({
  documentation: {
    info: {
      title: 'Joshtri Portfolio API',
      version: '1.0.0',
      description:
        'Portfolio REST API — skills, projects, work experiences, education, deploy hooks, and the grounded AI assistant.',
    },
    servers: [
      {
        url: isProd && env.prodUrl ? env.prodUrl : `http://localhost:${env.port}`,
        description: isProd ? 'Production' : 'Local development',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Login and receive a JWT token' },
      { name: 'Skills', description: 'Manage portfolio skills' },
      { name: 'Projects', description: 'Manage portfolio projects' },
      { name: 'Work Experiences', description: 'Manage work experience entries' },
      { name: 'Education', description: 'Manage education entries' },
      { name: 'Lookup', description: 'Lookups for CMS form dropdowns' },
      { name: 'Deploy', description: 'Trigger site redeploys' },
      { name: 'AI Assistant', description: 'Grounded portfolio AI assistant' },
    ],
  },
})