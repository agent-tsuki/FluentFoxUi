import React from 'react'
import { cn } from '@/lib/cn'
import { FadeIn } from './FadeIn'

interface EyebrowProps {
  children: React.ReactNode
  variant?: 'pill' | 'plain'
  className?: string
}

export function Eyebrow({ children, variant = 'plain', className = '' }: EyebrowProps) {
  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-block bg-primary/10 text-primary text-2xs font-semibold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full border border-primary/20 mb-4',
          className
        )}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'text-xs font-bold tracking-[0.18em] uppercase text-primary font-label block mb-2',
        className
      )}
    >
      {children}
    </span>
  )
}

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  eyebrowVariant?: 'pill' | 'plain'
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  eyebrowVariant = 'plain',
  className = '',
  titleClassName = '',
  descriptionClassName = '',
}: SectionHeaderProps) {
  const isCenter = align === 'center'

  return (
    <FadeIn className={cn('space-y-4', isCenter ? 'text-center' : 'text-left', className)}>
      {eyebrow && (
        <Eyebrow variant={eyebrowVariant}>
          {eyebrow}
        </Eyebrow>
      )}
      <h2 className={cn(
        'font-headline font-extrabold tracking-tight text-on-surface',
        eyebrowVariant === 'pill' ? 'text-display-md' : 'text-display-sm',
        titleClassName
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          'text-base text-on-surface-variant font-body',
          isCenter ? 'max-w-2xl mx-auto' : 'max-w-xl',
          descriptionClassName
        )}>
          {description}
        </p>
      )}
    </FadeIn>
  )
}
