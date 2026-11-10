import type { DragWidgetData } from '@/types'

interface DragWidgetProps {
  data: DragWidgetData
}

export function DragWidget({ data }: DragWidgetProps) {
  const emptyZones = data.dropZones - 1 // first is prefilled

  return (
    <div className="bg-surface-raised p-10 rounded-xl shadow-elevation-1 border border-line">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">gesture</span>
        </div>
        <h3 className="font-display font-bold text-xl">{data.instruction}</h3>
      </div>

      <div className="space-y-12">
        {/* Drop Zones */}
        <div className="flex gap-3 justify-center">
          {/* Prefilled first zone */}
          <div className="w-16 h-20 rounded-md bg-surface-sunken border-2 border-dashed border-line flex items-center justify-center text-3xl font-bold text-ink-muted">
            {data.prefilled}
          </div>
          {Array.from({ length: emptyZones }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-20 rounded-md bg-surface-sunken border-2 border-dashed border-line"
            />
          ))}
        </div>

        {/* Draggable Blocks */}
        <div className="flex flex-wrap gap-4 justify-center">
          {data.blocks.map((block) => (
            <div
              key={block.id}
              className={`px-6 py-4 rounded-md font-display text-2xl font-bold hover:scale-110 cursor-grab active:cursor-grabbing transition-transform ${
                block.isCorrect
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20 dark:shadow-primary/10'
                  : 'bg-surface-raised shadow-elevation-2 border border-line'
              }`}
            >
              {block.character}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
