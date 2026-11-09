import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

/** A chapter quiz's start card: a title, one line, what kinds of question, and Start. */
export function PracticeIntro({
  heading,
  line,
  items,
  startLabel,
  onStart,
}: {
  heading: string
  line: string
  items: { icon: string; title: string; summary: string }[]
  startLabel: string
  onStart: () => void
}) {
  return (
    <div className="px-6 py-8 xl:px-10">
      <div className="max-w-xl rounded-3xl border border-outline-variant/60 bg-surface-container-lowest p-6 dark:border-outline/60 dark:bg-surface-container-low">
        <h1 className="font-headline text-2xl font-bold text-on-surface sm:text-3xl">{heading}</h1>
        <p className="mt-1 text-sm text-on-surface-variant">{line}</p>
        <ul className="mt-5 space-y-2">
          {items.map((item) => (
            <li key={item.title} className="flex items-start gap-3 text-sm">
              <span aria-hidden className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon name={item.icon} className="text-lg" />
              </span>
              <span>
                <span className="font-semibold text-on-surface">{item.title}</span>
                <span className="block text-on-surface-variant">{item.summary}</span>
              </span>
            </li>
          ))}
        </ul>
        <Button onClick={onStart} className="mt-6 flex items-center gap-2">
          {startLabel}
          <Icon name="arrow_forward" className="text-lg" />
        </Button>
      </div>
    </div>
  )
}
