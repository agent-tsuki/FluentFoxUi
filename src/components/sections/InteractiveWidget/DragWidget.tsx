import type { DragWidgetData } from '@/types'

interface DragWidgetProps {
  data: DragWidgetData
}

export function DragWidget({ data }: DragWidgetProps) {
  const emptyZones = data.dropZones - 1 // first is prefilled

  return (
    <div className="bg-surface-container-lowest p-10 rounded-2xl shadow-sm border border-outline-variant/10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">gesture</span>
        </div>
        <h3 className="font-headline font-bold text-xl">{data.instruction}</h3>
      </div>

      <div className="space-y-12">
        {/* Drop Zones */}
        <div className="flex gap-3 justify-center">
          {/* Prefilled first zone */}
          <div className="w-16 h-20 rounded-xl bg-surface-container border-2 border-dashed border-outline-variant flex items-center justify-center text-3xl font-bold text-on-surface/20">
            {data.prefilled}
          </div>
          {Array.from({ length: emptyZones }).map((_, i) => (
            <div
              key={i}
              className="w-16 h-20 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant"
            />
          ))}
        </div>

        {/* Draggable Blocks */}
        <div className="flex flex-wrap gap-4 justify-center">
          {data.blocks.map((block) => (
            <div
              key={block.id}
              className={`px-6 py-4 rounded-xl font-headline text-2xl font-bold hover:scale-110 cursor-grab active:cursor-grabbing transition-transform ${
                block.isCorrect
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container-lowest shadow-md border border-outline-variant/30'
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
