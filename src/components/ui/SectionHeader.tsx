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
          'mb-4 inline-block rounded-sm bg-primary-soft px-2 py-0.5 text-eyebrow uppercase text-primary-ink',
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
        'mb-2 block text-eyebrow uppercase text-ink-muted',
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
        'font-display font-extrabold tracking-tight text-ink',
        eyebrowVariant === 'pill' ? 'text-display-md' : 'text-display-sm',
        titleClassName
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          'text-base text-ink-muted font-sans',
          isCenter ? 'max-w-2xl mx-auto' : 'max-w-xl',
          descriptionClassName
        )}>
          {description}
        </p>
      )}
    </FadeIn>
  )
}
