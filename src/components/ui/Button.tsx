import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'white' | 'inverse'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 dark:shadow-primary/10 dark:hover:shadow-primary/15',
  outline:
    'border-2 border-outline-variant/40 hover:bg-surface-container-low text-on-surface',
  ghost: 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low',
  white: 'bg-white text-primary hover:bg-on-primary-container shadow-md',
  // Header call-to-action: brand coral in light, a moonlight pill on navy in dark.
  // On hover it lifts and glows in its own colour.
  inverse: [
    'bg-primary text-on-primary shadow-elevation-1',
    'hover:-translate-y-0.5 hover:shadow-[0_0.5rem_2rem_-0.25rem_rgb(var(--primary)/0.7)]',
    'motion-reduce:hover:translate-y-0',
    'dark:bg-on-surface dark:text-surface dark:hover:shadow-[0_0.5rem_2rem_-0.25rem_rgb(var(--on-surface)/0.5)]',
  ].join(' '),
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`transition duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] px-6 py-2.5 rounded-xl font-bold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
