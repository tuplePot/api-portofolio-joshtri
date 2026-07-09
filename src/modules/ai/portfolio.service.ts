import { PortfolioRepository } from './portfolio.repository'
import { pick, normalize } from './utils'
import type {
  ProjectView,
  SkillView,
  ProjectTypeFilter,
  SkillCategory,
} from './types'

// ─── Matching helpers ────────────────────────────────────────────────────────

// Score how strongly a project title appears in the question (0–100).
function titleScore(p: ProjectView, question: string): number {
  const q = normalize(question)
  const title = normalize(pick(p.title))
  if (!title) return 0
  if (q.includes(title)) return 100 // full title present verbatim
  const tokens = title.split(' ').filter((w) => w.length > 2)
  if (!tokens.length) return 0
  const hits = tokens.filter((w) => q.includes(w)).length
  return (hits / tokens.length) * 100
}

function projectUsesTech(p: ProjectView, tech: string): boolean {
  const t = normalize(tech)
  return (p.skillIds ?? []).some((s) => normalize(s.name).includes(t))
}

/**
 * Portfolio service — business logic over portfolio data. Every function
 * returns plain structured data; turning it into LLM context or API `sources`
 * is the caller's job (prompt.builder / ai.service). Reusable and testable.
 */
export abstract class PortfolioService {
  static async searchProjects(type?: ProjectTypeFilter): Promise<ProjectView[]> {
    const projects = await PortfolioRepository.getProjects()
    return type ? projects.filter((p) => p.type === type) : projects
  }

  /** Best single-project match for the question, or null if none is confident. */
  static async getProject(question: string): Promise<ProjectView | null> {
    const projects = await PortfolioRepository.getProjects()
    const ranked = projects
      .map((p) => ({ p, score: titleScore(p, question) }))
      .sort((a, b) => b.score - a.score)
    const top = ranked[0]
    return top && top.score >= 50 ? top.p : null
  }

  /** Top two projects referenced in the question (for "compare A and B"). */
  static async compareProjects(question: string): Promise<ProjectView[]> {
    const projects = await PortfolioRepository.getProjects()
    return projects
      .map((p) => ({ p, score: titleScore(p, question) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((x) => x.p)
  }

  static async getSkills(category?: SkillCategory): Promise<SkillView[]> {
    const skills = await PortfolioRepository.getSkills()
    return category ? skills.filter((s) => s.category === category) : skills
  }

  static async getRelatedProjects(question: string): Promise<{
    project: ProjectView | null
    related: ProjectView['relatedProjectIds']
  }> {
    const project = await PortfolioService.getProject(question)
    return { project, related: project?.relatedProjectIds ?? [] }
  }

  static async searchByTechnology(
    tech: string,
    type?: ProjectTypeFilter,
  ): Promise<ProjectView[]> {
    const projects = await PortfolioRepository.getProjects()
    return projects.filter(
      (p) => projectUsesTech(p, tech) && (!type || p.type === type),
    )
  }

  /** Count how often each skill is used across projects, most-used first. */
  static async techFrequency(): Promise<
    Array<{ name: string; category: SkillCategory; count: number }>
  > {
    const projects = await PortfolioRepository.getProjects()
    const counts = new Map<string, { category: SkillCategory; count: number }>()
    for (const p of projects) {
      for (const s of p.skillIds ?? []) {
        const key = s.name
        const cur = counts.get(key)
        if (cur) cur.count += 1
        else counts.set(key, { category: s.category, count: 1 })
      }
    }
    return [...counts.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Heuristic "strongest" project: richer projects (more skills, more related
   * work, live link + repo) rank higher. Optionally scoped to a type.
   */
  static async strongestProject(type?: ProjectTypeFilter): Promise<ProjectView | null> {
    const projects = await PortfolioService.searchProjects(type)
    if (!projects.length) return null
    const score = (p: ProjectView) =>
      (p.featured ? 100 : 0) + // explicit signal wins over the heuristic
      (p.highlights?.length ?? 0) * 3 +
      (p.skillIds?.length ?? 0) * 2 +
      (p.relatedProjectIds?.length ?? 0) +
      (p.githubRepoUrl ? 1 : 0) +
      (p.link ? 1 : 0)
    return [...projects].sort((a, b) => score(b) - score(a))[0]
  }

  /** Everything needed to introduce Josh: experience, education, top projects, skill mix. */
  static async summarizePortfolio() {
    const [projects, skills, experience, education] = await Promise.all([
      PortfolioRepository.getProjects(),
      PortfolioRepository.getSkills(),
      PortfolioRepository.getExperience(),
      PortfolioRepository.getEducation(),
    ])
    const byCategory = skills.reduce<Record<string, number>>((acc, s) => {
      acc[s.category] = (acc[s.category] ?? 0) + 1
      return acc
    }, {})
    const byType = projects.reduce<Record<string, number>>((acc, p) => {
      const k = p.type ?? 'UNSPECIFIED'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {})
    return { projects, skills, experience, education, byCategory, byType }
  }

  /** Chronological journey: projects (by year) + experience + education combined. */
  static async generateTimeline() {
    const [projects, experience, education] = await Promise.all([
      PortfolioRepository.getProjects(),
      PortfolioRepository.getExperience(),
      PortfolioRepository.getEducation(),
    ])
    const items = [
      ...projects.map((p) => ({
        year: p.projectYear,
        kind: 'project' as const,
        title: pick(p.title),
        detail: p.type ?? '',
      })),
      ...experience.map((e) => ({
        year: new Date(e.startDate).getFullYear(),
        kind: 'experience' as const,
        title: `${pick(e.role)} @ ${pick(e.company)}`,
        detail: e.current ? 'present' : String(e.endDate ? new Date(e.endDate).getFullYear() : ''),
      })),
      ...education.map((ed) => ({
        year: ed.startYear,
        kind: 'education' as const,
        title: `${pick(ed.degree)} — ${pick(ed.school)}`,
        detail: String(ed.endYear ?? 'ongoing'),
      })),
    ].sort((a, b) => a.year - b.year)
    return items
  }

  static async getExperience() {
    return PortfolioRepository.getExperience()
  }
}
