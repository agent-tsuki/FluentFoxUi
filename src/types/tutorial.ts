/** In-app tutorials (GET/PUT /profile/tutorials). */
export type TutorialStatus = 'pending' | 'skipped' | 'completed'

/** Tutorials the API knows; add a key on both sides before shipping a tour. */
export type TutorialKey = 'welcome'

export interface TutorialState {
  key: TutorialKey
  status: TutorialStatus
  /** Tutorial version the status is for; a newer tour shows again. */
  version: number
  /** Step the learner skipped or stopped at, from 0. */
  lastStep: number | null
  completedAt: string | null
  /** Null while the learner has never touched it. */
  updatedAt: string | null
}

export interface TutorialUpdate {
  status: TutorialStatus
  version: number
  lastStep?: number
}
