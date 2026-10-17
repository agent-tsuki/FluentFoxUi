/**
 * `/learn/*` API client (backend plan §7.2). Every call needs login and a
 * verified email; apiClient attaches the token and handles refresh.
 * Methods unwrap the `{status, data}` envelope.
 *
 * Answers normally go through the answer queue (src/api/answerQueue.ts),
 * which batches them and calls `submitAnswers` / `submitAnswersKeepalive`.
 */
import { apiClient } from '@/api/client'
import { API_BASE } from '@/lib/config'
import { getAccessToken } from '@/store/authStore'
import type { ApiResponse } from '@/types/api'
import type {
  AnswerRequestItem,
  AnswerResultItem,
  KanjiNote,
  LearnSummary,
  LearningSettings,
  LearningSettingsUpdate,
  LearningTrack,
  SessionResult,
  SessionStart,
  StartLessonRequest,
  StartPracticeRequest,
  StartReviewRequest,
  StartTestRequest,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  TestHistory,
  TestHistoryEntry,
  UnitProgressData,
  UnitProgressList,
  UnitProgressRequest,
  UnitType,
} from '@/types/learn'

async function get<T>(path: string): Promise<T> {
  return (await apiClient.get<ApiResponse<T>>(path)).data
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return (await apiClient.post<ApiResponse<T>>(path, body)).data
}

async function put<T>(path: string, body: unknown): Promise<T> {
  return (await apiClient.put<ApiResponse<T>>(path, body)).data
}

function sessionPath(sessionId: string): string {
  return `/learn/sessions/${encodeURIComponent(sessionId)}`
}

function answersPath(sessionId: string): string {
  return `${sessionPath(sessionId)}/answers`
}

export const learnService = {
  getSummary(track?: LearningTrack): Promise<LearnSummary> {
    return get(track ? `/learn/summary?track=${encodeURIComponent(track)}` : '/learn/summary')
  },

  startLesson(req: StartLessonRequest): Promise<SessionStart> {
    return post('/learn/lessons', req)
  },

  startReview(req: StartReviewRequest = {}): Promise<SessionStart> {
    return post('/learn/reviews', req)
  },

  startPractice(req: StartPracticeRequest): Promise<SessionStart> {
    return post('/learn/practice', req)
  },

  startTest(req: StartTestRequest): Promise<SessionStart> {
    return post('/learn/tests', req)
  },

  /** 1–50 answers. Idempotent per `client_event_id`: a resend returns the stored result. */
  async submitAnswers(sessionId: string, answers: AnswerRequestItem[]): Promise<AnswerResultItem[]> {
    const body: SubmitAnswersRequest = { answers }
    const res = await post<SubmitAnswersResponse>(answersPath(sessionId), body)
    return res.results
  },

  /**
   * Same endpoint as `submitAnswers`, sent with `fetch(keepalive)` so it
   * survives the tab being hidden or closed. It bypasses apiClient because a
   * token refresh cannot finish while the page unloads; a refused or lost
   * request is harmless, as the queue keeps the answers and resends them.
   * Resolves null when there is no token or the response is not a success.
   */
  async submitAnswersKeepalive(sessionId: string, answers: AnswerRequestItem[]): Promise<AnswerResultItem[] | null> {
    const token = getAccessToken()
    if (!token) return null
    const body: SubmitAnswersRequest = { answers }
    const res = await fetch(`${API_BASE}${answersPath(sessionId)}`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return null
    const json = (await res.json().catch(() => null)) as ApiResponse<SubmitAnswersResponse> | null
    return json?.status === 'success' ? json.data.results : null
  },

  completeSession(sessionId: string): Promise<SessionResult> {
    return post(`${sessionPath(sessionId)}/complete`)
  },

  async getTestHistory(track?: LearningTrack): Promise<TestHistoryEntry[]> {
    const path = track ? `/learn/tests/history?track=${encodeURIComponent(track)}` : '/learn/tests/history'
    return (await get<TestHistory>(path)).tests
  },

  getSettings(): Promise<LearningSettings> {
    return get('/learn/settings')
  },

  updateSettings(update: LearningSettingsUpdate): Promise<LearningSettings> {
    return put('/learn/settings', update)
  },

  async getUnits(track: LearningTrack): Promise<UnitProgressData[]> {
    return (await get<UnitProgressList>(`/learn/units?track=${encodeURIComponent(track)}`)).units
  },

  /** `unitSlug` is the content API's unit id; hiragana and katakana share slugs, so the track goes along. */
  updateUnitProgress(unitType: UnitType, unitSlug: string, track: LearningTrack, req: UnitProgressRequest): Promise<UnitProgressData> {
    const path = `/learn/units/${encodeURIComponent(unitType)}/${encodeURIComponent(unitSlug)}/progress`
    return put(`${path}?track=${encodeURIComponent(track)}`, req)
  },

  getKanjiNote(char: string): Promise<KanjiNote> {
    return get(`/learn/kanji/${encodeURIComponent(char)}/note`)
  },

  updateKanjiNote(char: string, text: string): Promise<KanjiNote> {
    return put(`/learn/kanji/${encodeURIComponent(char)}/note`, { text })
  },
}
