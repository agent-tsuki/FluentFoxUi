/**
 * Built-in avatars. Ids must match AVATAR_PRESETS in the API
 * (internal/common/constants.go); paths are public/ files that asset() maps to the CDN.
 */
export interface AvatarPreset {
  id:    string
  group: 'male' | 'female'
  /** Shown to screen readers; the id is a stable API key, not a description. */
  label: string
  path:  string
}

export const AVATAR_PRESETS: readonly AvatarPreset[] = [
  { id: 'men-warrior',    group: 'male',   label: 'The bad boy', path: '/avatars/men/warrior.png' },
  { id: 'men-samurai',    group: 'male',   label: 'The ronin', path: '/avatars/men/samurai.png' },
  { id: 'men-noble',      group: 'male',   label: 'The heartthrob', path: '/avatars/men/noble.png' },
  { id: 'men-emperor',    group: 'male',   label: 'The executive', path: '/avatars/men/emperor.png' },
  { id: 'men-citizen',    group: 'male',   label: 'The sweetheart', path: '/avatars/men/citizen.png' },
  { id: 'women-geisha-1', group: 'female', label: 'The elegant one', path: '/avatars/women/geisha_1.png' },
  { id: 'women-geisha-2', group: 'female', label: 'The idol', path: '/avatars/women/geisha_2.png' },
  { id: 'women-japanese', group: 'female', label: 'The festival girl', path: '/avatars/women/japanese.png' },
  { id: 'women-casual-1', group: 'female', label: 'The CEO', path: '/avatars/women/casual_1.png' },
  { id: 'women-casual-2', group: 'female', label: 'The rebel', path: '/avatars/women/casual_2.png' },
]

export const DEFAULT_AVATAR_PATH = '/avatars/men/warrior.png'
