import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { usePermissions } from '@/hooks/admin/usePermissions'

/**
 * "Admin" entry for the user menu. Renders nothing unless the signed-in user
 * holds at least one admin permission (or the check failed — then it hides).
 */
export function AdminMenuLink({ className, onClick }: { className: string; onClick: () => void }) {
  const { hasAny } = usePermissions()
  if (!hasAny) return null
  return (
    <Link to="/admin" onClick={onClick} className={className}>
      <Icon name="settings" className="text-base" />
      Admin
    </Link>
  )
}
