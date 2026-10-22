import { PERMISSION_LABELS } from '@/lib/admin/permissions'
import type { AdminPermission } from '@/types/admin'

/** Checkbox list of permissions with a one-line description each. */
interface PermissionCheckboxesProps {
  options: AdminPermission[]
  selected: AdminPermission[]
  onChange: (selected: AdminPermission[]) => void
  disabled?: boolean
}

export function PermissionCheckboxes({ options, selected, onChange, disabled }: PermissionCheckboxesProps) {
  const toggle = (permission: AdminPermission) =>
    onChange(selected.includes(permission) ? selected.filter(p => p !== permission) : [...selected, permission])

  return (
    <fieldset className="space-y-1" disabled={disabled}>
      <legend className="mb-2 font-label text-xs font-bold uppercase tracking-widest text-on-surface-variant">Permissions</legend>
      {options.map(permission => (
        <label
          key={permission}
          className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-surface-container"
        >
          <input
            type="checkbox"
            checked={selected.includes(permission)}
            onChange={() => toggle(permission)}
            className="mt-1 h-4 w-4 shrink-0 accent-primary"
          />
          <span>
            <span className="block text-sm font-semibold text-on-surface">{PERMISSION_LABELS[permission].label}</span>
            <span className="block text-xs text-on-surface-variant">{PERMISSION_LABELS[permission].description}</span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
