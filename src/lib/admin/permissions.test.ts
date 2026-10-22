import { describe, expect, it } from 'vitest'
import { can, canAny, grantablePermissions, hasAnyPermission } from './permissions'
import type { MyPermissions } from '@/types/admin'

const none: MyPermissions = { isSuperAdmin: false, grants: [] }
const superAdmin: MyPermissions = { isSuperAdmin: true, grants: [] }
const globalEdit: MyPermissions = { isSuperAdmin: false, grants: [{ permission: 'classes.course.edit', resourceType: '', resourceId: '' }] }
const channelA: MyPermissions = {
  isSuperAdmin: false,
  grants: [
    { permission: 'classes.channel.edit', resourceType: 'channel', resourceId: 'ch-a' },
    { permission: 'classes.course.edit', resourceType: 'channel', resourceId: 'ch-a' },
  ],
}
const courseOnly: MyPermissions = { isSuperAdmin: false, grants: [{ permission: 'classes.publish', resourceType: 'course', resourceId: 'co-1' }] }

describe('can', () => {
  it('denies without permissions', () => {
    expect(can(undefined, 'classes.sync')).toBe(false)
    expect(can(none, 'classes.sync', { type: 'channel', id: 'ch-a' })).toBe(false)
  })

  it('allows everything for a super admin', () => {
    expect(can(superAdmin, 'permissions.manage')).toBe(true)
    expect(can(superAdmin, 'classes.publish', { type: 'course', id: 'x' })).toBe(true)
  })

  it('a global grant covers every resource and the no-resource check', () => {
    expect(can(globalEdit, 'classes.course.edit')).toBe(true)
    expect(can(globalEdit, 'classes.course.edit', { type: 'course', id: 'any', channelId: 'any' })).toBe(true)
    expect(can(globalEdit, 'classes.publish', { type: 'course', id: 'any' })).toBe(false)
  })

  it('a channel grant covers that channel and its courses only', () => {
    expect(can(channelA, 'classes.channel.edit', { type: 'channel', id: 'ch-a' })).toBe(true)
    expect(can(channelA, 'classes.channel.edit', { type: 'channel', id: 'ch-b' })).toBe(false)
    expect(can(channelA, 'classes.course.edit', { type: 'course', id: 'co-9', channelId: 'ch-a' })).toBe(true)
    expect(can(channelA, 'classes.course.edit', { type: 'course', id: 'co-9', channelId: 'ch-b' })).toBe(false)
    // Unknown channel for the course: not covered.
    expect(can(channelA, 'classes.course.edit', { type: 'course', id: 'co-9' })).toBe(false)
    // A channel grant is not a global grant.
    expect(can(channelA, 'classes.channel.edit')).toBe(false)
  })

  it('a course grant covers only that course, never its channel', () => {
    expect(can(courseOnly, 'classes.publish', { type: 'course', id: 'co-1', channelId: 'ch-a' })).toBe(true)
    expect(can(courseOnly, 'classes.publish', { type: 'course', id: 'co-2', channelId: 'ch-a' })).toBe(false)
    expect(can(courseOnly, 'classes.publish', { type: 'channel', id: 'co-1' })).toBe(false)
  })
})

describe('canAny / hasAnyPermission / grantablePermissions', () => {
  it('canAny is true for a grant at any scope', () => {
    expect(canAny(channelA, 'classes.course.edit')).toBe(true)
    expect(canAny(channelA, 'classes.sync')).toBe(false)
    expect(canAny(superAdmin, 'classes.sync')).toBe(true)
  })

  it('hasAnyPermission gates the admin area', () => {
    expect(hasAnyPermission(none)).toBe(false)
    expect(hasAnyPermission(courseOnly)).toBe(true)
    expect(hasAnyPermission(superAdmin)).toBe(true)
    expect(hasAnyPermission(null)).toBe(false)
  })

  it('only super admins may grant permissions.manage', () => {
    expect(grantablePermissions(superAdmin)).toContain('permissions.manage')
    expect(grantablePermissions(globalEdit)).not.toContain('permissions.manage')
  })
})
