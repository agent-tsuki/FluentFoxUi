import { Outlet } from 'react-router-dom'
import { KanaScriptProvider } from '@/context/KanaScriptContext'
import type { RegisteredKanaScriptId } from '@/lib/content/kana/scripts'

/**
 * Route element for one script's course tree (`/kana/hiragana/*`): provides
 * the script config to every child route. Lazy-loaded, so course content stays
 * out of the initial bundle.
 */
export function KanaScriptRoute({ script }: { script: RegisteredKanaScriptId }) {
  return (
    <KanaScriptProvider script={script}>
      <Outlet />
    </KanaScriptProvider>
  )
}
