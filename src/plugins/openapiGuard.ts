import { Elysia } from 'elysia'
import { jwt as jwtPlugin } from '@elysiajs/jwt'
import { env, isProd } from '../config'
import { AuthService } from '../modules/auth/service'
import { loginBody } from '../modules/auth/model'

// Guard for the OpenAPI docs (/openapi*). Adapted from gitpersona-server's
// openapiGuard: unauthenticated visitors get a 401 ASCII-art page; admins sign
// in at /openapi/_/gate, which posts to /openapi/_/login and receives an
// HttpOnly `adminToken` cookie. A Bearer token from /api/auth/login also works
// (same JWT secret), e.g. for curl/Postman access to /openapi/json.

const asciiArt = `
                                                          #*
                                                      *******===
                                                    ***#######===
                                                   #**########+===
                                                   ***########+===
                                                   ***########*===
                                                   ***########*===
                                                   **#########*===
                                                   **#########*===
                                                   **#########*===+
                                                  #**#########*===+
                                                  ***#########*====
                                                  #**#########*====
                                                  ***##########====
                                                  ***##########====
                                                  ***##########====
                                                  ***##########====
                                       *********==***##########====@********+
                                     *****#####*==+**##########====****##****==
                                    :***########+==*###########===+*#########=== #*******:
                                    ***#########===*###########===+##########+==****###**=+
                                   ***##########===*###########===+##########*==**#######+==
                                   ***##########==+*###########===+##########*==*#########==
                                  ***##########*==+*###########===+###########==*#########+==
                                  ***##########*==+*###########+==+###########==+#########*==
                                 ****##########+==*############+==+###########+=+##########===
                             @**==+*###########+==*############+==+###########+=+##########===
                           ****===**###########*=+##############++############*=+##########+==
                         #****+===**#######################################################*===
                         *****===+*########################################################*===
                        ******+==+*#########################################################===
                        ***********#########################################################===
                        ***********#########################################################====
                         **********#########################################################+===
                         **********#########################################################+===
                         **********#########################################################*===
                         #**********########################################################+===
                          *************************##########******############*****#######*====
                          *****************************************************************+===+
                          *****************************************************************====
                           ***************************************************************====
                            *************************************************************====:
                              **********************************************************+====
                               #*******************************************************+====
                                 *****************************************************+====
                                   **************************************************=====
                                     **********************************************+=====
                                        ******************************************+====
                                         #***************************************+====
                                          ***************************************+===
                                          ***************************************+===
                                          ***************************************+===
                                          @**************************************+===
                                           ***************************************===
                                            #*************************************#
`

function unauthorizedPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>401 — Joshtri Portfolio API Docs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0d1117;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #c9d1d9;
      padding: 32px 16px;
    }
    .ascii {
      font-family: "Courier New", Courier, monospace;
      font-size: 7px;
      line-height: 1.15;
      color: #f85149;
      opacity: 0.75;
      white-space: pre;
      margin-bottom: 32px;
      user-select: none;
    }
    .quip {
      font-size: 15px;
      color: #8b949e;
      letter-spacing: 0.01em;
      margin-top: 8px;
      text-align: center;
    }
    .quip span {
      color: #f85149;
      font-weight: 600;
    }
    .gate-link {
      margin-top: 20px;
      color: #58a6ff;
      font-size: 13px;
      text-decoration: none;
    }
    .gate-link:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <pre class="ascii">${asciiArt}</pre>
  <p class="quip text-center">lol, nice try — <span>you're not getting in here, dude.</span></p>
  <a class="gate-link" href="/openapi/_/gate">Admin? Sign in here →</a>
