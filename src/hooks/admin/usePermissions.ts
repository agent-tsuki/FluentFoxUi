import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAsync } from '@/hooks/useAsync'
import { adminService } from '@/api/services/adminService'
import { can as canFor, canAny as canAnyFor, hasAnyPermission } from '@/lib/admin/permissions'
import type { AdminPermission, MyPermissions, PermissionResource } from '@/types/admin'

export interface PermissionsState {
  permissions: MyPermissions | undefined
  isLoading:   boolean
  error:       Error | null
  refetch:     () => void
  /** Allowed on this resource (or, without one, on every resource). */
  can:         (permission: AdminPermission, resource?: PermissionResource) => boolean
  /** Granted for at least one resource. */
  canAny:      (permission: AdminPermission) => boolean
  /** Holds any admin permission at all. */
  hasAny:      boolean
}

/**
 * usePermissions — the signed-in user's admin permissions
 * (GET /admin/me/permissions), cached per user so the navbar and the admin
 * area share one request. Signed out: no request, no permissions.
 */
export function usePermissions(): PermissionsState {
  const { user } = useAuth()
  const userId = user?.userId ?? ''
  const version = useSyncExternalStore(adminService.subscribePermissions, adminService.getPermissionsVersion)
  const { data, isLoading, error } = useAsync<MyPermissions | null>(
    `admin-permissions:${userId}:${version}`,
    () => (userId ? adminService.getMyPermissions(userId) : Promise.resolve(null)),
    () => (userId ? adminService.peekMyPermissions(userId) : null),
  )
  const permissions = data ?? undefined

  // Clearing the cache bumps `version`, which reloads every instance.
  const reload = useCallback(() => adminService.clearMyPermissions(), [])

  const can = useCallback(
    (permission: AdminPermission, resource?: PermissionResource) => canFor(permissions, permission, resource),
    [permissions],
  )
  const canAny = useCallback((permission: AdminPermission) => canAnyFor(permissions, permission), [permissions])

  return useMemo(
    () => ({ permissions, isLoading, error, refetch: reload, can, canAny, hasAny: hasAnyPermission(permissions) }),
    [permissions, isLoading, error, reload, can, canAny],
  )
}
