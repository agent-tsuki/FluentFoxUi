import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from '@/components/ui/Icon'

/**
 * FormField — label + optional hint + control, the one field layout for forms.
 * Pair with TextInput / TextArea / SelectInput so every input looks the same.
 */
interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  className?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, hint, className, children }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={htmlFor} className="block font-sans text-xs font-bold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  )
}

const CONTROL =
  'w-full rounded-md border border-line bg-surface-raised px-4 py-2.5 font-sans text-base text-ink transition-colors placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60'

/** TextInput — the shared single-line input. */
export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, className)} {...props} />
}

/** TextArea — the shared multi-line input. */
export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'resize-y', className)} {...props} />
}

/** SelectInput — the shared native select with a chevron. */
export function SelectInput({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select className={cn(CONTROL, 'appearance-none pr-10')} {...props}>
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted">
        <Icon name="expand_more" />
      </span>
    </div>
  )
}