</body>
</html>`
}

function loginPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Login — Joshtri Portfolio API Docs</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d1117;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #c9d1d9;
    }
    .dialog {
      background: #fff;
      border: 1px solid #888;
      border-radius: 4px;
      padding: 20px 24px;
      min-width: 300px;
      font-size: 13px;
      color: #000;
      box-shadow: 4px 4px 12px rgba(0,0,0,0.35);
    }
    .dialog p { margin-bottom: 14px; font-weight: 600; }
    .dialog input {
      width: 100%; padding: 4px 6px;
      border: 1px solid #888; border-radius: 2px;
      font-size: 13px; margin-bottom: 10px; outline: none;
    }
    .dialog input:focus { border-color: #0066cc; }
    .dialog-row { display: flex; justify-content: flex-end; margin-top: 4px; }
    .dialog button {
      padding: 4px 20px; font-size: 13px;
      border-radius: 3px; cursor: pointer;
      background: #0066cc; color: #fff;
      border: 1px solid #0066cc;
    }
    .dialog button:disabled { opacity: 0.6; cursor: not-allowed; }
    .err { color: #c00; font-size: 12px; margin-bottom: 8px; display: none; }
  </style>
</head>
<body>
  <div class="dialog">
    <p>Joshtri Portfolio API Docs — Sign in</p>
    <input id="email" type="email" placeholder="Email" autocomplete="username" />
    <input id="password" type="password" placeholder="Password" autocomplete="current-password" />
    <div class="err" id="err"></div>
    <div class="dialog-row">
      <button id="btn">OK</button>
    </div>
  </div>
  <script>
    const btn = document.getElementById('btn');
    const err = document.getElementById('err');
    document.getElementById('email').focus();

    async function login() {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      err.style.display = 'none';
      btn.disabled = true;
      try {
        const res = await fetch('/openapi/_/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          err.textContent = data?.message || 'Login failed.';
          err.style.display = 'block';
          document.getElementById('password').value = '';
          document.getElementById('password').focus();
          return;
        }
        window.location.href = '/openapi';
      } catch {
        err.textContent = 'Network error — is the server running?';
        err.style.display = 'block';
      } finally {
        btn.disabled = false;
      }
    }

    btn.addEventListener('click', login);
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });
  </script>
</body>
</html>`
}

// Reads `adminToken=<jwt>` from the raw Cookie header — this project has no
// @elysiajs/cookie plugin, and the guard only needs this one value.
function extractCookieToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null
  const pair = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('adminToken='))
  return pair ? pair.slice('adminToken='.length) : null
}

export const openapiGuardPlugin = new Elysia({ name: 'plugin.openapiGuard' })
  .use(
    jwtPlugin({
      name: 'jwt',
      secret: env.jwtSecret,
      exp: '7d',
    })
  )
  // Login page for the docs — reachable without a token by design.
  .get('/openapi/_/gate', ({ set }) => {
    set.headers['Content-Type'] = 'text/html; charset=utf-8'
    return loginPage()
  })
  // Docs-only login: validates admin credentials and sets the HttpOnly cookie
  // the guard checks below. Mirrors gitpersona-server's Set-Cookie approach.
  .post(
    '/openapi/_/login',
    async ({ body, jwt, set }) => {
      const user = await AuthService.validateCredentials(body)
      if (!user) {
        set.status = 401
        return { success: false, message: 'Invalid email or password', data: null }
      }

      const token = await jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      })
      const secure = isProd ? '; Secure' : ''
      set.headers['Set-Cookie'] =
        `adminToken=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${secure}`

      return { success: true, message: 'Login successful', data: null }
    },
    { body: loginBody }
  )
  .onBeforeHandle({ as: 'global' }, async ({ request, headers, jwt, set }) => {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/openapi')) return
    // The gate page and login route must stay reachable to sign in.
    if (url.pathname === '/openapi/_/gate' || url.pathname === '/openapi/_/login') return

    const auth = headers['authorization']
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      if (await jwt.verify(auth.slice(7))) return
    }

    const cookieToken = extractCookieToken(headers['cookie'])
    if (cookieToken && (await jwt.verify(cookieToken))) return

    set.status = 401
    set.headers['Content-Type'] = 'text/html; charset=utf-8'
    return unauthorizedPage()
  })
