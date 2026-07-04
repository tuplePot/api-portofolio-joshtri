import { Elysia } from 'elysia'

const html = /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio API Docs</title>
  <style>
    :root {
      --bg: #0d0f1a;
      --bg-card: #161927;
      --bg-sidebar: #0b0d16;
      --border: #252840;
      --text: #e2e8f0;
      --text-muted: #6b7594;
      --accent: #6366f1;
      --get: #22c55e;
      --post: #3b82f6;
      --patch: #f59e0b;
      --delete: #ef4444;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      min-height: 100vh;
      font-size: 14px;
    }

    /* ── Sidebar ───────────────────────────────────── */
    .sidebar {
      width: 220px;
      flex-shrink: 0;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border);
      position: fixed;
      top: 0; left: 0; bottom: 0;
      overflow-y: auto;
      z-index: 10;
    }
    .sidebar-header {
      padding: 20px 18px 18px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-header h1 { font-size: 15px; font-weight: 700; letter-spacing: -0.01em; }
    .sidebar-header .version { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .sidebar-section-label {
      padding: 16px 18px 6px;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 18px;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      border-left: 2px solid transparent;
      transition: color 0.15s, background 0.15s, border-color 0.15s;
    }
    .sidebar-link:hover { color: var(--text); background: rgba(99,102,241,0.06); }
    .sidebar-link.active { color: var(--text); background: rgba(99,102,241,0.1); border-left-color: var(--accent); }
    .sidebar-link .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: 0.5; }

    /* ── Main ──────────────────────────────────────── */
    .main { margin-left: 220px; flex: 1; padding: 44px 52px; max-width: 860px; }

    .page-header { margin-bottom: 44px; padding-bottom: 28px; border-bottom: 1px solid var(--border); }
    .page-header h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; }
    .page-header p { color: var(--text-muted); line-height: 1.6; }
    .base-url-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 14px;
      background: rgba(99,102,241,0.1);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 6px;
      padding: 5px 12px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      color: #a5b4fc;
    }

    /* ── Response envelope info box ────────────────── */
    .envelope-box {
      background: rgba(99,102,241,0.06);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 36px;
      font-size: 13px;
      line-height: 1.7;
    }
    .envelope-box strong { color: #a5b4fc; }
    .envelope-block {
      margin-top: 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px 14px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      line-height: 1.8;
    }
    .j-key   { color: #93c5fd; }
    .j-bool  { color: #4ade80; }
    .j-str   { color: #fde68a; }
    .j-null  { color: #f87171; }
    .j-punc  { color: #6b7594; }

    /* ── Module section ────────────────────────────── */
    .module { margin-bottom: 52px; }
    .module-header { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
    .module-header h2 { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; }
    .module-prefix {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12px;
      background: rgba(99,102,241,0.12);
      color: #a5b4fc;
      padding: 2px 8px;
      border-radius: 5px;
      border: 1px solid rgba(99,102,241,0.2);
    }
    .module-count {
      font-size: 11px;
      color: var(--text-muted);
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1px 8px;
    }

    /* ── Endpoint card ─────────────────────────────── */
    .endpoint {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 8px;
      overflow: hidden;
      transition: border-color 0.15s;
    }
    .endpoint:hover { border-color: #363a5a; }
    .endpoint.open  { border-color: #363a5a; }

    .endpoint-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 16px;
      cursor: pointer;
      user-select: none;
    }

    .method-badge {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      min-width: 58px;
      text-align: center;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .badge-get    { background: rgba(34,197,94,0.12);  color: #4ade80; }
    .badge-post   { background: rgba(59,130,246,0.12); color: #60a5fa; }
    .badge-patch  { background: rgba(245,158,11,0.12); color: #fbbf24; }
    .badge-delete { background: rgba(239,68,68,0.12);  color: #f87171; }

    .lock-badge {
      font-size: 10px;
      font-weight: 600;
      color: #fbbf24;
      background: rgba(245,158,11,0.1);
      border: 1px solid rgba(245,158,11,0.25);
      border-radius: 4px;
      padding: 2px 6px;
      flex-shrink: 0;
      letter-spacing: 0.04em;
    }

    .endpoint-path { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; flex: 1; }
    .endpoint-path .param { color: #94a3b8; }
    .endpoint-desc { font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
    .chevron { color: var(--text-muted); font-size: 10px; transition: transform 0.2s; flex-shrink: 0; }
    .endpoint.open .chevron { transform: rotate(90deg); }

    /* ── Endpoint body ─────────────────────────────── */
    .endpoint-body { display: none; padding: 14px 16px 16px; border-top: 1px solid var(--border); }
    .endpoint.open .endpoint-body { display: block; }

    .schema-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin-bottom: 8px;
    }
    .schema-label.mt { margin-top: 14px; }

    .schema-block {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 12px 14px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 12.5px;
      line-height: 1.9;
    }
    .f-name     { color: #93c5fd; }
    .f-type     { color: #c4b5fd; }
    .f-enum     { color: #fde68a; }
    .f-required { color: #f87171; font-size: 11px; }
    .f-optional { color: #4b5775; font-size: 11px; }
    .f-sep      { color: #4b5775; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  </style>
</head>
<body>

<nav class="sidebar">
  <div class="sidebar-header">
    <h1>Portfolio API</h1>
    <div class="version">Bun · ElysiaJS · MongoDB</div>
  </div>
  <div class="sidebar-section-label">Auth</div>
  <a href="#auth" class="sidebar-link"><span class="dot"></span>Authentication</a>
  <div class="sidebar-section-label">Modules</div>
  <a href="#skills" class="sidebar-link"><span class="dot"></span>Skills</a>
  <a href="#projects" class="sidebar-link"><span class="dot"></span>Projects</a>
  <a href="#work-experiences" class="sidebar-link"><span class="dot"></span>Work Experiences</a>
  <a href="#educations" class="sidebar-link"><span class="dot"></span>Education</a>
</nav>

<main class="main">

  <div class="page-header">
    <h1>API Documentation</h1>
    <p>Portfolio REST API — full CRUD for skills, projects, work experiences, and education.</p>
    <div class="base-url-chip">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      http://localhost:3000
    </div>
  </div>

  <!-- Response envelope info -->
  <div class="envelope-box">
    <strong>Standard Response Envelope</strong> — semua endpoint mengembalikan format yang sama.
    <div class="envelope-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span> <span class="j-punc">|</span> <span class="j-bool">false</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"..."</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{}</span> <span class="j-punc">|</span> <span class="j-punc">[]</span> <span class="j-punc">|</span> <span class="j-null">null</span>
<span class="j-punc">}</span>
    </div>
  </div>

  <!-- ─── AUTH ──────────────────────────────────────────── -->
  <section class="module" id="auth">
    <div class="module-header">
      <h2>Authentication</h2>
      <span class="module-prefix">/api/auth</span>
    </div>

    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:14px 16px;margin-bottom:18px;font-size:13px;line-height:1.7;color:#94a3b8;">
      Endpoint <span class="lock-badge">JWT</span> pada setiap module membutuhkan header:<br/>
      <code style="font-family:monospace;color:#a5b4fc;font-size:12px;">Authorization: Bearer &lt;token&gt;</code><br/>
      Token diperoleh dari <strong style="color:var(--text)">POST /api/auth/login</strong> di bawah.
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-post">POST</span>
        <span class="endpoint-path">/api/auth/login</span>
        <span class="endpoint-desc">Login &amp; get JWT token</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Request Body</div>
        <div class="schema-block">
<span class="f-name">email</span><span class="f-sep">:     </span><span class="f-type">string</span>  <span class="f-required">required</span>  <span class="f-optional">format: email</span>
<span class="f-name">password</span><span class="f-sep">:  </span><span class="f-type">string</span>  <span class="f-required">required</span>  <span class="f-optional">min 6 chars</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Login successful"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:    {</span> <span class="j-key">"token"</span><span class="j-punc">:</span> <span class="j-str">"eyJ..."</span> <span class="j-punc">}</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── SKILLS ──────────────────────────────────────── -->
  <section class="module" id="skills">
    <div class="module-header">
      <h2>Skills</h2>
      <span class="module-prefix">/api/skills</span>
      <span class="module-count">5 endpoints</span>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/skills</span>
        <span class="endpoint-desc">List all skills</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Skills fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">[ Skill, ... ]</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/skills/<span class="param">:id</span></span>
        <span class="endpoint-desc">Get skill by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Skill fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Skill }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-post">POST</span>
        <span class="endpoint-path">/api/skills</span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Create a skill</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Request Body</div>
        <div class="schema-block">
<span class="f-name">name</span><span class="f-sep">:        </span><span class="f-type">string</span>                                    <span class="f-required">required</span>
<span class="f-name">icon</span><span class="f-sep">:        </span><span class="f-type">string</span>                                    <span class="f-required">required</span>
<span class="f-name">color</span><span class="f-sep">:       </span><span class="f-type">string</span>                                    <span class="f-required">required</span>
<span class="f-name">category</span><span class="f-sep">:    </span><span class="f-enum">LANGUAGE | FRAMEWORK | DATABASE | TOOL | LIBRARY | ORM</span>    <span class="f-required">required</span>
<span class="f-name">projectIds</span><span class="f-sep">:  </span><span class="f-type">string[]</span>                                  <span class="f-optional">optional</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Skill created successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Skill }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/skills/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Update skill by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Request Body <span style="font-weight:400;color:var(--text-muted)">(all optional)</span></div>
        <div class="schema-block">
<span class="f-name">name</span><span class="f-sep">:        </span><span class="f-type">string</span>
<span class="f-name">icon</span><span class="f-sep">:        </span><span class="f-type">string</span>
<span class="f-name">color</span><span class="f-sep">:       </span><span class="f-type">string</span>
<span class="f-name">category</span><span class="f-sep">:    </span><span class="f-enum">LANGUAGE | FRAMEWORK | DATABASE | TOOL | LIBRARY | ORM</span>
<span class="f-name">projectIds</span><span class="f-sep">:  </span><span class="f-type">string[]</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Skill updated successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Skill }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-delete">DELETE</span>
        <span class="endpoint-path">/api/skills/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Delete skill by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Skill deleted successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ deletedSkill }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── PROJECTS ──────────────────────────────────── -->
  <section class="module" id="projects">
    <div class="module-header">
      <h2>Projects</h2>
      <span class="module-prefix">/api/projects</span>
      <span class="module-count">5 endpoints</span>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/projects</span>
        <span class="endpoint-desc">List all projects</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Projects fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">[ Project, ... ]</span>  <span class="f-optional">// skillIds populated</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/projects/<span class="param">:id</span></span>
        <span class="endpoint-desc">Get project by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Project fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Project }</span>  <span class="f-optional">// skillIds populated</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-post">POST</span>
        <span class="endpoint-path">/api/projects</span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Create a project</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Request Body</div>
        <div class="schema-block">
<span class="f-name">title</span><span class="f-sep">:        </span><span class="f-type">string</span>    <span class="f-required">required</span>
<span class="f-name">description</span><span class="f-sep">:  </span><span class="f-type">string</span>    <span class="f-optional">optional</span>
<span class="f-name">skillIds</span><span class="f-sep">:    </span><span class="f-type">string[]</span>  <span class="f-optional">optional</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Project created successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Project }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/projects/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Update project by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Request Body <span style="font-weight:400;color:var(--text-muted)">(all optional)</span></div>
        <div class="schema-block">
<span class="f-name">title</span><span class="f-sep">:        </span><span class="f-type">string</span>
<span class="f-name">description</span><span class="f-sep">:  </span><span class="f-type">string</span>
<span class="f-name">skillIds</span><span class="f-sep">:    </span><span class="f-type">string[]</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Project updated successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Project }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-delete">DELETE</span>
        <span class="endpoint-path">/api/projects/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Delete project by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Project deleted successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ deletedProject }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── WORK EXPERIENCES ──────────────────────────── -->
  <section class="module" id="work-experiences">
    <div class="module-header">
      <h2>Work Experiences</h2>
      <span class="module-prefix">/api/work-experiences</span>
      <span class="module-count">5 endpoints</span>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/work-experiences</span>
        <span class="endpoint-desc">List all (sorted by startDate desc)</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Work experiences fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">[ WorkExperience, ... ]</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/work-experiences/<span class="param">:id</span></span>
        <span class="endpoint-desc">Get work experience by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Work experience fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ WorkExperience }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-post">POST</span>
        <span class="endpoint-path">/api/work-experiences</span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Create a work experience</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Request Body</div>
        <div class="schema-block">
<span class="f-name">role</span><span class="f-sep">:         </span><span class="f-type">string</span>    <span class="f-required">required</span>
<span class="f-name">company</span><span class="f-sep">:      </span><span class="f-type">string</span>    <span class="f-required">required</span>
<span class="f-name">description</span><span class="f-sep">:  </span><span class="f-type">string</span>    <span class="f-required">required</span>
<span class="f-name">startDate</span><span class="f-sep">:    </span><span class="f-type">string</span>    <span class="f-required">required</span>  <span class="f-optional">ISO 8601 date-time</span>
<span class="f-name">companyUrl</span><span class="f-sep">:   </span><span class="f-type">string</span>    <span class="f-optional">optional</span>
<span class="f-name">endDate</span><span class="f-sep">:      </span><span class="f-type">string</span>    <span class="f-optional">optional  ISO 8601 date-time</span>
<span class="f-name">current</span><span class="f-sep">:      </span><span class="f-type">boolean</span>   <span class="f-optional">optional  default: false</span>
<span class="f-name">tags</span><span class="f-sep">:         </span><span class="f-type">string[]</span>  <span class="f-optional">optional</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Work experience created successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ WorkExperience }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/work-experiences/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Update work experience by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Request Body <span style="font-weight:400;color:var(--text-muted)">(all optional)</span></div>
        <div class="schema-block">
<span class="f-name">role</span><span class="f-sep">:         </span><span class="f-type">string</span>
<span class="f-name">company</span><span class="f-sep">:      </span><span class="f-type">string</span>
<span class="f-name">description</span><span class="f-sep">:  </span><span class="f-type">string</span>
<span class="f-name">startDate</span><span class="f-sep">:    </span><span class="f-type">string</span>   <span class="f-optional">ISO 8601 date-time</span>
<span class="f-name">companyUrl</span><span class="f-sep">:   </span><span class="f-type">string</span>
<span class="f-name">endDate</span><span class="f-sep">:      </span><span class="f-type">string</span>   <span class="f-optional">ISO 8601 date-time</span>
<span class="f-name">current</span><span class="f-sep">:      </span><span class="f-type">boolean</span>
<span class="f-name">tags</span><span class="f-sep">:         </span><span class="f-type">string[]</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Work experience updated successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ WorkExperience }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-delete">DELETE</span>
        <span class="endpoint-path">/api/work-experiences/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Delete work experience by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Work experience deleted successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ deletedWorkExperience }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ─── EDUCATION ─────────────────────────────────── -->
  <section class="module" id="educations">
    <div class="module-header">
      <h2>Education</h2>
      <span class="module-prefix">/api/educations</span>
      <span class="module-count">5 endpoints</span>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/educations</span>
        <span class="endpoint-desc">List all (sorted by startYear desc)</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Education entries fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">[ Education, ... ]</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-get">GET</span>
        <span class="endpoint-path">/api/educations/<span class="param">:id</span></span>
        <span class="endpoint-desc">Get education by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Education fetched successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Education }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-post">POST</span>
        <span class="endpoint-path">/api/educations</span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Create an education entry</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Request Body</div>
        <div class="schema-block">
<span class="f-name">degree</span><span class="f-sep">:       </span><span class="f-type">string</span>   <span class="f-required">required</span>
<span class="f-name">school</span><span class="f-sep">:       </span><span class="f-type">string</span>   <span class="f-required">required</span>
<span class="f-name">startYear</span><span class="f-sep">:    </span><span class="f-type">number</span>   <span class="f-required">required</span>
<span class="f-name">description</span><span class="f-sep">:  </span><span class="f-type">string</span>   <span class="f-required">required</span>
<span class="f-name">endYear</span><span class="f-sep">:      </span><span class="f-type">number</span>   <span class="f-optional">optional  null = ongoing</span>
<span class="f-name">gpa</span><span class="f-sep">:          </span><span class="f-type">string</span>   <span class="f-optional">optional</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Education created successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Education }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-patch">PATCH</span>
        <span class="endpoint-path">/api/educations/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Update education by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Request Body <span style="font-weight:400;color:var(--text-muted)">(all optional)</span></div>
        <div class="schema-block">
<span class="f-name">degree</span><span class="f-sep">:       </span><span class="f-type">string</span>
<span class="f-name">school</span><span class="f-sep">:       </span><span class="f-type">string</span>
<span class="f-name">startYear</span><span class="f-sep">:    </span><span class="f-type">number</span>
<span class="f-name">description</span><span class="f-sep">:  </span><span class="f-type">string</span>
<span class="f-name">endYear</span><span class="f-sep">:      </span><span class="f-type">number</span>
<span class="f-name">gpa</span><span class="f-sep">:          </span><span class="f-type">string</span>
        </div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Education updated successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ Education }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>

    <div class="endpoint" onclick="toggle(this)">
      <div class="endpoint-header">
        <span class="method-badge badge-delete">DELETE</span>
        <span class="endpoint-path">/api/educations/<span class="param">:id</span></span>
        <span class="lock-badge">JWT</span>
        <span class="endpoint-desc">Delete education by ID</span>
        <span class="chevron">▶</span>
      </div>
      <div class="endpoint-body">
        <div class="schema-label">Path Params</div>
        <div class="schema-block"><span class="f-name">id</span><span class="f-sep">: </span><span class="f-type">string</span>  <span class="f-required">required</span></div>
        <div class="schema-label mt">Response 200</div>
        <div class="schema-block">
<span class="j-punc">{</span>
  <span class="j-key">"success"</span><span class="j-punc">:</span> <span class="j-bool">true</span><span class="j-punc">,</span>
  <span class="j-key">"message"</span><span class="j-punc">:</span> <span class="j-str">"Education deleted successfully"</span><span class="j-punc">,</span>
  <span class="j-key">"data"</span><span class="j-punc">:</span>    <span class="j-punc">{ deletedEducation }</span>
<span class="j-punc">}</span>
        </div>
      </div>
    </div>
  </section>

</main>

<script>
  function toggle(el) {
    el.classList.toggle('open')
  }

  const links = document.querySelectorAll('.sidebar-link')
  const sections = document.querySelectorAll('.module')

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      links.forEach(l => l.classList.remove('active'))
      const link = document.querySelector('.sidebar-link[href="#' + e.target.id + '"]')
      if (link) link.classList.add('active')
    })
  }, { rootMargin: '-30% 0px -60% 0px' })

  sections.forEach(s => io.observe(s))
</script>
</body>
</html>`

export const docsModule = new Elysia()
  .get('/docs', () => new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  }))
