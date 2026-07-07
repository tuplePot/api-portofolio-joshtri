import type { II18nString } from '../../libs/i18n'

export interface IKeyProject {
  title: II18nString
  description: II18nString
}

export interface IWorkExperience {
  role: II18nString
  company: II18nString
  companyUrl?: string
  startDate: Date
  endDate?: Date
  current: boolean
  description: II18nString
  keyProjects?: IKeyProject[]
  tags: string[]
}
