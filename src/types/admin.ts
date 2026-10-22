/**
 * Admin area types: permissions, staff invites, and the admin view of class
 * channels and courses. Kept apart from the public classes types on purpose:
 * the admin API carries hidden rows, override sources and audit history.
 *
 * `Api*` types mirror the snake_case JSON; the rest are the camelCase domain
 * shapes the UI uses (mapped in src/api/services/adminMappers.ts).
 */

// ─── Permissions ──────────────────────────────────────────────────────────────

export const ADMIN_PERMISSIONS = [
  'classes.channel.edit',
  'classes.channel.media',
  'classes.course.edit',
  'classes.publish',
  'classes.sync',
  'permissions.manage',
] as const

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]

/** '' = every resource; a channel grant also covers that channel's courses. */
export type GrantResourceType = '' | 'channel' | 'course'

export interface PermissionGrant {
  permission:   AdminPermission
  resourceType: GrantResourceType
  resourceId:   string
}

export interface MyPermissions {
  isSuperAdmin: boolean
  grants:       PermissionGrant[]
}

/** What a permission check is about. A course carries its channel so channel grants apply. */
export type PermissionResource =
  | { type: 'channel'; id: string }
  | { type: 'course'; id: string; channelId?: string }

/** A stored grant, as the permission manager lists it. */
export interface GrantRecord extends PermissionGrant {
  id:        string
  userId:    string
  userEmail: string
  username:  string
  grantedBy: string | null
  createdAt: string
}

