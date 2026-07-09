import { matchIntent } from './intent.service'
import { PortfolioService } from './portfolio.service'
import { PortfolioRepository } from './portfolio.repository'
import { chat, checkConnection } from './openrouter.client'
import {
  buildMessages,
  fmtProject,
  fmtProjectBrief,
  fmtSkills,
  fmtExperience,
  fmtEducation,
  fmtTimeline,
} from './prompt.builder'
import { pick, normalize } from './utils'
import { Intent } from './types'
import type { AskResult, AskSource, ProjectView, IntentResult } from './types'

function toSources(projects: ProjectView[]): AskSource[] {
  return projects.map((p) => ({
    id: String(p._id),
    title: pick(p.title),
    type: p.type,
  }))
}

// Find a skill/tech name that literally appears in the question, so a generic
// "projects" question with a technology in it routes to SEARCH_BY_TECH.
async function detectTech(question: string): Promise<string | undefined> {
  const q = normalize(question)
  const skills = await PortfolioRepository.getSkills()
  const hit = skills.find((s) => q.includes(normalize(s.name)))
  return hit?.name
}

interface Built {
  context: string
  sources: AskSource[]
  intent: Intent
}

/**
 * AI orchestrator. Flow per question:
 *   matchIntent → (DB-backed entity resolution) → portfolio service →
 *   structured context → 1 LLM call → answer.
 * The LLM never touches the database; it only reasons over the built context.
 */
export abstract class AiService {
  static async ask(question: string): Promise<AskResult> {
    const detected = matchIntent(question)
    const { context, sources, intent } = await AiService.buildContext(detected)
    const answer = await chat(buildMessages(context, question))
    return { answer, intent, sources }
  }

  static checkConnection = checkConnection

  // Build the structured context + sources for a detected intent. Returns the
  // (possibly refined) intent actually used.
  private static async buildContext(detected: IntentResult): Promise<Built> {
    const { question, projectType, category } = detected
    let intent = detected.intent

    switch (intent) {
      case Intent.COMPARE_PROJECTS: {
        const projects = await PortfolioService.compareProjects(question)
        return {
          intent,
          sources: toSources(projects),
          context: projects.length
            ? projects.map(fmtProject).join('\n\n')
            : '',
        }
      }

      case Intent.RELATED_PROJECTS: {
        // Specific project named → show its links. Otherwise list every project
        // that has related work so the visitor sees the relationship graph.
        const { project, related } = await PortfolioService.getRelatedProjects(question)
        if (project) {
          const context = `${fmtProject(project)}\n\nRelated projects:\n${
            related.map((r) => `- ${pick(r.title)}${r.type ? ` [${r.type}]` : ''}`).join('\n') || '(none linked)'
          }`
          return { intent, context, sources: toSources([project]) }
        }
        const all = await PortfolioService.searchProjects()
        const linked = all.filter((p) => (p.relatedProjectIds?.length ?? 0) > 0)
        return {
          intent,
          sources: toSources(linked),
          context: linked.length
            ? linked
                .map((p) => `${pick(p.title)} → ${p.relatedProjectIds.map((r) => pick(r.title)).join(', ')}`)
                .join('\n')
            : 'No projects have related links defined.',
        }
      }

      case Intent.STRONGEST_PROJECT: {
        const project = await PortfolioService.strongestProject(projectType)
        return {
          intent,
          context: project ? fmtProject(project) : '',
          sources: project ? toSources([project]) : [],
        }
      }

      case Intent.TECH_FREQUENCY: {
        const freq = await PortfolioService.techFrequency()
        return {
          intent,
          sources: [],
          context: freq.map((f) => `- ${f.name} (${f.category}): used in ${f.count} project(s)`).join('\n'),
        }
      }

      case Intent.RECOMMEND_TECH: {
        const [freq, skills] = await Promise.all([
          PortfolioService.techFrequency(),
          PortfolioService.getSkills(),
        ])
        return {
          intent,
          sources: [],
          context: `Skills Josh works with:\n${fmtSkills(skills)}\n\nMost-used technologies:\n${freq
            .slice(0, 8)
            .map((f) => `- ${f.name} (${f.count} projects)`)
            .join('\n')}`,
        }
      }

      case Intent.LIST_SKILLS: {
        const skills = await PortfolioService.getSkills(category)
        return { intent, sources: [], context: fmtSkills(skills) }
      }

      case Intent.EXPERIENCE: {
        const [experience, education] = await Promise.all([
          PortfolioService.getExperience(),
          PortfolioRepository.getEducation(),
        ])
        return {
          intent,
          sources: [],
          context: `Work experience:\n${experience.map(fmtExperience).join('\n')}\n\nEducation:\n${education
            .map(fmtEducation)
            .join('\n')}`,
        }
      }

      case Intent.TIMELINE: {
        const items = await PortfolioService.generateTimeline()
        return { intent, sources: [], context: fmtTimeline(items) }
      }

      case Intent.ARCHITECTURE: {
        // Prefer a specific project if one is named; else describe the portfolio's stack.
        const project = await PortfolioService.getProject(question)
        if (project) {
          intent = Intent.GET_PROJECT
          return { intent, context: fmtProject(project), sources: toSources([project]) }
        }
        const { projects, skills } = await PortfolioService.summarizePortfolio()
        return {
          intent,
          sources: toSources(projects),
          context: `Projects and their stacks:\n${projects.map(fmtProject).join('\n\n')}\n\nSkill set:\n${fmtSkills(skills)}`,
        }
      }

      case Intent.ABOUT:
      case Intent.SUMMARIZE:
      case Intent.FALLBACK: {
        const { projects, skills, experience, education, byType, byCategory } =
          await PortfolioService.summarizePortfolio()
        const topProjects = [...projects]
          .sort((a, b) => (b.skillIds?.length ?? 0) - (a.skillIds?.length ?? 0))
          .slice(0, 5)
        const context = [
          `Project counts by type: ${JSON.stringify(byType)}`,
          `Skill counts by category: ${JSON.stringify(byCategory)}`,
          `Notable projects:\n${topProjects.map(fmtProjectBrief).join('\n')}`,
          `Skills:\n${fmtSkills(skills)}`,
          experience.length ? `Experience:\n${experience.map(fmtExperience).join('\n')}` : '',
          education.length ? `Education:\n${education.map(fmtEducation).join('\n')}` : '',
        ]
          .filter(Boolean)
          .join('\n\n')
        return { intent, context, sources: toSources(topProjects) }
      }

      // SEARCH_PROJECTS + entity resolution (tech → SEARCH_BY_TECH, title → GET_PROJECT)
      case Intent.SEARCH_PROJECTS:
      default: {
        const tech = await detectTech(question)
        if (tech) {
          intent = Intent.SEARCH_BY_TECH
          const projects = await PortfolioService.searchByTechnology(tech, projectType)
          return {
            intent,
            sources: toSources(projects),
            context: projects.length
              ? `Projects using ${tech}${projectType ? ` (${projectType})` : ''}:\n${projects.map(fmtProject).join('\n\n')}`
              : `No projects use ${tech}.`,
          }
        }

        const single = await PortfolioService.getProject(question)
        if (single) {
          intent = Intent.GET_PROJECT
          return { intent, context: fmtProject(single), sources: toSources([single]) }
        }

        const projects = await PortfolioService.searchProjects(projectType)
        return {
          intent,
          sources: toSources(projects),
          context: projects.length
            ? projects.map(fmtProject).join('\n\n')
            : projectType
              ? `No ${projectType} projects found.`
              : '',
        }
      }
    }
  }
}
