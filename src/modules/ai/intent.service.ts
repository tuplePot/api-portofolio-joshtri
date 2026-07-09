import { normalize } from './utils'
import { Intent } from './types'
import type { IntentResult, ProjectTypeFilter, SkillCategory } from './types'

function detectProjectType(q: string): ProjectTypeFilter | undefined {
  if (/full[\s-]?stack/.test(q)) return 'FULLSTACK'
  if (/front[\s-]?end/.test(q)) return 'FRONTEND'
  if (/back[\s-]?end/.test(q)) return 'BACKEND'
  return undefined
}

function detectCategory(q: string): SkillCategory | undefined {
  if (/\borm\b/.test(q)) return 'ORM'
  if (/database|db\b|basis data/.test(q)) return 'DATABASE'
  if (/framework/.test(q)) return 'FRAMEWORK'
  if (/librar/.test(q)) return 'LIBRARY'
  if (/language|bahasa (pemrograman|program)/.test(q)) return 'LANGUAGE'
  if (/\btool(s|ing)?\b|perkakas/.test(q)) return 'TOOL'
  return undefined
}

// Priority-ordered rules (specific → general). The first match wins, so more
// specific intents must come before broader ones like SEARCH_PROJECTS.
const RULES: Array<{ intent: Intent; re: RegExp }> = [
  { intent: Intent.COMPARE_PROJECTS, re: /\bcompare\b|\bvs\b|\bversus\b|banding/ },
  { intent: Intent.ARCHITECTURE, re: /architect|arsitektur|design decision|(backend|frontend) decision|how (is|was|are) .*(built|structured)|struktur (kode|proyek|aplikasi)/ },
  { intent: Intent.SUMMARIZE, re: /summar|ringkas|overview|portfolio.*(summary|glance)/ },
  { intent: Intent.TIMELINE, re: /journey|timeline|perjalanan|career path|development journey/ },
  { intent: Intent.RECOMMEND_TECH, re: /recommend|should i learn|worth learning|belajar apa|rekomendasi/ },
  { intent: Intent.TECH_FREQUENCY, re: /most (often|used|common)|paling sering|which tech(nolog\w*)?.*most|teknologi.*paling/ },
  { intent: Intent.STRONGEST_PROJECT, re: /strongest|best project|most proud|proud of|paling (bagus|kuat|bangga|hebat)|andalan/ },
  { intent: Intent.RELATED_PROJECTS, re: /related|terkait|connected|berhubungan|linked project/ },
  { intent: Intent.EXPERIENCE, re: /experience|pengalaman|work(ed|ing)?\b|magang|intern|pekerjaan|riwayat kerja/ },
  { intent: Intent.ABOUT, re: /(who is|who are you|tell me about|about)\s+(josh|you|him)|siapa\s+(josh|kamu|dia)|ceritakan tentang josh|kenalkan/ },
  { intent: Intent.LIST_SKILLS, re: /\bframeworks?\b|\blanguages?\b|\borms?\b|\blibrar(y|ies)\b|\bskills?\b|\btools?\b|\bdatabases?\b|\btech stack\b|what (tech|technolog\w*)|which (framework|language|tool|database)|teknologi apa|framework apa|bahasa (pemrograman )?apa|list .*skill/ },
  { intent: Intent.SEARCH_PROJECTS, re: /project|proyek|portfolio|\bshow\b|\blist\b|explain|jelaskan|apa saja/ },
]

/**
 * Rule-based intent detection. Pure and synchronous — no LLM call, no DB. The
 * orchestrator refines the result with DB-backed entity resolution (e.g. does a
 * real project title or skill name appear in the question).
 */
export function matchIntent(question: string): IntentResult {
  const q = normalize(question)
  const projectType = detectProjectType(q)
  const category = detectCategory(q)

  const match = RULES.find((r) => r.re.test(q))
  return {
    intent: match?.intent ?? Intent.FALLBACK,
    projectType,
    category,
    question,
  }
}
