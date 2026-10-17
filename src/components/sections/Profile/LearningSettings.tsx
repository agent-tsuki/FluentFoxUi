import { useCallback, useState } from 'react'
import type { LearningSettings as Settings } from '@/types/learn'
import { useLearningSettings } from '@/hooks/useLearningSettings'
import { resolveErrorMessage } from '@/api/errors'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState, SkeletonBlock } from '@/components/ui/LoadingState'
import { hasErrors, settingsChanges, validateSettings } from '@/lib/learn/learningSettings'
import { LearningSettingsForm } from './LearningSettingsForm'

type Message = { tone: 'success' | 'error'; text: string }

/** Settings → Learning and Advanced (GET / PUT /learn/settings). */
export function LearningSettings() {
  const { settings, isLoading, error, refetch, save } = useLearningSettings()

  if (error) return <ErrorState message="We couldn't load your learning settings." onRetry={refetch} />
  if (isLoading || !settings) {
    return (
      <LoadingState label="Loading learning settings…">
        <div className="space-y-4">
          <SkeletonBlock className="h-14 w-full rounded-xl" />
          <SkeletonBlock className="h-14 w-full rounded-xl" />
          <SkeletonBlock className="h-14 w-full rounded-xl" />
        </div>
      </LoadingState>
    )
  }
  return <SettingsEditor saved={settings} save={save} />
}

interface SettingsEditorProps {
  saved: Settings
  save: (update: Partial<Settings>) => Promise<Settings>
}

function SettingsEditor({ saved, save }: SettingsEditorProps) {
  const [draft, setDraft] = useState(saved)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const errors = validateSettings(draft)
  const changes = settingsChanges(saved, draft)
  const dirty = Object.keys(changes).length > 0

  const onChange = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setMessage(null)
  }, [])

  const onSave = async () => {
    if (hasErrors(errors) || !dirty) return
    setSaving(true)
    try {
      setDraft(await save(changes))
      setMessage({ tone: 'success', text: 'Saved. New limits apply to your next session.' })
    } catch (err: unknown) {
      setMessage({ tone: 'error', text: resolveErrorMessage(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        void onSave()
      }}
    >
      <LearningSettingsForm draft={draft} errors={errors} onChange={onChange} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {message && (
          <p role={message.tone === 'error' ? 'alert' : 'status'} className={`mr-auto text-sm font-body ${message.tone === 'error' ? 'text-error' : 'text-success'}`}>
            {message.text}
          </p>
        )}
        <Button type="button" variant="ghost" className="text-sm px-4 py-2" disabled={!dirty || saving} onClick={() => setDraft(saved)}>
          Reset
        </Button>
        <Button type="submit" className="text-sm px-5 py-2" disabled={!dirty || saving || hasErrors(errors)}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
