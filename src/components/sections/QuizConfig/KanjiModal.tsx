import { CloseButton } from '@/components/ui/CloseButton'
import { Button } from '@/components/ui/Button'
import type { QuizSelectableKanji } from '@/types'

interface KanjiModalProps {
  open: boolean
  kanji: QuizSelectableKanji[]
  selected: Set<string>
  onToggle: (char: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export function KanjiModal({ open, kanji, selected, onToggle, onConfirm, onCancel }: KanjiModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl overflow-hidden shadow-elevation-3">
        {/* Header */}
        <div className="p-8 border-b border-surface-container flex justify-between items-center">
          <h3 className="text-2xl font-bold font-headline">Select Kanji Characters</h3>
          <CloseButton onClick={onCancel} />
        </div>

        {/* Kanji Grid */}
        <div className="p-8 max-h-[360px] overflow-y-auto grid grid-cols-5 gap-4">
          {kanji.map((k) => {
            const isSelected = selected.has(k.character)
            return (
              <button
                key={k.character}
                onClick={() => onToggle(k.character)}
                className={`h-16 flex items-center justify-center rounded-lg font-bold text-xl transition-all font-headline ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container border border-outline-variant text-on-surface hover:border-primary'
                }`}
              >
                {k.character}
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-8 bg-surface-container-low flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 font-bold text-on-surface-variant font-label"
          >
            Cancel
          </button>
          <Button variant="primary" onClick={onConfirm} className="px-8 py-3 rounded-xl">
            Confirm Selection
          </Button>
        </div>
      </div>
    </div>
  )
}
