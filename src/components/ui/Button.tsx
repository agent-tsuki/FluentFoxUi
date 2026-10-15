import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'white'

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
