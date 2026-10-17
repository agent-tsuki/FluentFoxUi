import { createContext, useContext, type ReactNode } from 'react'
import { KANA_SCRIPTS, type KanaScriptConfig, type RegisteredKanaScriptId } from '@/lib/content/kana/scripts'

const KanaScriptContext = createContext<KanaScriptConfig | null>(null)

/**
 * KanaScriptProvider — makes one script's course config (hiragana, katakana)
 * available to every kana course page and component below it. Wraps each
 * `/kana/<script>` route tree. The config objects are static, so the value
 * never changes identity.
 */
export function KanaScriptProvider({ script, children }: { script: RegisteredKanaScriptId; children: ReactNode }) {
  return <KanaScriptContext.Provider value={KANA_SCRIPTS[script]}>{children}</KanaScriptContext.Provider>
}

/** The current kana script's config. Only call this inside a `/kana/<script>` route. */
export function useKanaScript(): KanaScriptConfig {
  const script = useContext(KanaScriptContext)
  if (!script) throw new Error('useKanaScript must be used inside a KanaScriptProvider')
  return script
}
