import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost' | 'white'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:scale-105 active:scale-[0.98] shadow-lg shadow-primary/20',
  outline:
    'border-2 border-surface-container-highest hover:bg-surface-container-low',
  ghost: 'text-slate-600 hover:text-slate-900',
  white: 'bg-white text-primary font-bold hover:bg-on-primary-container',
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`transition-all px-6 py-2.5 rounded-xl font-bold ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
