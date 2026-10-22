/**
 * snake_case API ↔ camelCase domain mapping for the admin area. Pure functions,
 * so they are unit-tested on their own (adminMappers.test.ts).
 */
import {
  ADMIN_PERMISSIONS,
  CHANNEL_OVERRIDE_FIELDS,
  type AdminChannel,
  type AdminCourse,
  type AdminPermission,
  type ApiAdminChannel,
  type ApiAdminCourse,
  type ApiChangeLogEntry,
  type ApiGrantRecord,
  type ApiInvite,
  type ApiInvitePreview,
  type ApiMyPermissions,
  type ApiPermissionGrant,
  type ChangeLogEntry,
  type ChannelOverrideField,
  type ChannelTextUpdate,
  type CourseInput,
  type CourseLevel,
  type CoursePlatform,
  type GrantRecord,
  type GrantResourceType,
  type InvitePreview,
  type InviteStatus,
  type MyPermissions,
  type OverridableValue,
  type PermissionGrant,
  type StaffInvite,
} from '@/types/admin'

const isPermission = (value: string): value is AdminPermission =>
  (ADMIN_PERMISSIONS as readonly string[]).includes(value)

const toResourceType = (value: string): GrantResourceType =>
  value === 'channel' || value === 'course' ? value : ''

const INVITE_STATUSES: InviteStatus[] = ['pending', 'accepted', 'expired', 'revoked']
const toInviteStatus = (value: string): InviteStatus =>
  (INVITE_STATUSES as string[]).includes(value) ? (value as InviteStatus) : 'expired'

const LEVELS: CourseLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']
const PLATFORMS: CoursePlatform[] = ['youtube', 'udemy', 'website']

// ─── Permissions ──────────────────────────────────────────────────────────────

/** Unknown permission names (a newer backend) are dropped rather than trusted. */
export function toGrants(grants: ApiPermissionGrant[] | null | undefined): PermissionGrant[] {
  return (grants ?? []).flatMap(g =>
    isPermission(g.permission)
      ? [{ permission: g.permission, resourceType: toResourceType(g.resource_type), resourceId: g.resource_id ?? '' }]
      : [],
  )
}

export function fromGrant(g: PermissionGrant): ApiPermissionGrant {
  return { permission: g.permission, resource_type: g.resourceType, resource_id: g.resourceType === '' ? '' : g.resourceId }
}

export function toMyPermissions(p: ApiMyPermissions): MyPermissions {
  return { isSuperAdmin: p.is_super_admin, grants: toGrants(p.grants) }
}

export function toGrantRecord(r: ApiGrantRecord): GrantRecord | null {
  const [grant] = toGrants([r])
  if (!grant) return null
  return {
    ...grant,
    id:        r.id,
    userId:    r.user_id,
    userEmail: r.user_email,
    username:  r.username,
    grantedBy: r.granted_by,
    createdAt: r.created_at,
  }
}

// ─── Invites ──────────────────────────────────────────────────────────────────

export function toInvite(i: ApiInvite): StaffInvite {
  return {
    id:         i.id,
    email:      i.email,
    status:     toInviteStatus(i.status),
    grants:     toGrants(i.grants),
    invitedBy:  i.invited_by,
    expiresAt:  i.expires_at,
    acceptedAt: i.accepted_at,
    createdAt:  i.created_at,
  }
}

export function toInvitePreview(p: ApiInvitePreview): InvitePreview {
  const grants = (p.grants ?? []).flatMap(g => {
    const [grant] = toGrants([g])
    return grant ? [{ ...grant, resourceName: g.resource_name ?? null }] : []
  })
  return { emailMasked: p.email_masked, status: toInviteStatus(p.status), grants, expiresAt: p.expires_at }
}

// ─── Channels ─────────────────────────────────────────────────────────────────

function toOverridable(raw: ApiAdminChannel, field: ChannelOverrideField): OverridableValue {
  const value = raw.fields?.[field]
  if (value) return { youtube: value.youtube ?? null, custom: value.custom ?? null, effective: value.effective ?? null }
  // Older payloads: only the effective value at the top level.
  const effective = raw[field] ?? null
  return { youtube: null, custom: null, effective }
}

