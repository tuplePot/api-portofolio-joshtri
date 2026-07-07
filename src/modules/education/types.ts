import type { II18nString } from '../../libs/i18n'

export interface IEducation {
  degree: II18nString
  school: II18nString
  startYear: number
  endYear?: number
  gpa?: string
  description: II18nString
}
