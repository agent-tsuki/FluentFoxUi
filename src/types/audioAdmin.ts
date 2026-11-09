/** Super-admin Audio page: the voice cast, the voice engine and the audio worker's jobs. */

/** A voice key (main, or a listening cast key such as f1) and how much of its audio exists. */
export interface AdminVoice {
  key: string
  /** No cast row: the server's env voice speaks it. */
  fromEnv: boolean
  /** Clip folder, e.g. aivisspeech-888753760. */
  profile: string
  styleId?: number
  speakerName?: string
  styleName?: string
  credit?: string
  updatedAt?: string
  /** Course texts this voice speaks. */
  texts: number
  /** Clips those texts need (one per sentence), and how many are stored. */
  clips: number
  ready: number
}

export interface EngineStyle {
  id: number
  name: string
}

export interface EngineSpeaker {
  name: string
  speakerUuid: string
  styles: EngineStyle[]
}

export interface EngineStatus {
  configured: boolean
  reachable: boolean
  engine: string
  version?: string
  speakers: EngineSpeaker[]
}

export type AudioJobKind = 'generate' | 'install_model'
export type AudioJobStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

export interface AudioJob {
  id: string
  kind: AudioJobKind
  status: AudioJobStatus
  voiceKey?: string
  modelUuid?: string
  total: number
  done: number
  failed: number
  error?: string
  createdAt: string
  startedAt?: string
  finishedAt?: string
  /** False for a running job its worker stopped marking (the worker is down). */
  alive: boolean
}

export type NewAudioJob = { kind: 'generate'; voiceKey?: string } | { kind: 'install_model'; modelUuid: string }

/* API shapes (snake_case). */

export interface ApiAdminVoice {
  key: string
  from_env: boolean
  profile: string
  style_id?: number
  speaker_name?: string
  style_name?: string
  credit?: string
  updated_at?: string
  texts: number
  clips: number
  ready: number
}

export interface ApiEngineStatus {
  configured: boolean
  reachable: boolean
  engine: string
  version?: string
  speakers: { name: string; speaker_uuid: string; styles: EngineStyle[] }[] | null
}

export interface ApiAudioJob {
  id: string
  kind: AudioJobKind
  status: AudioJobStatus
  voice_key?: string
  model_uuid?: string
  total: number
  done: number
  failed: number
  error?: string
  created_at: string
  started_at?: string
  finished_at?: string
  alive: boolean
}