export function toAdminChannel(c: ApiAdminChannel): AdminChannel {
  const fields = Object.fromEntries(
    CHANNEL_OVERRIDE_FIELDS.map(field => [field, toOverridable(c, field)]),
  ) as Record<ChannelOverrideField, OverridableValue>
  return {
    id:               c.id,
    slug:             c.slug,
    platform:         c.platform,
    url:              c.url,
    handle:           c.handle,
    youtubeChannelId: c.youtube_channel_id,
    subscriberCount:  c.subscriber_count,
    videoCount:       c.video_count,
    accentColor:      c.accent_color,
    teachingStyle:    c.teaching_style ?? '',
    bestFor:          c.best_for ?? [],
    notFor:           c.not_for ?? [],
    pros:             c.pros ?? [],
    cons:             c.cons ?? [],
    verdict:          c.verdict ?? '',
    isPublished:      c.is_published,
    lastSyncedAt:     c.last_synced_at,
    fields,
  }
}

/** Only the keys present in `u` are sent (PATCH is partial). */
export function fromChannelUpdate(u: ChannelTextUpdate): Record<string, unknown> {
  const map: Record<keyof ChannelTextUpdate, string> = {
    name:          'name',
    description:   'description',
    teachingStyle: 'teaching_style',
    bestFor:       'best_for',
    notFor:        'not_for',
    pros:          'pros',
    cons:          'cons',
    verdict:       'verdict',
    accentColor:   'accent_color',
  }
  const body: Record<string, unknown> = {}
  for (const key of Object.keys(u) as (keyof ChannelTextUpdate)[]) {
    if (u[key] !== undefined) body[map[key]] = u[key]
  }
  return body
}

export function toChangeLogEntry(e: ApiChangeLogEntry): ChangeLogEntry {
  return {
    id:         e.id,
    actorId:    e.actor_id,
    actorName:  e.actor_username ?? null,
    entityType: e.entity_type,
    entityId:   e.entity_id,
    field:      e.field,
    oldValue:   e.old_value,
    newValue:   e.new_value,
    createdAt:  e.created_at,
  }
}

// ─── Courses ──────────────────────────────────────────────────────────────────

export function toAdminCourse(c: ApiAdminCourse): AdminCourse {
  return {
    id:               c.id,
    slug:             c.slug,
    channelId:        c.channel_id,
    channelName:      c.channel_name ?? c.channel?.name ?? null,
    title:            c.title,
    summary:          c.summary ?? '',
    level:            LEVELS.includes(c.level as CourseLevel) ? (c.level as CourseLevel) : 'N5',
    platform:         PLATFORMS.includes(c.platform as CoursePlatform) ? (c.platform as CoursePlatform) : 'website',
    url:              c.url,
    playlistId:       c.playlist_id,
    thumbnailUrl:     c.thumbnail_url,
    isFree:           c.is_free,
    priceNote:        c.price_note ?? '',
    tags:             c.tags ?? [],
    whatYouLearn:     c.what_you_learn ?? [],
    curriculum:       (c.curriculum ?? []).map(s => ({ title: s.title, topics: s.topics ?? [] })),
    totalDurationSec: c.total_duration_sec ?? 0,
    videoCount:       c.video_count ?? c.videos?.length ?? 0,
    isPublished:      c.is_published,
    isFeatured:       c.is_featured,
    sortOrder:        c.sort_order,
    lastSyncedAt:     c.last_synced_at,
  }
}

/** Empty optional strings go out as null so the API clears them. */
export function fromCourseInput(c: CourseInput): Record<string, unknown> {
  return {
    channel_id:     c.channelId,
    slug:           c.slug.trim(),
    title:          c.title.trim(),
    summary:        c.summary,
    level:          c.level,
    platform:       c.platform,
    url:            c.url.trim(),
    playlist_id:    c.playlistId.trim() || null,
    thumbnail_url:  c.thumbnailUrl.trim() || null,
    is_free:        c.isFree,
    price_note:     c.priceNote,
    tags:           c.tags,
    what_you_learn: c.whatYouLearn,
    curriculum:     c.curriculum,
    sort_order:     c.sortOrder,
  }
}
