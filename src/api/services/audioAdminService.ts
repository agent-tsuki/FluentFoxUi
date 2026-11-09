/**
 * Audio admin service (super-admins only): choose each voice key's engine
 * style, hear a style before choosing it, and queue work for the audio
 * worker (generate missing clips, install a voice model).
 */
import { apiClient } from '@/api/client'
import type { ApiResponse } from '@/types/api'
import type {
  AdminVoice,
  ApiAdminVoice,
  ApiAudioJob,
  ApiEngineStatus,
  AudioJob,
  EngineStatus,
  NewAudioJob,
} from '@/types/audioAdmin'

const enc = encodeURIComponent

export function toAdminVoice(v: ApiAdminVoice): AdminVoice {
  return {
    key: v.key,
    fromEnv: v.from_env,
    profile: v.profile,
    styleId: v.style_id,
    speakerName: v.speaker_name,
    styleName: v.style_name,
    credit: v.credit,
    updatedAt: v.updated_at,
    texts: v.texts,
    clips: v.clips,
    ready: v.ready,
  }
}

export function toAudioJob(j: ApiAudioJob): AudioJob {
  return {
    id: j.id,
    kind: j.kind,
    status: j.status,
    voiceKey: j.voice_key,
    modelUuid: j.model_uuid,
    total: j.total,
    done: j.done,
    failed: j.failed,
    error: j.error,
    createdAt: j.created_at,
    startedAt: j.started_at,
    finishedAt: j.finished_at,
    alive: j.alive,
  }
}

export const audioAdminService = {
  async listVoices(): Promise<AdminVoice[]> {
    const res = await apiClient.get<ApiResponse<{ voices: ApiAdminVoice[] | null }>>('/admin/audio/voices')
    return (res.data.voices ?? []).map(toAdminVoice)
  },

  /** Gives the key another style; its clips in that style are made afresh. */
  async setVoice(key: string, styleId: number): Promise<AdminVoice> {
    const res = await apiClient.put<ApiResponse<ApiAdminVoice>>(`/admin/audio/voices/${enc(key)}`, { style_id: styleId })
    return toAdminVoice(res.data)
  },

  async getEngine(): Promise<EngineStatus> {
    const res = await apiClient.get<ApiResponse<ApiEngineStatus>>('/admin/audio/engine')
    const e = res.data
    return {
      configured: e.configured,
      reachable: e.reachable,
      engine: e.engine,
      version: e.version,
      speakers: (e.speakers ?? []).map((s) => ({ name: s.name, speakerUuid: s.speaker_uuid, styles: s.styles ?? [] })),
    }
  },

  /** A playable data URL of the text in this style (not stored anywhere). */
  async preview(styleId: number, text: string): Promise<string> {
    const res = await apiClient.post<ApiResponse<{ content_type: string; audio: string }>>('/admin/audio/preview', {
      style_id: styleId,
      text,
    })
    return `data:${res.data.content_type};base64,${res.data.audio}`
  },

  async listJobs(): Promise<AudioJob[]> {
    const res = await apiClient.get<ApiResponse<{ jobs: ApiAudioJob[] | null }>>('/admin/audio/jobs')
    return (res.data.jobs ?? []).map(toAudioJob)
  },

  async createJob(job: NewAudioJob): Promise<AudioJob> {
    const body = job.kind === 'generate' ? { kind: job.kind, voice_key: job.voiceKey } : { kind: job.kind, model_uuid: job.modelUuid }
    const res = await apiClient.post<ApiResponse<ApiAudioJob>>('/admin/audio/jobs', body)
    return toAudioJob(res.data)
  },

  async cancelJob(id: string): Promise<void> {
    await apiClient.post(`/admin/audio/jobs/${enc(id)}/cancel`)
  },
}
