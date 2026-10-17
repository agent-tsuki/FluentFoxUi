import type { KanaGroupId } from '@/lib/content/kana/courseTypes'

/** Leading icon for a group's row on the Tests page. Group names come from the script's groups. */
export const GROUP_ICON: Record<KanaGroupId, string> = {
  basic: 'grid_view',
  dakuten: 'translate',
  combo: 'style',
  foreign: 'language',
}
