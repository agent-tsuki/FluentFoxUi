import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { KanaScriptProvider } from '@/context/KanaScriptContext'
import { getLearningPath } from '@/api/services/learningPathService'
import { KANA_SCRIPTS, type RegisteredKanaScriptId } from '@/lib/content/kana/scripts'

/**
 * Route element for one script's course tree (`/kana/hiragana/*`): provides
 * the script config to every child route. Lazy-loaded, so course content stays
 * out of the initial bundle.
 */
export function KanaScriptRoute({ script }: { script: RegisteredKanaScriptId }) {
  useEffect(() => {
    // Every script, not only this one: the Kana master certificate reads both paths.
    for (const config of Object.values(KANA_SCRIPTS)) {
      getLearningPath(config.id).setScopes({ groups: config.groups, skipAllFinalMark: config.finalTest.passMark })
    }
  }, [])

  return (
    <KanaScriptProvider script={script}>
      <Outlet />
    </KanaScriptProvider>
  )
}
