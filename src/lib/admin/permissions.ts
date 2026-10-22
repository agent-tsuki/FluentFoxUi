/**
 * Client-side mirror of the backend permission rules (internal/access):
 *  - a super admin has every permission;
 *  - a grant with an empty resource type covers every resource;
 *  - a channel grant covers that channel and all of its courses;
 *  - a course grant covers only that course.
 *
 * The server checks again on every request; these helpers only decide which
 * controls to show, so a stale answer can never grant real access.
 */
import type { AdminPermission, MyPermissions, PermissionResource } from '@/types/admin'

/**
 * True when `perms` allows `permission` on `resource`. Without a resource the
 * question is "for every resource" (a global grant), exactly as the backend's
 * empty ResourceRef.
 */
export function can(perms: MyPermissions | null | undefined, permission: AdminPermission, resource?: PermissionResource): boolean {
  if (!perms) return false
  if (perms.isSuperAdmin) return true
  return perms.grants.some(grant => {
    if (grant.permission !== permission) return false
    if (grant.resourceType === '') return true
    if (!resource) return false
    if (grant.resourceType === resource.type && grant.resourceId === resource.id) return true
    return resource.type === 'course' && grant.resourceType === 'channel' && !!resource.channelId && grant.resourceId === resource.channelId
  })
}

/** True when `permission` is granted for at least one resource (or globally). */
export function canAny(perms: MyPermissions | null | undefined, permission: AdminPermission): boolean {
  if (!perms) return false
  return perms.isSuperAdmin || perms.grants.some(grant => grant.permission === permission)
}

/** True when the user holds any admin permission at all (gates the admin area). */
export function hasAnyPermission(perms: MyPermissions | null | undefined): boolean {
  if (!perms) return false
  return perms.isSuperAdmin || perms.grants.length > 0
}

/** Only super admins may grant `permissions.manage` (mirrors the backend rule). */
export function grantablePermissions(perms: MyPermissions | null | undefined): AdminPermission[] {
  const all: AdminPermission[] = [
    'classes.channel.edit',
    'classes.channel.media',
    'classes.course.edit',
    'classes.publish',
    'classes.sync',
  ]
  return perms?.isSuperAdmin ? [...all, 'permissions.manage'] : all
}

/** Human labels for the permission checkboxes and grant lists. */
export const PERMISSION_LABELS: Record<AdminPermission, { label: string; description: string }> = {
  'classes.channel.edit':  { label: 'Edit channel profile', description: 'Name, description, teaching style, pros and cons' },
  'classes.channel.media': { label: 'Channel media',        description: 'Profile picture, banner and intro video' },
  'classes.course.edit':   { label: 'Edit courses',         description: 'Course details, curriculum and tags' },
  'classes.publish':       { label: 'Publish',              description: 'Show or hide channels and courses' },
  'classes.sync':          { label: 'Sync from YouTube',    description: 'Refresh channel and playlist data' },
  'permissions.manage':    { label: 'Manage permissions',   description: 'Invite teachers and grant access' },
}
