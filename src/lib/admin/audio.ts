/** Display rules for the super-admin Audio page. Pure. */
import type { AdminVoice, AudioJob, EngineSpeaker } from '@/types/audioAdmin'

/** Who a voice key is, for the voice list. */
export function voiceKeyLabel(key: string): string {
  if (key === 'main') return 'Main voice (words, examples)'
  const female = key.startsWith('f')
  const male = key.startsWith('m')
  const n = key.replace(/\D/g, '')
  if ((female || male) && n) return `${female ? 'Female' : 'Male'} ${n}`
  return key
}

/** "まお · ノーマル", or the env voice's folder when the key has no cast row. */
export function voiceName(v: AdminVoice): string {
  if (v.fromEnv) return v.profile ? `Server default (${v.profile})` : 'Main voice'
  return [v.speakerName, v.styleName].filter(Boolean).join(' · ')
}

/** The speaker and style an engine style id belongs to. */
export function findStyle(speakers: readonly EngineSpeaker[], styleId: number): { speaker: EngineSpeaker; style: string } | null {
  for (const speaker of speakers) {
    const style = speaker.styles.find((s) => s.id === styleId)
    if (style) return { speaker, style: style.name }
  }
  return null
}

export const isActiveJob = (job: AudioJob) => job.status === 'queued' || job.status === 'running'

/** "Generate f1", "Generate every voice", "Install model 1f04a608". */
export function jobTitle(job: AudioJob): string {
  if (job.kind === 'install_model') return `Install model ${job.modelUuid?.slice(0, 8) ?? ''}`.trim()
  return job.voiceKey ? `Generate ${voiceKeyLabel(job.voiceKey).toLowerCase()} (${job.voiceKey})` : 'Generate every voice'
}

/** How long a queued job may wait before the page warns that no worker seems to be running. */
export const WORKER_WAIT_WARNING_MS = 60_000

/** A warning when the worker looks down, else null. */
export function workerWarning(job: AudioJob, now: number = Date.now()): string | null {
  if (job.status === 'running' && !job.alive) return 'The worker stopped reporting on this job. It will be picked up again when a worker is running.'
  if (job.status === 'queued' && now - new Date(job.createdAt).getTime() > WORKER_WAIT_WARNING_MS) {
    return 'Still waiting for the audio worker. Check that the worker service is running on Railway.'
  }
  return null
}
