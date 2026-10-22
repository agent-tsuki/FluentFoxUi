/**
 * Domain types for the public Classes pages (`/classes`, `/classes/:slug`).
 * The API shapes (snake_case) live in `@/types/api`; `classesService` maps them here.
 */
import type { JlptLevel } from '@/types'

export type ClassPlatform = 'youtube' | 'udemy' | 'website'

/** The channel as shown on a course card. */
export interface ClassChannelSummary {
  slug:            string
  name:            string
  avatarUrl:       string | null
  /** `#RRGGBB` or null; validated before it is used as a colour. */
  accentColor:     string | null
  subscriberCount: number | null
}

export interface ClassCourseCard {
  slug:             string
  title:            string
  summary:          string
  level:            JlptLevel
  platform:         ClassPlatform
  isFree:           boolean
  isFeatured:       boolean
  thumbnailUrl:     string | null
  videoCount:       number
  totalDurationSec: number
  tags:             string[]
  channel:          ClassChannelSummary
}

export interface ClassLevelAvailability {
  level:  JlptLevel
  count:  number
  /** No visible course at this level yet ("coming soon"); computed by the API. */
  locked: boolean
}

export interface ClassesStats {
  courseCount:  number
  channelCount: number
}

export interface ClassesMeta {
  levels: ClassLevelAvailability[]
  stats:  ClassesStats
}

export interface ClassesList {
  items: ClassCourseCard[]
  meta:  ClassesMeta
}

/** Filters for `GET /classes`; omitted fields are not filtered. */
export interface ClassesFilters {
  level?:    JlptLevel
  platform?: ClassPlatform
  /** true = free courses only. */
  freeOnly?: boolean
}

export interface ClassVideo {
  youtubeVideoId: string
  title:          string
  thumbnailUrl:   string | null
  durationSec:    number
  position:       number
}

export interface ClassCurriculumSection {
  title:  string
  topics: string[]
}

/** Channel introduction shown on the course page. Display fields are already "custom ?? YouTube". */
export interface ClassChannelProfile {
  slug:             string
  name:             string
  platform:         ClassPlatform
  url:              string
  handle:           string | null
  youtubeChannelId: string | null
  avatarUrl:        string | null
  bannerUrl:        string | null
  description:      string
  introVideoId:     string | null
  subscriberCount:  number | null
  videoCount:       number | null
  accentColor:      string | null
  teachingStyle:    string
  bestFor:          string[]
  notFor:           string[]
  pros:             string[]
  cons:             string[]
  verdict:          string
}

export interface ClassCourseDetail {
  slug:             string
  title:            string
  summary:          string
  level:            JlptLevel
  platform:         ClassPlatform
  url:              string
  playlistId:       string | null
  isFree:           boolean
  priceNote:        string
  thumbnailUrl:     string | null
  tags:             string[]
  whatYouLearn:     string[]
  curriculum:       ClassCurriculumSection[]
  totalDurationSec: number
  /** ISO timestamp of the last YouTube sync, or null. */
  lastSyncedAt:     string | null
  videos:           ClassVideo[]
  channel:          ClassChannelProfile
  moreFromChannel:  ClassCourseCard[]
  similar:          ClassCourseCard[]
}
