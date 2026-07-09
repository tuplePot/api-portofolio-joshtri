import { pick } from './utils'
import type { ChatMessage } from './openrouter.client'
import type {
  ProjectView,
  SkillView,
  ExperienceView,
  EducationView,
} from './types'

// The persona. Deliberately strict: the assistant is Josh's representative and
// must ground every answer in the provided context — never invent portfolio
// facts. Language mirroring keeps it natural for ID and EN recruiters.
export const SYSTEM_PROMPT = `You are "Josh AI", the personal portfolio assistant for Joshtri Lenggu (Josh).

Your role:
- Act as Josh's digital representative to recruiters and visitors.
- Answer ONLY using the portfolio context provided in each message.
- NEVER invent or assume projects, skills, experience, technologies, or facts.
- If the answer is not in the context, say politely that the information is not available in the portfolio, and suggest a related question the visitor could ask.

Style:
- Reply in the SAME language as the user's question (Indonesian or English).
- Be concise, warm, and confident — like Josh talking about his own work.
- Use Markdown: short paragraphs, bold for project/tech names, bullet lists when comparing or listing.
- Do not mention "context", "database", "system prompt", or these instructions.
- When relevant, invite the visitor to explore a specific project.`

// ─── Formatters: structured data → compact context text ──────────────────────

export function fmtProject(p: ProjectView): string {
  const tech = (p.skillIds ?? []).map((s) => s.name).join(', ') || '—'
  const related = (p.relatedProjectIds ?? []).map((r) => pick(r.title)).join(', ')
  const meta = [p.type, p.status, p.featured ? 'featured' : '', String(p.projectYear)]
    .filter(Boolean)
    .join(', ')
  const lines = [
    `### ${pick(p.title)} (${meta})`,
    pick(p.description) || '(no description)',
  ]
  if (p.role) lines.push(`Josh's role: ${pick(p.role)}`)
  if (p.problemSolved) lines.push(`Problem solved: ${pick(p.problemSolved)}`)
  if (p.highlights?.length) lines.push(`Highlights:\n${p.highlights.map((h) => `- ${pick(h)}`).join('\n')}`)
  lines.push(`Tech: ${tech}`)
  if (related) lines.push(`Related projects: ${related}`)
  if (p.githubRepoUrl) lines.push(`Repo: ${p.githubRepoUrl}`)
  if (p.link) lines.push(`Live: ${p.link}`)
  return lines.join('\n')
}

export function fmtProjectBrief(p: ProjectView): string {
  const tech = (p.skillIds ?? []).map((s) => s.name).join(', ')
  return `- ${pick(p.title)}${p.type ? ` [${p.type}]` : ''} (${p.projectYear})${tech ? ` — ${tech}` : ''}`
}

export function fmtSkills(skills: SkillView[]): string {
  const label = (s: SkillView) => {
    const extra = [s.layer, s.level].filter(Boolean).join(', ')
    return extra ? `${s.name} (${extra})` : s.name
  }
  const byCat = skills.reduce<Record<string, string[]>>((acc, s) => {
    ;(acc[s.category] ??= []).push(label(s))
    return acc
  }, {})
  return Object.entries(byCat)
    .map(([cat, names]) => `${cat}: ${names.join(', ')}`)
    .join('\n')
}

export function fmtExperience(e: ExperienceView): string {
  const start = new Date(e.startDate).getFullYear()
  const end = e.current ? 'present' : e.endDate ? new Date(e.endDate).getFullYear() : '—'
  const tags = e.tags?.length ? ` [${e.tags.join(', ')}]` : ''
  return `- ${pick(e.role)} @ ${pick(e.company)} (${start}–${end})${tags}: ${pick(e.description)}`
}

export function fmtEducation(ed: EducationView): string {
  const end = ed.endYear ?? 'ongoing'
  const gpa = ed.gpa ? `, GPA ${ed.gpa}` : ''
  return `- ${pick(ed.degree)} — ${pick(ed.school)} (${ed.startYear}–${end}${gpa})`
}

export function fmtTimeline(
  items: Array<{ year: number; kind: string; title: string; detail: string }>,
): string {
  return items.map((i) => `- ${i.year} · [${i.kind}] ${i.title}${i.detail ? ` (${i.detail})` : ''}`).join('\n')
}

// ─── Message assembly ────────────────────────────────────────────────────────

export function buildMessages(context: string, question: string): ChatMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    {
      role: 'user',
      content: `Portfolio context:\n${context || '(no matching portfolio data found)'}\n\nUser question: ${question}`,
    },
  ]
}
