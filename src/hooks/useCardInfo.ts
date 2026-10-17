import { cardInfoService, type CardInfo } from '@/api/services/cardInfoService'
import { useAsync, type AsyncState } from '@/hooks/useAsync'
import type { SrsItemType } from '@/types/learn'

/** Reading or meaning, memory hook and look-alikes of one kana or kanji. */
export function useCardInfo(itemType: SrsItemType, char: string): AsyncState<CardInfo | null> {
  return useAsync(`card-info-${itemType}-${char}`, () => cardInfoService.get(itemType, char))
}
