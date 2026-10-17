interface IconProps {
  name: string
  className?: string
  filled?: boolean
}

export function Icon({ name, className = '', filled = false }: IconProps) {
  const style = filled
    ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
    : { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }

  return (
    // Decorative: the ligature name ("check_circle") must never be read out. Label the control instead.
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`} style={style}>
      {name}
    </span>
  )
}
