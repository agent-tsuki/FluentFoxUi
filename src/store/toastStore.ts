/**
 * App-wide toasts (bottom-right notices). Any code can call `showToast`; the
 * single <Toaster /> in the app shell renders them. A toast with the same
 * title replaces the earlier one, so repeated clicks never stack duplicates.
 */
import { create } from 'zustand'

export interface ToastAction {
  label: string
  /** Router path. */
  to: string
}

export interface Toast {
  id: number
  tone: 'info' | 'error'
  title: string
  message?: string
  actions?: ToastAction[]
}

interface ToastState {
  toasts: Toast[]
  show: (toast: Omit<Toast, 'id'>) => number
  dismiss: (id: number) => void
}

/** At most this many at once; the oldest goes first. */
const MAX_TOASTS = 3
let nextId = 1

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  show: (toast) => {
    const id = nextId++
    set((s) => ({ toasts: [...s.toasts.filter((t) => t.title !== toast.title), { ...toast, id }].slice(-MAX_TOASTS) }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function showToast(toast: Omit<Toast, 'id'>): number {
  return useToastStore.getState().show(toast)
}