export interface NewGrantInput {
  userEmail:    string
  permission:   AdminPermission
  resourceType: GrantResourceType
  resourceId:   string
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export type InviteStatus = 'pending' | 'accepted' | 'expired' | 'revoked'

export interface StaffInvite {
  id:         string
  email:      string
  status:     InviteStatus
  grants:     PermissionGrant[]
  invitedBy:  string | null
  expiresAt:  string
  acceptedAt: string | null
  createdAt:  string
}

export interface NewInviteInput {
  email:  string
  grants: PermissionGrant[]
}

export interface InvitePreviewGrant extends PermissionGrant {
  /** Channel or course name; null when the resource no longer exists. */
  resourceName: string | null
}

export interface InvitePreview {
  emailMasked: string
  status:      InviteStatus
  grants:      InvitePreviewGrant[]
  expiresAt:   string
}

// ─── Admin channels ───────────────────────────────────────────────────────────

export const CHANNEL_OVERRIDE_FIELDS = ['name', 'avatar_url', 'banner_url', 'description', 'intro_video_id'] as const
export type ChannelOverrideField = (typeof CHANNEL_OVERRIDE_FIELDS)[number]

/** A display field with a synced YouTube value and an editor's custom value. */
export interface OverridableValue {
  youtube:   string | null
  custom:    string | null
  effective: string | null
}

export interface AdminChannel {
  id:               string
  slug:             string
  platform:         string
  url:              string
  handle:           string | null
  youtubeChannelId: string | null
  subscriberCount:  number | null
  videoCount:       number | null
  accentColor:      string | null
  teachingStyle:    string
  bestFor:          string[]
  notFor:           string[]
  pros:             string[]
  cons:             string[]
  verdict:          string
  isPublished:      boolean
  lastSyncedAt:     string | null
  fields:           Record<ChannelOverrideField, OverridableValue>
}

/** Editable text fields of a channel; only the keys present are sent. */
export interface ChannelTextUpdate {
  name?:          string
  description?:   string
  teachingStyle?: string
  bestFor?:       string[]
  notFor?:        string[]
  pros?:          string[]
  cons?:          string[]
  verdict?:       string
  accentColor?:   string
}

export interface ChangeLogEntry {
  id:         string
  actorId:    string
  actorName:  string | null
  entityType: string
  entityId:   string
  field:      string
  oldValue:   string | null
  newValue:   string | null
  createdAt:  string
}

// ─── Admin courses ────────────────────────────────────────────────────────────

export type CourseLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
export type CoursePlatform = 'youtube' | 'udemy' | 'website'

export interface CurriculumSection {
  title:  string
  topics: string[]
}

export interface AdminCourse {
  id:               string
  slug:             string
  channelId:        string
  channelName:      string | null
  title:            string
  summary:          string
  level:            CourseLevel
  platform:         CoursePlatform
  url:              string
  playlistId:       string | null
  thumbnailUrl:     string | null
  isFree:           boolean
  priceNote:        string
  tags:             string[]
  whatYouLearn:     string[]
  curriculum:       CurriculumSection[]
  totalDurationSec: number
  videoCount:       number
  isPublished:      boolean
  isFeatured:       boolean
  sortOrder:        number
  lastSyncedAt:     string | null
}

/** Fields an editor sets on create/update. */
export interface CourseInput {
  channelId:    string
  slug:         string
  title:        string
  summary:      string
  level:        CourseLevel
  platform:     CoursePlatform
  url:          string
  playlistId:   string
  thumbnailUrl: string
  isFree:       boolean
  priceNote:    string
  tags:         string[]
  whatYouLearn: string[]
  curriculum:   CurriculumSection[]
  sortOrder:    number
}

export interface CourseVisibilityInput {
  isPublished: boolean
  isFeatured?: boolean
}

// ─── API (snake_case) shapes ──────────────────────────────────────────────────

export interface ApiPermissionGrant {
  permission:    string
  resource_type: string
  resource_id:   string
}

export interface ApiMyPermissions {
  is_super_admin: boolean
  grants:         ApiPermissionGrant[] | null
}

export interface ApiGrantRecord extends ApiPermissionGrant {
  id:         string
  user_id:    string
  user_email: string
  username:   string
  granted_by: string | null
  created_at: string
}

export interface ApiInvite {
  id:          string
  email:       string
  status:      string
  grants:      ApiPermissionGrant[] | null
  invited_by:  string | null
  expires_at:  string
  accepted_at: string | null
  created_at:  string
}

export interface ApiInvitePreview {
  email_masked: string
  status:       string
  grants:       (ApiPermissionGrant & { resource_name: string | null })[] | null
  expires_at:   string
}

export interface ApiOverridableValue {
  youtube:   string | null
  custom:    string | null
  effective: string | null
}

export interface ApiAdminChannel {
  id:                 string
  slug:               string
  platform:           string
  url:                string
  handle:             string | null
  youtube_channel_id: string | null
  subscriber_count:   number | null
  video_count:        number | null
  accent_color:       string | null
  teaching_style:     string | null
  best_for:           string[] | null
  not_for:            string[] | null
  pros:               string[] | null
  cons:               string[] | null
  verdict:            string | null
  is_published:       boolean
  last_synced_at:     string | null
  /** Effective values, also present at top level (ChannelProfile). */
  name?:              string | null
  avatar_url?:        string | null
  banner_url?:        string | null
  description?:       string | null
  intro_video_id?:    string | null
  fields?:            Partial<Record<ChannelOverrideField, ApiOverridableValue>>
}

export interface ApiChangeLogEntry {
  id:           string
  actor_id:     string
  actor_username?: string | null
  entity_type:  string
  entity_id:    string
  field:        string
  old_value:    string | null
  new_value:    string | null
  created_at:   string
}

export interface ApiAdminCourse {
  id:                 string
  slug:               string
  channel_id:         string
  title:              string
  summary:            string | null
  level:              string
  platform:           string
  url:                string
  playlist_id:        string | null
  thumbnail_url:      string | null
  is_free:            boolean
  price_note:         string | null
  tags:               string[] | null
  what_you_learn:     string[] | null
  curriculum:         { title: string; topics: string[] | null }[] | null
  total_duration_sec: number | null
  video_count?:       number | null
  videos?:            unknown[] | null
  is_published:       boolean
  is_featured:        boolean
  sort_order:         number
  last_synced_at:     string | null
  channel?:           { name?: string | null } | null
  channel_name?:      string | null
}
