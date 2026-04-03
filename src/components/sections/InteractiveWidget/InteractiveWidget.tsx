import { useEffect, useState } from 'react'
import type { DragWidgetData } from '@/types'
import { interactiveService } from '@/api/services/interactiveService'
import { DragWidget } from './DragWidget'
import { Icon } from '@/components/ui/Icon'

export function InteractiveWidget() {
  const [data, setData] = useState<DragWidgetData | null>(null)

  useEffect(() => {
    interactiveService.getDragWidget().then(setData)
  }, [])

  return (
    <section className="bg-surface-container-low py-24">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Widget — order-2 on mobile, order-1 on desktop */}
          <div className="order-2 lg:order-1">
            {data && <DragWidget data={data} />}
          </div>

          {/* Copy — order-1 on mobile, order-2 on desktop */}
          <div className="order-1 lg:order-2 space-y-6">
            <p className="text-primary font-label font-bold tracking-[0.3em] uppercase">
              Interactive Focus
            </p>
            <h2 className="font-headline text-4xl font-extrabold tracking-tight leading-tight">
              Build confidence block by block.
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Our proprietary "Tactile Logic" engine makes complex grammar feel like physical
              puzzles. Engage your muscle memory to internalize Japanese sentence structures 4x
              faster than traditional rote memorization.
            </p>
            <ul className="space-y-4 pt-4">
              {[
                'Sentence building through spatial reasoning',
                'Instant corrective haptic feedback',
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Icon name="check_circle" className="text-primary" filled />
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
