import { describe, expect, it } from 'vitest'
import { findStyle, jobTitle, voiceKeyLabel, voiceName, workerWarning } from './audio'
import type { AdminVoice, AudioJob } from '@/types/audioAdmin'

const voice = (over: Partial<AdminVoice>): AdminVoice => ({ key: 'f1', fromEnv: false, profile: 'aivisspeech-1', texts: 0, clips: 0, ready: 0, ...over })
const job = (over: Partial<AudioJob>): AudioJob => ({
  id: 'j1',
  kind: 'generate',
  status: 'queued',
  total: 0,
  done: 0,
  failed: 0,
  createdAt: '2026-11-09T10:00:00Z',
  alive: true,
  ...over,
})

describe('voice labels', () => {
  it.each([
    ['main', 'Main voice (words, examples)'],
    ['f2', 'Female 2'],
    ['m5', 'Male 5'],
    ['narrator', 'narrator'],
  ])('%s -> %s', (key, label) => {
    expect(voiceKeyLabel(key)).toBe(label)
  })

  it('names a cast voice by speaker and style, and an env voice by its folder', () => {
    expect(voiceName(voice({ speakerName: 'まお', styleName: 'ノーマル' }))).toBe('まお · ノーマル')
    expect(voiceName(voice({ key: 'main', fromEnv: true, profile: 'voicevox-14' }))).toBe('Server default (voicevox-14)')
  })
})

describe('findStyle', () => {
  const speakers = [{ name: 'まお', speakerUuid: 's1', styles: [{ id: 1, name: 'ノーマル' }, { id: 2, name: 'あまあま' }] }]
  it('finds the speaker of a style', () => {
    expect(findStyle(speakers, 2)).toEqual({ speaker: speakers[0], style: 'あまあま' })
    expect(findStyle(speakers, 9)).toBeNull()
  })
})

describe('jobs', () => {
  it('titles each kind of job', () => {
    expect(jobTitle(job({ voiceKey: 'm1' }))).toBe('Generate male 1 (m1)')
    expect(jobTitle(job({}))).toBe('Generate every voice')
    expect(jobTitle(job({ kind: 'install_model', modelUuid: '1f04a608-916c' }))).toBe('Install model 1f04a608')
  })

  it('warns when no worker picks a job up, or a running job goes quiet', () => {
    const created = new Date('2026-11-09T10:00:00Z').getTime()
    expect(workerWarning(job({}), created + 10_000)).toBeNull()
    expect(workerWarning(job({}), created + 120_000)).toMatch(/worker/)
    expect(workerWarning(job({ status: 'running', alive: false }), created)).toMatch(/stopped reporting/)
    expect(workerWarning(job({ status: 'done' }), created + 999_999)).toBeNull()
  })
})
