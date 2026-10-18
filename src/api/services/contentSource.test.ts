import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const api = vi.hoisted(() => ({ get: vi.fn() }))

vi.mock('@/api/client', () => ({ apiClient: api }))

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

const CACHE_KEY = 'foxsensei:public-content:v1:%2Fcontent%2Fkana%2Fhiragana'
const path = '/content/kana/hiragana'
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window')

function isContent(value: { title?: unknown }): value is { title: string } {
  return typeof value.title === 'string'
}

describe('public content cache', () => {
  let storage: MemoryStorage

  beforeEach(() => {
    vi.resetModules()
    api.get.mockReset()
    storage = new MemoryStorage()
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { localStorage: storage } })
  })

  afterEach(() => {
    if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow)
    else Reflect.deleteProperty(globalThis, 'window')
  })

  it('uses a fresh valid course payload from localStorage without a request', async () => {
    storage.setItem(CACHE_KEY, JSON.stringify({ cachedAt: Date.now(), data: { title: 'Hiragana' }, strokesBaseUrl: null }))
    const bundled = vi.fn(async () => ({ title: 'Bundled' }))
    const { loadContent } = await import('./contentSource')

    await expect(loadContent(path, bundled, isContent)).resolves.toEqual({ title: 'Hiragana' })
    expect(api.get).not.toHaveBeenCalled()
    expect(bundled).not.toHaveBeenCalled()
  })

  it('persists a valid API course response for the next visit', async () => {
    api.get.mockResolvedValue({ data: { title: 'Hiragana', strokes_base_url: 'https://cdn.example.test/' } })
    const { getStrokesBaseUrl, loadContent } = await import('./contentSource')

    await expect(loadContent(path, async () => ({ title: 'Bundled' }), isContent)).resolves.toEqual({ title: 'Hiragana' })
    expect(getStrokesBaseUrl()).toBe('https://cdn.example.test')
    expect(JSON.parse(storage.getItem(CACHE_KEY) ?? '{}')).toMatchObject({
      data: { title: 'Hiragana' },
      strokesBaseUrl: 'https://cdn.example.test',
    })
  })

  it('uses an expired valid course payload when the network and bundled load both cannot provide newer content', async () => {
    storage.setItem(CACHE_KEY, JSON.stringify({
      cachedAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
      data: { title: 'Saved lesson' },
      strokesBaseUrl: null,
    }))
    api.get.mockRejectedValue(new Error('offline'))
    const bundled = vi.fn(async () => {
      throw new Error('bundle unavailable')
    })
    const { loadContent } = await import('./contentSource')

    await expect(loadContent(path, bundled, isContent)).resolves.toEqual({ title: 'Saved lesson' })
    expect(bundled).not.toHaveBeenCalled()
  })
})
